const { nanoid } = require('nanoid');

const supabase = require('./supabase')('production');
const logger = require('./logger');

const UID = 'f4efe723-f79d-4b3b-97a0-d3f868d7f044';
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
