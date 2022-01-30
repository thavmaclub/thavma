console.log('Installing content extension script...');
browser.runtime.onMessage.addListener((message) => {
  if (message.questions) {
    console.log('Showing questions...');
    const div = document.getElementById('t1v1') || document.createElement('div');
    div.id = 't1v1';
    div.innerText = message.questions
      .map((q, idx) => `${idx + 1}. (${q.answer + 1}) ${q.answers[q.answer]}`)
      .join(' | ');
    if (!document.body.contains(div)) document.body.appendChild(div);
    console.log('Showed questions:', message.questions);
  } else {
    console.log('Getting questions...');
    const questions = [];
    document.querySelectorAll('.item').forEach((item) => {
      const question = item.querySelector('.lrn_question').textContent;
      const answers = [];
      item.querySelectorAll('.lrn-mcq-option .sr-only').forEach((ans) => {
        answers.push(ans.textContent);
      });
      questions.push({ question, answers });
    });
    browser.runtime.sendMessage({ questions });
    console.log('Got questions:', questions);
  }
});
