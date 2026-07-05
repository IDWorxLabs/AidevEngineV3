import { exitAfterRegression } from './validate-exit.js';
import { runRepairPathRegression } from './repair-path-regression.js';

runRepairPathRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
