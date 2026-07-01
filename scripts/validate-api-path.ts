import { runApiPathRegression } from './api-path-regression.js';

runApiPathRegression()
  .then((ok) => process.exit(ok ? 0 : 1))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
