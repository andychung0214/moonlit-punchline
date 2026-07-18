import { advanceGame, answerCurrent, createGame } from './game-state.js';

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
  return `
    <button class="text-button" type="button" data-action="toggle-sound" aria-pressed="${soundEnabled}">
      <span aria-hidden="true">${soundEnabled ? '♬' : '♩'}</span>
      音效${soundEnabled ? '已開啟' : '已關閉'}
    </button>
  `;
}

export function renderLobby({ profile, audioSupported = false }) {
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
      return `
        <button class="answer-option${resultClass}" type="button" data-action="answer"
          data-answer="${escapeHtml(text)}" aria-describedby="answer-feedback"
          ${state.answered ? 'disabled' : ''}>
          <span aria-hidden="true">${marker}</span>
          <strong>${escapeHtml(text)}</strong>
          ${state.answered && correct ? '<em>正解</em>' : ''}
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
        ${state.answered ? '<button class="primary-button" type="button" data-action="next-question">下一題 →</button>' : ''}
      </article>
    </section>
  `;
}

export function renderResults(state) {
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
      <div class="result-actions">
        <button class="primary-button" type="button" data-action="restart">再住一晚</button>
        <button class="secondary-button" type="button" data-action="go-lobby">返回大廳</button>
      </div>
    </section>
  `;
}

export function createApp({ document, jokes, store, audio, random = Math.random }) {
  const shell = document.querySelector('#app-shell');
  const liveRegion = document.querySelector('#live-region');
  let profile = store.load();
  let view = 'lobby';
  let game = null;
  audio.setEnabled(profile.soundEnabled);

  function persistProfile(nextProfile) {
    profile = nextProfile;
    const saved = store.save(profile);
    if (!saved && liveRegion) {
      liveRegion.textContent = '目前使用暫存模式，關閉分頁後紀錄不會保留。';
    }
  }

  function render() {
    if (view === 'challenge') shell.innerHTML = renderChallenge(game);
    else if (view === 'results') shell.innerHTML = renderResults(game);
    else shell.innerHTML = renderLobby({ profile, audioSupported: audio.supported });
    shell.querySelector('[tabindex="-1"]')?.focus({ preventScroll: true });
  }

  shell.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-action]');
    if (!trigger) return;
    const action = trigger.dataset.action;
    if (action === 'open-challenge' || action === 'restart') {
      game = createGame(jokes, random);
      view = 'challenge';
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
    } else if (action === 'toggle-sound') {
      const soundEnabled = audio.setEnabled(!audio.enabled);
      persistProfile({ ...profile, soundEnabled });
      if (soundEnabled) audio.play('flip');
    } else if (action === 'clear-profile') {
      store.clear();
      profile = store.load();
    }
    render();
  });

  render();
  return { render };
}
