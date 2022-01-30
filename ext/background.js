console.log('Installing background extension script...');
const url = 'https://thavma.club';
browser.browserAction.onClicked.addListener(() => {
  console.log('Browser action clicked...');
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    console.log('Sending message...');
    browser.tabs.sendMessage(tabs[0].id, {});
  });
});
browser.runtime.onMessage.addListener(async ({ questions }) => {
  const { id, pwd } = await browser.storage.local.get(['id', 'pwd']);
  console.log(`Updating assessment (${id})...`, { id, pwd, questions });
  await fetch(`${url}/api/assessments/${id}?pwd=${pwd}`, {
    method: 'patch',
    body: JSON.stringify({ questions }),
    headers: { 'Content-Type': 'application/json' },
  });
  console.log(`Updated assessment (${id}).`);
  window.setInterval(async () => {
    console.log(`Fetching assessment (${id})...`);
    const res = await fetch(`${url}/api/assessments/${id}?pwd=${pwd}`);
    const { questions } = await res.json();
    console.log(`Fetched assessment (${id}):`, { questions });
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      console.log('Sending message...');
      browser.tabs.sendMessage(tabs[0].id, { questions });
    });
  }, 1000);
});
