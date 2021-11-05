const supabase = require('./supabase')('test');
const logger = require('./logger');

const user = require('../cypress/fixtures/inviter.json');

async function main() {
  const { error } = await supabase.auth.signUp({ email: user.email, password: user.password });
  if (error) {
    logger.error(`Error creating user: ${error.message}`);
    debugger;
  }
}

if (require.main === module) main();
