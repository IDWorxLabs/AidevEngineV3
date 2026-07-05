import { exitAfterRegression } from './validate-exit.js';
import { runSoftwareCreationQualityRegression } from './software-creation-quality-path-regression.js';

runSoftwareCreationQualityRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
