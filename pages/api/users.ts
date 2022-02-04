import { NextApiRequest as Req, NextApiResponse as Res } from 'next';
import { Twilio } from 'twilio';
import { nanoid } from 'nanoid';
import { phone } from 'phone';

import { APIError, Code, User } from 'lib/model';
import handle from 'lib/api/handle';
import log from 'lib/log';
import supabase from 'lib/api/supabase';

const client = new Twilio(
  process.env.TWILIO_SID as string,
  process.env.TWILIO_TOKEN as string
);

export default async function usersAPI(req: Req, res: Res): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method as string} Not Allowed`);
  } else {
    try {
      log.info('Verifying authentication...');
      if (!req.headers.authorization) throw new APIError('Invalid JWT', 401);
      const jwt = req.headers.authorization.replace('Bearer ', '');
      const { user, error: getUserErr } = await supabase.auth.api.getUser(jwt);
      if (getUserErr) throw new APIError(getUserErr.message, 401);
      if (!user) throw new APIError('Invalid user', 401);

      log.info(`Verifying phone for user (${user.id})...`);
      const { phoneNumber } = phone((req.body as { phone: string }).phone);
      if (!phoneNumber) throw new APIError('Invalid phone number', 400);

      log.info(`Updating phone (${phoneNumber}) for user (${user.id})...`);
      const { error: updatePhoneErr } = await supabase
        .from<User>('users')
        .update({ phone: phoneNumber })
        .eq('id', user.id);
      if (updatePhoneErr) throw new APIError(updatePhoneErr.message, 500);

      log.info(`Inserting codes for user (${user.id})...`);
      const codes = [
        { id: nanoid(), creator: user.id },
        { id: nanoid(), creator: user.id },
      ];
      const { error: insertCodesErr } = await supabase
        .from<Code>('codes')
        .insert(codes);
      if (insertCodesErr) throw new APIError(insertCodesErr.message, 500);

      log.info(`Sending codes via text (${phoneNumber})...`);
      await client.messages.create({
        body: `thavma.io invite codes\n${codes[0].id}\n${codes[1].id}`,
        from: process.env.TWILIO_PHONE,
        to: phoneNumber,
      });

      res.status(201).json({ phone: phoneNumber, id: user.id });
    } catch (e) {
      handle(e, res);
    }
  }
}
