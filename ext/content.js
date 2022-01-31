console.log('Installing content extension script...');
browser.runtime.onMessage.addListener((message) => {
  console.log('Received runtime message:', message);
  if (message.questions) {
    console.log('Showing questions...');
    const div =
      document.getElementById('thavma') || document.createElement('div');
    div.id = 'thavma';
    div.innerText = message.questions
      .map((q, idx) => `${idx + 1}. (${q.answer + 1}) ${q.answers[q.answer]}`)
      .join(' | ');
    if (!document.body.contains(div)) document.body.appendChild(div);
    console.log('Showed questions:', message.questions);
  } else if (message === 'THAVMA_EXT_CLICK') {
    console.log('Getting questions...');
    const questions = [];
    document.querySelectorAll('.item').forEach((item) => {
      const question = item.querySelector('.lrn_question').textContent;
      const answers = [];
      item.querySelectorAll('.lrn-mcq-option .sr-only').forEach((ans) => {
        answers.push(ans.textContent);
      });
      questions.push({ question, answers, answer: null });
    });
    browser.runtime.sendMessage({ questions });
    console.log('Got questions:', questions);
    window.postMessage('THAVMA_EXT_GOT_QS');
  }
});
// This listener exists simply to follow Cypress testing convention; I'm only
// testing the `/schoology` page and thus don't want to load `/assessments` to
// configure the `storage.local` id and pwd (which I've already tested).
window.addEventListener('message', async (evt) => {
  console.log('Received window message:', evt);
  if (evt.data === 'CYPRESS_SIMULATE_EXT_CLICK') {
    console.log('Simulating browser action click...');
    browser.runtime.sendMessage('CYPRESS_SIMULATE_EXT_CLICK');
  } else if (typeof evt.data === 'object') {
    if (Number.isNaN(Number(evt.data.id))) return;
    if (typeof evt.data.pwd !== 'string') return;
    if (evt.data.pwd.length !== 21) return;
    console.log('Setting assessment...', evt.data);
    await browser.storage.local.set({ id: evt.data.id, pwd: evt.data.pwd });
    window.postMessage('THAVMA_EXT_ACTIVE');
  }
});
