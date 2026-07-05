import { exitAfterRegression } from './validate-exit.js';
import { runArchitectureRegression } from './architecture-path-regression.js';

runArchitectureRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
