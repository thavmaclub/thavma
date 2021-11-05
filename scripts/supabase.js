const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const logger = require('./logger');
const { createClient } = require('@supabase/supabase-js');

module.exports = function supabase(env = process.env.NODE_ENV || 'production') {
  logger.info(`Loading ${env} environment variables...`);
  const config = {
    ...dotenv.parse(fs.readFileSync(path.resolve(__dirname, '../.env'))),
    ...dotenv.parse(fs.readFileSync(path.resolve(__dirname, '../.env.local'))),
    ...dotenv.parse(fs.readFileSync(path.resolve(__dirname, `../.env.${env}`))),
    ...dotenv.parse(
      fs.readFileSync(path.resolve(__dirname, `../.env.${env}.local`))
    ),
  };

  logger.info(
    `Using Supabase configuration: ${JSON.stringify(
      {
        supabaseUrl: config.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: config.SUPABASE_SERVICE_KEY,
      },
      null,
      2
    )}`
  );

  return createClient(config.NEXT_PUBLIC_SUPABASE_URL, config.SUPABASE_SERVICE_KEY);
};
