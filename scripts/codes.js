const { nanoid } = require('nanoid');

const supabase = require('./supabase')('development');
const logger = require('./logger');

const UID = '7b73a70b-35eb-46e7-b107-debb56bb8a8a';
const CODES = Array(5).fill(null).map(() => ({ id: nanoid(), creator: UID }));

async function codes() {
  logger.info(`Inserting ${CODES.length} new invite codes...`);
  const { error } = await supabase.from('codes').insert(CODES);
  if (error) {
    logger.error(`Error inserting invite codes: ${error.message}`);
    debugger;
  }
}

if (require.main === module) codes();
