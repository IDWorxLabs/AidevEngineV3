import { exitAfterRegression } from './validate-exit.js';
import { runRealPreviewVerificationRegression } from './real-preview-verification-path-regression.js';

runRealPreviewVerificationRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
