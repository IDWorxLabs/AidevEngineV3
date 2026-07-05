import { exitAfterRegression } from './validate-exit.js';
import { runCounterPathRegression } from './counter-path-regression.js';

runCounterPathRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
