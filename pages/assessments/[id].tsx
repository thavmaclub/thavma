/* eslint-disable react/no-array-index-key */

import { ParsedUrlQuery } from 'querystring';

import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useEffect, useState } from 'react';
import rfdc from 'rfdc';

import Header from 'components/header';
import Page from 'components/page';

import { Assessment } from 'lib/model';
import supabase from 'lib/supabase';

interface Props {
  assessment?: Assessment;
}

export default function AssessmentPage({ assessment: d }: Props): JSX.Element {
  const [assessment, setAssessment] = useState(d || { id: 0, questions: [] });
  useEffect(() => {
    async function update(): Promise<void> {
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
          <h2>Assessment {assessment.id}</h2>
          {assessment.questions.map((question, questionIdx) => (
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
                        console.log('Prev:', prev);
                        const updated = rfdc()(prev);
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

interface Query extends ParsedUrlQuery {
  id: string;
}

export const getServerSideProps: GetServerSideProps<Props, Query> = 
  async (ctx: GetServerSidePropsContext<Query>) => {
  if (!ctx.params) throw new Error('Cannot get page props without params');
  const { data, error } = await supabase
    .from<Assessment>('assessments')
    .select()
    .eq('id', Number(ctx.params.id));
  if (error || !data?.length) return { notFound: true };
  return { props: { assessment: data[0] } };
};
