import { app, env } from './app'

app
  .listen({ host: '0.0.0.0', port: env.PORT })
  .then((address) => {
    console.log(`Fatal Trainer API listening at ${address}`)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
