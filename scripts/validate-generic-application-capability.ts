import { exitAfterRegression } from './validate-exit.js';
import { runGenericApplicationCapabilityRegression } from './generic-application-capability-path-regression.js';

runGenericApplicationCapabilityRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
