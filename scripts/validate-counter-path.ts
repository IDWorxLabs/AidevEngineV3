import { runCounterPathRegression } from './counter-path-regression.js';

runCounterPathRegression()
  .then((ok) => process.exit(ok ? 0 : 1))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
