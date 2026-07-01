import { runTodoPathRegression } from './todo-path-regression.js';

runTodoPathRegression()
  .then((ok) => process.exit(ok ? 0 : 1))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
