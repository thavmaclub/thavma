import cn from 'classnames';
import rfdc from 'rfdc';
import { useMemo } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import Header from 'components/header';
import Page from 'components/page';

import { Assessment } from 'lib/model';
import { fetcher } from 'lib/fetch';

const clone = rfdc();

export default function AssessmentPage(): JSX.Element {
  const { query } = useRouter();
  const url = useMemo(
    () =>
      typeof query.id === 'string' && typeof query.pwd === 'string'
        ? `/api/assessments/${query.id}?pwd=${query.pwd}`
        : null,
    [query.id, query.pwd]
  );
  const { data, mutate } = useSWR<Assessment>(url, fetcher);
  return (
    <Page name='Assessment'>
      <main>
        <Header />
        <article className='wrapper'>
          <h2 className={cn({ loading: !data })}>{data?.name}</h2>
          {data?.questions.map((question, questionIdx) => (
            <section key={questionIdx}>
              <p>
                <b>{questionIdx + 1}. </b>
                {question.question}
              </p>
              <ul>
                {question.answers.map((answer, answerIdx) => (
                  <li key={answerIdx}>
                    <input
                      id={`${questionIdx}-${answerIdx}`}
                      type='radio'
                      value={answerIdx}
                      className='radio'
                      checked={question.answer === answerIdx}
                      onChange={async () => {
                        const updated = clone(data);
                        updated.questions[questionIdx].answer = answerIdx;
                        await mutate(updated, false);
                        if (url) await mutate(fetcher(url, 'patch', updated));
                      }}
                    />
                    <label htmlFor={`${questionIdx}-${answerIdx}`}>
                      {answer}
                    </label>
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
