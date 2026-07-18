import { advanceGame, answerCurrent, createGame } from './game-state.js';
import { filterJokes } from './joke-engine.js';
import { copyShareText, formatShareText } from './share.js';
import { toggleFavorite } from './storage.js';

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderSoundButton(audioSupported, soundEnabled) {
  if (!audioSupported) return '';
  const enabled = soundEnabled === true;
  return `
    <button class="text-button" type="button" data-action="toggle-sound" aria-pressed="${enabled}">
      <span aria-hidden="true">${enabled ? '♬' : '♩'}</span>
      音效${enabled ? '已開啟' : '已關閉'}
    </button>
  `;
}

export function renderLobby({ profile, audioSupported = false, categories = [] }) {
  const categoryOverview = categories
    .map(({ name }) => `<li>${escapeHtml(name)}</li>`)
    .join('');
  return `
    <section class="lobby screen-enter" aria-labelledby="lobby-title">
      <header class="lobby__header">
        <div>
          <p class="eyebrow">MOONLIT PUNCHLINE · 今宵營業中</p>
          <h1 id="lobby-title" tabindex="-1">月下<br><span>冷梗旅店</span></h1>
          <p class="lobby__intro">世界上的冷笑話，都在月色最安靜的時候來投宿。</p>
        </div>
        <div class="cold-meter" aria-label="今日體感冷度零下七度">
          <span class="cold-meter__moon" aria-hidden="true"></span>
          <span>今日體感</span>
          <strong>−7°C</strong>
          <small>適合說一個很冷的笑話</small>
        </div>
      </header>
      <div class="lobby__records" aria-label="你的旅店紀錄">
        <p><span>最佳分數</span><strong>${profile.bestScore}</strong></p>
        <p><span>最高連勝</span><strong>${profile.bestStreak}</strong></p>
        <p><span>收藏房牌</span><strong>${profile.favorites.length}</strong></p>
      </div>
      <div class="mode-doors">
        <button class="mode-door mode-door--challenge" type="button" data-action="open-challenge">
          <span class="room-tag">壹 · 挑戰之間</span>
          <strong>入住挑戰房</strong>
          <span>十題四選一，看看你能在零下幾度保持清醒。</span>
          <span class="door-action">開始入住 <b aria-hidden="true">→</b></span>
        </button>
        <button class="mode-door mode-door--gallery" type="button" data-action="open-gallery">
          <span class="room-tag">貳 · 放映之間</span>
          <strong>走進放映室</strong>
          <span>不計分，慢慢翻閱六間房的世界冷梗。</span>
          <span class="door-action">隨意看看 <b aria-hidden="true">→</b></span>
        </button>
      </div>
      <div class="lobby-guide">
        <details>
          <summary>玩法說明</summary>
          <p>挑戰房每局十題，答對可累積分數與連勝；放映室不計分，可自由翻牌、收藏與分享。</p>
        </details>
        <section aria-labelledby="category-overview-title">
          <h2 id="category-overview-title">六間冷梗房</h2>
          <ul>${categoryOverview}</ul>
        </section>
      </div>
      <footer class="lobby__footer">
        ${renderSoundButton(audioSupported, profile.soundEnabled)}
        <button class="text-button" type="button" data-action="clear-profile">清除本機紀錄</button>
        <span>本館共 72 則冷梗 · 全齡友善</span>
      </footer>
    </section>
  `;
}

