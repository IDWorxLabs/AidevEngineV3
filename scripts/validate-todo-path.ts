import { exitAfterRegression } from './validate-exit.js';
import { runTodoPathRegression } from './todo-path-regression.js';

runTodoPathRegression()
  .then((ok) => exitAfterRegression(ok))
  .catch((err) => {
    console.error(err);
    exitAfterRegression(false);
  });
