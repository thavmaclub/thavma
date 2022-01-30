import assessment from 'cypress/fixtures/assessment.json';

export default function Schoology(): JSX.Element {
  return (
    <main>
      {assessment.questions.map(({ question, answers }, questionIdx) => (
        <div className='learnosity-item item' key={questionIdx}>
          <p className='lrn_question'>{question}</p>
          <ul>
            {answers.map((answer, answerIdx) => (
              <li className='lrn-mcq-option' key={answerIdx}>
                <span className='sr-only'>{answer}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </main>
  );
}
