import { GetStaticProps } from 'next';
import Link from 'next/link';

import Header from 'components/header';
import Page from 'components/page';

import { Assessment } from 'lib/model';
import supabase from 'lib/supabase';

interface Props {
  assessments?: Assessment[];
}

export default function AssessmentsPage({ assessments }: Props): JSX.Element {
  return (
    <Page name='Assessments'>
      <main>
        <Header />
        <ul className='wrapper'>
          {(assessments || []).map((assessment) => (
            <li key={assessment.id}>
              <Link href={`/assessments/${assessment.id}`}>
                <a>Assessment {assessment.id}</a>
              </Link>
            </li>
          ))}
        </ul>
        <style jsx>{`
          main :global(a) {
            color: inherit;
          }
          
          li {
            margin: 12px 0;
          }
        `}</style>
      </main>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const { data } = await supabase.from<Assessment>('assessments').select();
  return { props: { assessments: data ?? [] }, revalidate: 1 };
};
