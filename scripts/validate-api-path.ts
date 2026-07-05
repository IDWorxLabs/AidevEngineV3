import { exitAfterRegression } from './validate-exit.js';
import { runApiPathRegression } from './api-path-regression.js';

runApiPathRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
