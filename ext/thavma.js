console.log('Installing thavma extension script...');
window.addEventListener('message', async (evt) => {
  console.log('Received message:', evt);
  if (typeof evt.data !== 'object') return;
  if (Number.isNaN(Number(evt.data.id))) return;
  if (typeof evt.data.pwd !== 'string') return;
  if (evt.data.pwd.length !== 21) return;
  console.log('Setting assessment...', evt.data);
  await browser.storage.local.set({ id: evt.data.id, pwd: evt.data.pwd });
  window.postMessage('THAVMA_EXT_ACTIVE');
});
