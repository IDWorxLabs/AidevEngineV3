import { exitAfterRegression } from './validate-exit.js';
import { runUnderstandingRegression } from './understanding-path-regression.js';

runUnderstandingRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
