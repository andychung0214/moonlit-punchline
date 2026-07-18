export const DEFAULT_PROFILE = Object.freeze({
  bestScore: 0,
  bestStreak: 0,
  favorites: Object.freeze([]),
  viewed: Object.freeze([]),
  soundEnabled: false,
  preferredCategory: 'all'
});

const VALID_CATEGORIES = new Set([
  'all',
  'favorites',
  'zh-pun',
  'wordplay',
  'nature',
  'daily-life',
  'world',
  'absurd'
]);

function uniqueStrings(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item) => typeof item === 'string' && item.trim()))];
}

export function normalizeProfile(value = {}) {
  const input = value && typeof value === 'object' ? value : {};
  return {
    bestScore: Number.isFinite(input.bestScore) && input.bestScore >= 0 ? input.bestScore : 0,
    bestStreak: Number.isFinite(input.bestStreak) && input.bestStreak >= 0 ? input.bestStreak : 0,
    favorites: uniqueStrings(input.favorites),
    viewed: uniqueStrings(input.viewed),
    soundEnabled: input.soundEnabled === true,
    preferredCategory: VALID_CATEGORIES.has(input.preferredCategory)
      ? input.preferredCategory
      : 'all'
  };
}

export function toggleFavorite(profile, jokeId) {
  const favorites = new Set(profile.favorites);
  if (favorites.has(jokeId)) favorites.delete(jokeId);
  else favorites.add(jokeId);
  return normalizeProfile({ ...profile, favorites: [...favorites] });
}

export function createProfileStore(storage, key = 'moonlit-punchline-profile') {
  let memory = normalizeProfile();
  let isPersistent = Boolean(storage);

  function load() {
    if (!isPersistent) return normalizeProfile(memory);
    let raw;
    try {
      raw = storage.getItem(key);
    } catch {
      isPersistent = false;
      return normalizeProfile(memory);
    }
    if (!raw) return normalizeProfile(memory);
    try {
      memory = normalizeProfile(JSON.parse(raw));
    } catch {
      memory = normalizeProfile();
      try {
        storage.removeItem(key);
      } catch {
        isPersistent = false;
      }
    }
    return normalizeProfile(memory);
  }

  function save(profile) {
    memory = normalizeProfile(profile);
    if (!isPersistent) return false;
    try {
      storage.setItem(key, JSON.stringify(memory));
      return true;
    } catch {
      isPersistent = false;
      return false;
    }
  }

  function clear() {
    memory = normalizeProfile();
    if (!isPersistent) return false;
    try {
      storage.removeItem(key);
      return true;
    } catch {
      try {
        storage.setItem(key, JSON.stringify(memory));
        return true;
      } catch {
        isPersistent = false;
        return false;
      }
    }
  }

  return {
    load,
    save,
    clear,
    get persistent() {
      return isPersistent;
    }
  };
}
