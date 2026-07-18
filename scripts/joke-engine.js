function shuffled(items, random = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function sampleUnique(items, count, random = Math.random) {
  if (!Array.isArray(items) || !Number.isInteger(count) || count < 0 || count > items.length) {
    throw new RangeError('抽題數量必須是陣列長度內的非負整數');
  }
  return shuffled(items, random).slice(0, count);
}

export function buildChoices(joke, random = Math.random) {
  return shuffled(
    [
      { text: joke.answer, correct: true },
      ...joke.distractors.map((text) => ({ text, correct: false }))
    ],
    random
  );
}

export function filterJokes(jokes, category = 'all', favoriteIds = []) {
  if (category === 'all') return [...jokes];
  if (category === 'favorites') {
    const favorites = new Set(favoriteIds);
    return jokes.filter(({ id }) => favorites.has(id));
  }
  return jokes.filter((joke) => joke.category === category);
}

export function validateJokes(jokes, categoryIds = new Set(jokes.map(({ category }) => category))) {
  const errors = [];
  const seenIds = new Set();
  const seenQuestions = new Set();

  for (const [index, joke] of jokes.entries()) {
    const label = joke?.id || `第 ${index + 1} 題`;
    if (!joke || typeof joke !== 'object') {
      errors.push(`第 ${index + 1} 題不是物件`);
      continue;
    }
    if (seenIds.has(joke.id)) errors.push(`${label} 有重複 ID`);
    if (seenQuestions.has(joke.question)) errors.push(`${label} 有重複問題`);
    seenIds.add(joke.id);
    seenQuestions.add(joke.question);
    if (!categoryIds.has(joke.category)) errors.push(`${label} 分類不存在`);
    for (const field of ['id', 'question', 'answer', 'region', 'note']) {
      if (typeof joke[field] !== 'string' || !joke[field].trim()) {
        errors.push(`${label} 的 ${field} 不可空白`);
      }
    }
    if (!Array.isArray(joke.distractors) || joke.distractors.length !== 3) {
      errors.push(`${label} 必須有三個干擾選項`);
    } else {
      if (new Set(joke.distractors).size !== 3) errors.push(`${label} 干擾選項重複`);
      if (joke.distractors.includes(joke.answer)) errors.push(`${label} 干擾選項含正確答案`);
    }
    if (![1, 2, 3].includes(joke.difficulty)) errors.push(`${label} 難度錯誤`);
  }

  return { valid: errors.length === 0, errors };
}
