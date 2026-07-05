import { exitAfterRegression } from './validate-exit.js';
import { runProductQualityRegression } from './product-quality-path-regression.js';

runProductQualityRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
