const { nanoid } = require('nanoid');

const supabase = require('./supabase')('development');
const logger = require('./logger');

const UID = '2bc70a00-bdbc-4e41-813b-df60a0dc7d7d';
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
