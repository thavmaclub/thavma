/* eslint-disable react/no-array-index-key */

import { ParsedUrlQuery } from 'querystring';

import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next';
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
        <h2>Assessment {assessment.id}</h2>
        {assessment.questions.map((question, questionIdx) => (
          <section key={questionIdx}>
            <p>{question.question}</p>
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
        <style jsx>{`
        `}</style>
      </main>
    </Page>
  );
}

interface Query extends ParsedUrlQuery {
  id: string;
}

export const getStaticProps: GetStaticProps<Props, Query> = async (ctx: GetStaticPropsContext<Query>) => {
  if (!ctx.params) throw new Error('Cannot get static props without params');
  const { data, error } = await supabase.from<Assessment>('assessments').select().eq('id', Number(ctx.params.id));
  if (error || !data?.length) return { notFound: true, revalidate: 1 };
  return { props: { assessment: data[0] }, revalidate: 1 };
};

export const getStaticPaths: GetStaticPaths<Query> = async () => {
  const { data } = await supabase.from<Assessment>('assessments').select();
  const ids = (data || []).map((assessment) => assessment.id.toString());
  return { paths: ids.map((id) => ({ params: { id } })), fallback: true };
};