export function renderChallenge(state) {
  const joke = state.questions[state.index];
  const feedback = state.answered
    ? `
      <div id="answer-feedback" class="answer-feedback ${state.lastAnswerCorrect ? 'is-correct' : 'is-wrong'}" tabindex="-1">
        <span class="stamp">${state.lastAnswerCorrect ? '冷得漂亮' : '再冷一點'}</span>
        <h3>${state.lastAnswerCorrect ? '答對了' : `答案是：${escapeHtml(joke.answer)}`}</h3>
        <p>${escapeHtml(joke.note)}</p>
        <small>冷梗來源 · ${escapeHtml(joke.region)}</small>
      </div>
    `
    : '<p id="answer-feedback" class="answer-hint">選一個最可能把房間降溫的答案。</p>';

  const choices = joke.choices
    .map(({ text, correct }, index) => {
      const selected = state.selectedAnswer === text;
      const resultClass = state.answered
        ? correct
          ? ' is-correct'
          : selected
            ? ' is-wrong'
            : ''
        : '';
      const marker = String.fromCharCode(65 + index);
      const resultText = state.answered
        ? correct
          ? '正確答案'
          : selected
            ? '你的答案 · 錯誤'
            : ''
        : '';
      return `
        <button class="answer-option${resultClass}" type="button" data-action="answer"
          data-answer="${escapeHtml(text)}" aria-describedby="answer-feedback"
          ${state.answered ? 'disabled' : ''}>
          <span aria-hidden="true">${marker}</span>
          <strong>${escapeHtml(text)}</strong>
          ${resultText ? `<em>${resultText}</em>` : ''}
        </button>
      `;
    })
    .join('');

  return `
    <section class="challenge screen-enter" aria-labelledby="challenge-title">
      <nav class="screen-nav" aria-label="挑戰操作">
        <button class="back-button" type="button" data-action="go-lobby">← 返回大廳</button>
        <span>入住編號 ${String(state.index + 1).padStart(2, '0')}</span>
      </nav>
      <div class="challenge__status">
        <p><span>題次</span><strong>第 ${state.index + 1} 題／共 ${state.questions.length} 題</strong></p>
        <p><span>分數</span><strong>${state.score}</strong></p>
        <p><span>連勝</span><strong>${state.streak}</strong></p>
      </div>
      <article class="question-paper">
        <div class="question-paper__meta">
          <span class="room-tag">體感冷度 · ${joke.difficulty + 4} 級</span>
          <span>${escapeHtml(joke.region)}</span>
        </div>
        <h2 id="challenge-title" tabindex="-1">${escapeHtml(joke.question)}</h2>
        <div class="answer-grid">${choices}</div>
        ${feedback}
        ${
          state.answered
            ? `<button class="primary-button" type="button" data-action="next-question">${
                state.index === state.questions.length - 1 ? '查看退房報告' : '下一題 →'
              }</button>`
            : ''
        }
      </article>
    </section>
  `;
}

export function renderResults(state, profile = { favorites: [] }) {
  const lastJoke = state.questions[state.questions.length - 1];
  const favorite = profile.favorites.includes(lastJoke.id);
  return `
    <section class="results screen-enter" aria-labelledby="results-title">
      <p class="eyebrow">CHECK-OUT REPORT · 退房冷度報告</p>
      <span class="result-moon" aria-hidden="true"></span>
      <h1 id="results-title" tabindex="-1">今夜，冷得很有成績。</h1>
      <div class="result-grid">
        <p><span>總分</span><strong>${state.score}</strong></p>
        <p><span>答對</span><strong>${state.correctCount}／${state.questions.length}</strong></p>
        <p><span>最高連勝</span><strong>${state.bestStreak}</strong></p>
      </div>
      <button class="result-favorite" type="button" data-action="toggle-result-favorite"
        aria-pressed="${favorite}">
        <span aria-hidden="true">${favorite ? '●' : '○'}</span>
        ${favorite ? '最後一題已收藏' : '收藏最後一題'}
      </button>
      <div class="result-actions">
        <button class="primary-button" type="button" data-action="restart">再住一晚</button>
        <button class="secondary-button" type="button" data-action="go-lobby">返回大廳</button>
      </div>
    </section>
  `;
}

export function createGalleryState(jokes, profile) {
  return {
    category: 'all',
    visibleJokes: filterJokes(jokes, 'all', profile.favorites),
    index: 0,
    revealed: false,
    manualCopyText: ''
  };
}

function renderGalleryFilters(categories, activeCategory) {
  const filters = [
    { id: 'all', name: '全部房間' },
    ...categories.map(({ id, name }) => ({ id, name })),
    { id: 'favorites', name: '我的收藏' }
  ];
  return filters
    .map(
      ({ id, name }) => `
        <button class="filter-button" type="button" data-action="set-category"
          data-category="${id}" aria-pressed="${activeCategory === id}">
          ${escapeHtml(name)}
        </button>
      `
    )
    .join('');
}

