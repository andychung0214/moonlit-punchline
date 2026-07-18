export function formatShareText(joke) {
  return `${joke.question}\n答案：${joke.answer}\n—— 月下冷梗旅店`;
}

export async function copyShareText(text, clipboard) {
  if (!clipboard || typeof clipboard.writeText !== 'function') {
    return { copied: false, text };
  }
  try {
    await clipboard.writeText(text);
    return { copied: true, text };
  } catch {
    return { copied: false, text };
  }
}
