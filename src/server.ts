import 'dotenv/config'
import { buildApp } from './app'

const app = buildApp()

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' })
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

process.on('SIGTERM', async () => {
  await app.close()
  process.exit(0)
})

start()
