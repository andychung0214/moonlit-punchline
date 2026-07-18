export function bootstrap(documentRef = document) {
  const shell = documentRef.querySelector('#app-shell');
  if (!shell) {
    throw new Error('找不到應用程式掛載點');
  }
  shell.dataset.ready = 'true';
}

if (typeof document !== 'undefined') {
  bootstrap();
}
