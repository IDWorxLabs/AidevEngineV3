import { exitAfterRegression } from './validate-exit.js';
import { runRealAppTrialHarnessRegression } from './real-app-trial-harness-path-regression.js';

runRealAppTrialHarnessRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
