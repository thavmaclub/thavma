console.log('Installing thavma extension script...');
window.addEventListener('message', async (evt) => {
  console.log('Received window message:', evt);
  if (typeof evt.data !== 'object')
    return console.warn('Message data not an object...');
  if (Number.isNaN(Number(evt.data.id)))
    return console.warn('Message ID not a number...');
  if (typeof evt.data.pwd !== 'string')
    return console.warn('Message PWD not a string...');
  if (evt.data.pwd.length !== 21)
    return console.warn('Message PWD not 21 chars...');
  console.log('Setting assessment...', evt.data);
  await browser.storage.local.set({ id: evt.data.id, pwd: evt.data.pwd });
  window.postMessage('THAVMA_EXT_ACTIVE');
});
