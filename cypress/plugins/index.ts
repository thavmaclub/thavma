import path from 'path';

import { createClient } from '@supabase/supabase-js';
import codecov from '@cypress/code-coverage/task';
import dotenv from 'dotenv';

import { Assessment, Code, User } from 'lib/model';

import assessment from 'cypress/fixtures/assessment.json';
import codes from 'cypress/fixtures/codes.json';
import inviter from 'cypress/fixtures/inviter.json';
import user from 'cypress/fixtures/user.json';

// Follow the Next.js convention for loading `.env` files.
// @see {@link https://nextjs.org/docs/basic-features/environment-variables}
let env = {};
[
  path.resolve(__dirname, `../../.env.${process.env.NODE_ENV || 'test'}.local`),
  path.resolve(__dirname, '../../.env.local'),
  path.resolve(__dirname, `../../.env.${process.env.NODE_ENV || 'test'}`),
  path.resolve(__dirname, '../../.env'),
].forEach((dotfile: string) => {
  env = { ...env, ...dotenv.config({ path: dotfile }).parsed };
});

export interface Overrides {
  skipCode?: boolean;
  skipCodes?: boolean;
  skipUser?: boolean;
  skipPhone?: boolean;
  skipAccess?: boolean;
  skipInviter?: boolean;
  skipAssessment?: boolean;
  skipQuestions?: boolean;
}

declare global {
  namespace Cypress {
    interface Chainable {
      task(event: 'seed', overrides?: Overrides): Chainable<null>;
    }
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_KEY as string
);

export default function plugins(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): Cypress.ConfigOptions {
  codecov(on, config);
  on('task', {
    async seed({
      skipCode,
      skipCodes,
      skipUser,
      skipPhone,
      skipAccess,
      skipInviter,
      skipAssessment,
      skipQuestions,
    }: Overrides = {}) {
      const ids: { assessment?: number } = {};
      const { error: e } = await supabase.from<Code>('codes').delete();
      if (e) throw new Error(`Error deleting codes: ${e.message}`);
      if (!skipCodes) {
        const { error } = await supabase
          .from<Code>('codes')
          .insert(skipCode ? codes.filter((c) => c.user !== user.id) : codes);
        if (error) throw new Error(`Error inserting codes: ${error.message}`);
      }
      const { error: err } = await supabase.from<User>('users').delete();
      if (err) throw new Error(`Error deleting users: ${err.message}`);
      if (!skipUser) {
        const { error } = await supabase.from<User>('users').insert({
          id: user.id,
          phone: skipPhone ? null : user.phone,
          access: !skipAccess,
        });
        if (error) throw new Error(`Error inserting user: ${error.message}`);
      }
      if (!skipInviter) {
        const { error } = await supabase
          .from<User>('users')
          .insert({ id: inviter.id, phone: inviter.phone, access: true });
        if (error) throw new Error(`Error inserting inviter: ${error.message}`);
      }
      const { error: errr } = await supabase
        .from<Assessment>('assessments')
        .delete();
      if (errr) throw new Error(`Error deleting assessments: ${errr.message}`);
      if (!skipAssessment) {
        const { error, data } = await supabase
          .from<Assessment>('assessments')
          .insert({
            ...assessment,
            id: undefined,
            date: new Date(assessment.date),
            questions: skipQuestions ? [] : assessment.questions,
          });
        if (error)
          throw new Error(`Error inserting assessment: ${error.message}`);
        if (!data?.length) throw new Error('No assessment response data');
        ids.assessment = data[0].id;
      }
      return ids;
    },
  });
  on('before:browser:launch', (browser, launchOptions) => {
    if (browser.family === 'firefox')
      launchOptions.extensions.push(path.resolve(__dirname, '../../ext'));
    return launchOptions;
  });
  return { ...config, env: { ...config.env, ...env } };
}
