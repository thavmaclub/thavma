console.log('Installing background extension script...');
const url = 'http://localhost:3000';
const sendActiveTabMessage = (message) => {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    console.log('Sending active tab message...', message);
    browser.tabs.sendMessage(tabs[0].id, message);
  });
};
let intervalId;
browser.browserAction.onClicked.addListener(() => {
  console.log('Browser action clicked...');
  sendActiveTabMessage('THAVMA_EXT_CLICK');
});
browser.runtime.onMessage.addListener(async (message) => {
  console.log('Received runtime message:', message);
  if (message.questions) {
    console.log('Getting assessment id and pwd...');
    const { id, pwd } = await browser.storage.local.get(['id', 'pwd']);
    console.log(`Updating assessment (${id})...`, { ...message, id, pwd });
    await fetch(`${url}/api/assessments/${id}?pwd=${pwd}`, {
      method: 'PATCH',
      body: JSON.stringify({ questions: message.questions }),
      headers: { 'Content-Type': 'application/json' },
    });
    console.log(`Updated assessment (${id}).`);
    if (intervalId) window.clearInterval(intervalId);
    intervalId = window.setInterval(async () => {
      console.log(`Fetching assessment (${id})...`);
      const res = await fetch(`${url}/api/assessments/${id}?pwd=${pwd}`);
      const { questions } = await res.json();
      console.log(`Fetched assessment (${id}):`, { questions });
      sendActiveTabMessage({ questions });
    }, 1000);
  } else if (message === 'CYPRESS_SIMULATE_EXT_CLICK') {
    console.log('Simulating browser action click...');
    sendActiveTabMessage('THAVMA_EXT_CLICK');
  }
});
