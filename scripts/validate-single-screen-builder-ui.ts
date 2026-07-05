import { exitAfterRegression } from './validate-exit.js';
import { runSingleScreenBuilderUiRegression } from './single-screen-builder-ui-path-regression.js';

runSingleScreenBuilderUiRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
