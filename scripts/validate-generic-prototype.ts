import { exitAfterRegression } from './validate-exit.js';
import { runGenericPrototypeRegression } from './generic-prototype-path-regression.js';

runGenericPrototypeRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
