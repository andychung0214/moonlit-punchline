import { buildChoices, sampleUnique } from './joke-engine.js';

export function createGame(jokes, random = Math.random) {
  if (jokes.length < 10) throw new RangeError('開始挑戰至少需要十題');
  const questions = sampleUnique(jokes, 10, random).map((joke) => ({
    ...joke,
    choices: buildChoices(joke, random)
  }));
  return {
    questions,
    index: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correctCount: 0,
    answered: false,
    selectedAnswer: null,
    lastAnswerCorrect: null,
    finished: false
  };
}

export function answerCurrent(state, text) {
  if (state.finished || state.answered) return state;
  const current = state.questions[state.index];
  const correct = text === current.answer;
  const nextStreak = correct ? state.streak + 1 : 0;
  return {
    ...state,
    score: correct ? state.score + 100 + Math.min(nextStreak, 5) * 20 : state.score,
    streak: nextStreak,
    bestStreak: Math.max(state.bestStreak, nextStreak),
    correctCount: state.correctCount + (correct ? 1 : 0),
    answered: true,
    selectedAnswer: text,
    lastAnswerCorrect: correct
  };
}

export function advanceGame(state) {
  if (state.finished || !state.answered) return state;
  if (state.index >= state.questions.length - 1) {
    return { ...state, finished: true };
  }
  return {
    ...state,
    index: state.index + 1,
    answered: false,
    selectedAnswer: null,
    lastAnswerCorrect: null
  };
}
