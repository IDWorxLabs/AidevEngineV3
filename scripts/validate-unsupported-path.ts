import { exitAfterRegression } from './validate-exit.js';
import { runUnsupportedPathRegression } from './unsupported-path-regression.js';

runUnsupportedPathRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
