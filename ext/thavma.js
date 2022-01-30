console.log('Installing thavma extension script...');
window.addEventListener('message', async (evt) => {
  console.log('Received message:', evt);
  if (evt.data && !Number.isNaN(Number(evt.data))) {
    console.log('Setting assessment...', evt.data);
    await browser.storage.local.set({ id: evt.data });
    window.postMessage('THAVMA_EXT_ACTIVE');
  }
});
