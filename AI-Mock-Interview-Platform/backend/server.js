import app from './app.js';
import env from '../config/env.js';

app.listen(env.PORT, () => {
  console.log(`AI Mock Interview Platform listening on ${env.PORT}`);
});