export function renderGallery({ gallery, categories, profile }) {
  const filters = renderGalleryFilters(categories, gallery.category);
  if (!gallery.visibleJokes.length) {
    return `
      <section class="gallery screen-enter" aria-labelledby="gallery-title">
        <nav class="screen-nav" aria-label="放映室操作">
          <button class="back-button" type="button" data-action="go-lobby">← 返回大廳</button>
          <span>冷梗放映室</span>
        </nav>
        <h1 id="gallery-title" tabindex="-1">今晚想看哪一間？</h1>
        <div class="gallery-filters" aria-label="題庫分類">${filters}</div>
        <div class="empty-state">
          <span aria-hidden="true">○</span>
          <h2>這裡還沒有收藏</h2>
          <p>先回到全部房間，遇到喜歡的冷梗就替它掛上房牌。</p>
          <button class="primary-button" type="button" data-action="set-category" data-category="all">看看全部冷梗</button>
        </div>
      </section>
    `;
  }

  const joke = gallery.visibleJokes[gallery.index];
  const favorite = profile.favorites.includes(joke.id);
  const answer = gallery.revealed
    ? `
      <div class="gallery-card__answer" id="gallery-answer" tabindex="-1">
        <p class="eyebrow">今晚的答案</p>
        <h2>${escapeHtml(joke.answer)}</h2>
        <p>${escapeHtml(joke.note)}</p>
        <small>${escapeHtml(joke.region)} · 冷度 ${joke.difficulty}／3</small>
      </div>
    `
    : `
      <button class="reveal-button" type="button" data-action="flip-card">
        <span aria-hidden="true">月</span>
        翻牌看答案
      </button>
    `;
  const copyFallback = gallery.manualCopyText
    ? `
      <section class="copy-fallback" aria-labelledby="copy-title">
        <h2 id="copy-title">請手動複製這則冷梗</h2>
        <textarea id="copy-text" readonly>${escapeHtml(gallery.manualCopyText)}</textarea>
        <button class="secondary-button" type="button" data-action="close-copy">關閉</button>
      </section>
    `
    : '';

  return `
    <section class="gallery screen-enter" aria-labelledby="gallery-title">
      <nav class="screen-nav" aria-label="放映室操作">
        <button class="back-button" type="button" data-action="go-lobby">← 返回大廳</button>
        <span>房牌 ${String(gallery.index + 1).padStart(2, '0')}／${String(gallery.visibleJokes.length).padStart(2, '0')}</span>
      </nav>
      <header class="gallery__header">
        <div>
          <p class="eyebrow">THE COLD ROOM · 自由放映</p>
          <h1 id="gallery-title" tabindex="-1">今晚想看哪一間？</h1>
        </div>
        <p>不計時，也不計分。<br>讓笑點自己慢慢降溫。</p>
      </header>
      <div class="gallery-filters" aria-label="題庫分類">${filters}</div>
      <article class="gallery-card">
        <div class="gallery-card__question">
          <span class="room-tag">${escapeHtml(categories.find(({ id }) => id === joke.category)?.name || joke.category)}</span>
          <p class="gallery-card__number">NO. ${escapeHtml(joke.id.toUpperCase())}</p>
          <h2>${escapeHtml(joke.question)}</h2>
          ${answer}
        </div>
        <aside class="gallery-card__controls" aria-label="冷梗操作">
          <button type="button" data-action="toggle-favorite" aria-pressed="${favorite}">
            <span aria-hidden="true">${favorite ? '●' : '○'}</span>
            ${favorite ? '已收藏' : '收藏這則'}
          </button>
          <button type="button" data-action="copy-joke">複製分享文字</button>
          <button type="button" data-action="random-joke">隨機換一則</button>
        </aside>
      </article>
      <div class="gallery-pagination">
        <button class="secondary-button" type="button" data-action="previous-joke">← 上一則</button>
        <button class="secondary-button" type="button" data-action="next-joke">下一則 →</button>
      </div>
      ${copyFallback}
    </section>
  `;
}

