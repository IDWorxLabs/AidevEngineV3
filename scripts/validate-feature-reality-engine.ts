import { exitAfterRegression } from './validate-exit.js';
import { runFeatureRealityEngineRegression } from './feature-reality-engine-path-regression.js';

runFeatureRealityEngineRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
