import { useEffect, useState } from 'react';
import cn from 'classnames';
import rfdc from 'rfdc';
import { useRouter } from 'next/router';

import Header from 'components/header';
import Page from 'components/page';

import { Assessment } from 'lib/model';
import supabase from 'lib/supabase';

const clone = rfdc();

export default function AssessmentPage(): JSX.Element {
  const { query } = useRouter();
  const [assessment, setAssessment] = useState<Assessment>();
  useEffect(() => {
    void (async () => {
      if (typeof query.id !== 'string') return console.warn('No query ID.');
      const { data } = await supabase
        .from<Assessment>('assessments')
        .select()
        .eq('id', query.id);
      setAssessment((prev) => data ? data[0] : prev);
    })();
  }, [query.id]);
  useEffect(() => {
    async function update(): Promise<void> {
      if (!assessment) return console.warn('No assessment to update.');
      const { data, error } = await supabase
        .from<Assessment>('assessments')
        .update({ questions: assessment.questions })
        .eq('id', assessment.id);
      if (error) console.error(error.message);
      console.log('Updated assessment:', data);
    }
    const timeoutId = setTimeout(() => {
      void update();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [assessment]);
  return (
    <Page name='Assessment'>
      <main>
        <Header />
        <article className='wrapper'>
          <h2 className={cn({ loading: !assessment })}>
            {assessment?.name}
          </h2>
          {assessment?.questions.map((question, questionIdx) => (
            <section key={questionIdx}>
              <p><b>{questionIdx + 1}. </b>{question.question}</p>
              <ul>
                {question.answers.map((answer, answerIdx) => (
                  <li key={answerIdx}>
                    <input
                      id={`${questionIdx}-${answerIdx}`}
                      type='radio'
                      value={answerIdx}
                      className='radio'
                      checked={question.answer === answerIdx}
                      onChange={() => setAssessment((prev) => {
                        if (!prev) return prev;
                        console.log('Prev:', prev);
                        const updated = clone(prev);
                        console.log('Updated:', updated);
                        updated.questions[questionIdx].answer = answerIdx;
                        console.log('Updated question:', updated.questions[questionIdx]);
                        console.log('Updated:', updated);
                        return updated;
                      })}
                    />
                    <label htmlFor={`${questionIdx}-${answerIdx}`}>{answer}</label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </article>
        <style jsx>{`
          p {
            margin: 0 0 8px;
          }

          ul {
            margin: 0;
            padding: 0;
          }
          
          li {
            list-style: none;
            margin: 4px 0;
          }
          
          label {
            margin-left: 8px;
          }

          section {
            margin: 0 0 24px;
          }
        `}</style>
      </main>
    </Page>
  );
}