export function createApp({
  document,
  jokes,
  categories = [],
  store,
  audio,
  clipboard,
  random = Math.random
}) {
  const shell = document.querySelector('#app-shell');
  const liveRegion = document.querySelector('#live-region');
  const toastRegion = document.querySelector('#toast-region');
  let profile = store.load();
  let view = 'lobby';
  let game = null;
  let gallery = null;
  audio.setEnabled(profile.soundEnabled);

  function announce(message, showToast = false) {
    if (liveRegion) liveRegion.textContent = message;
    if (showToast && toastRegion) {
      toastRegion.textContent = message;
      toastRegion.classList.add('is-visible');
      setTimeout(() => {
        toastRegion.classList.remove('is-visible');
      }, 2400);
    }
  }

  function persistProfile(nextProfile) {
    profile = nextProfile;
    const saved = store.save(profile);
    if (!saved) announce('目前使用暫存模式，關閉分頁後紀錄不會保留。', true);
  }

  function render() {
    if (view === 'challenge') shell.innerHTML = renderChallenge(game);
    else if (view === 'results') shell.innerHTML = renderResults(game, profile);
    else if (view === 'gallery') shell.innerHTML = renderGallery({ gallery, categories, profile });
    else {
      shell.innerHTML = renderLobby({
        profile,
        audioSupported: audio.supported,
        categories
      });
    }
    shell.querySelector('[tabindex="-1"]')?.focus({ preventScroll: true });
  }

  function setGalleryCategory(category) {
    gallery = {
      ...gallery,
      category,
      visibleJokes: filterJokes(jokes, category, profile.favorites),
      index: 0,
      revealed: false,
      manualCopyText: ''
    };
    persistProfile({ ...profile, preferredCategory: category });
  }

  function markGalleryViewed() {
    const joke = gallery?.visibleJokes[gallery.index];
    if (joke && !profile.viewed.includes(joke.id)) {
      persistProfile({ ...profile, viewed: [...profile.viewed, joke.id] });
    }
  }

  shell.addEventListener('click', async (event) => {
    const trigger = event.target.closest('[data-action]');
    if (!trigger) return;
    const action = trigger.dataset.action;
    if (action === 'open-challenge' || action === 'restart') {
      game = createGame(jokes, random);
      view = 'challenge';
    } else if (action === 'open-gallery') {
      gallery = createGalleryState(jokes, profile);
      setGalleryCategory(profile.preferredCategory || 'all');
      if (!gallery.visibleJokes.length) setGalleryCategory('all');
      view = 'gallery';
      markGalleryViewed();
    } else if (action === 'answer') {
      game = answerCurrent(game, trigger.dataset.answer);
      audio.play(game.lastAnswerCorrect ? 'correct' : 'wrong');
      if (liveRegion) {
        liveRegion.textContent = game.lastAnswerCorrect
          ? '答對了。已顯示笑點說明。'
          : `答錯了。正確答案是${game.questions[game.index].answer}。`;
      }
    } else if (action === 'next-question') {
      game = advanceGame(game);
      if (game.finished) {
        view = 'results';
        persistProfile({
          ...profile,
          bestScore: Math.max(profile.bestScore, game.score),
          bestStreak: Math.max(profile.bestStreak, game.bestStreak),
          viewed: [...new Set([...profile.viewed, ...game.questions.map(({ id }) => id)])]
        });
      }
    } else if (action === 'go-lobby') {
      view = 'lobby';
    } else if (action === 'toggle-result-favorite') {
      const lastJoke = game.questions[game.questions.length - 1];
      persistProfile(toggleFavorite(profile, lastJoke.id));
      if (liveRegion) {
        liveRegion.textContent = profile.favorites.includes(lastJoke.id)
          ? '最後一題已收藏。'
          : '最後一題已取消收藏。';
      }
    } else if (action === 'set-category') {
      setGalleryCategory(trigger.dataset.category);
      markGalleryViewed();
    } else if (action === 'flip-card') {
      gallery = { ...gallery, revealed: true };
      audio.play('flip');
      if (liveRegion) liveRegion.textContent = '答案已揭曉。';
    } else if (action === 'previous-joke' || action === 'next-joke') {
      const direction = action === 'previous-joke' ? -1 : 1;
      const length = gallery.visibleJokes.length;
      gallery = {
        ...gallery,
        index: (gallery.index + direction + length) % length,
        revealed: false,
        manualCopyText: ''
      };
      markGalleryViewed();
    } else if (action === 'random-joke') {
      const length = gallery.visibleJokes.length;
      const offset = length > 1 ? 1 + Math.floor(random() * (length - 1)) : 0;
      gallery = {
        ...gallery,
        index: (gallery.index + offset) % length,
        revealed: false,
        manualCopyText: ''
      };
      markGalleryViewed();
    } else if (action === 'toggle-favorite') {
      const joke = gallery.visibleJokes[gallery.index];
      persistProfile(toggleFavorite(profile, joke.id));
      if (gallery.category === 'favorites') {
        const visibleJokes = filterJokes(jokes, 'favorites', profile.favorites);
        gallery = {
          ...gallery,
          visibleJokes,
          index: Math.min(gallery.index, Math.max(0, visibleJokes.length - 1)),
          revealed: false
        };
      }
      if (liveRegion) liveRegion.textContent = profile.favorites.includes(joke.id) ? '已收藏。' : '已取消收藏。';
    } else if (action === 'copy-joke') {
      const joke = gallery.visibleJokes[gallery.index];
      const result = await copyShareText(formatShareText(joke), clipboard);
      gallery = { ...gallery, manualCopyText: result.copied ? '' : result.text };
      announce(
        result.copied ? '分享文字已複製。' : '無法自動複製，已顯示手動複製欄位。',
        true
      );
    } else if (action === 'close-copy') {
      gallery = { ...gallery, manualCopyText: '' };
    } else if (action === 'toggle-sound') {
      const soundEnabled = audio.setEnabled(!audio.enabled);
      persistProfile({ ...profile, soundEnabled });
      if (soundEnabled) audio.play('flip');
    } else if (action === 'clear-profile') {
      const cleared = store.clear();
      profile = store.load();
      announce(
        cleared ? '本機紀錄已清除。' : '無法清除瀏覽器紀錄，已切換為暫存模式。',
        true
      );
    }
    render();
    if (view === 'gallery' && gallery?.revealed) {
      shell.querySelector('#gallery-answer')?.focus({ preventScroll: true });
    }
    if (gallery?.manualCopyText) {
      const textarea = shell.querySelector('#copy-text');
      textarea?.focus();
      textarea?.select();
    }
  });

  render();
  return { render };
}
