import { exitAfterRegression } from './validate-exit.js';
import { runWebUiRegression } from './web-ui-regression.js';

runWebUiRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
