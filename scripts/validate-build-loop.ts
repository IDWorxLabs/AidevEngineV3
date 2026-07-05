import { exitAfterRegression } from './validate-exit.js';
import { runBuildLoopRegression } from './build-loop-path-regression.js';

runBuildLoopRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
