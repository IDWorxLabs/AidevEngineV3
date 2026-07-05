import { exitAfterRegression } from './validate-exit.js';
import { runLiveEngineeringTimelineRegression } from './live-engineering-timeline-path-regression.js';

runLiveEngineeringTimelineRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
