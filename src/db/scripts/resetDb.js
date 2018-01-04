import { resetDb } from "../lib/resetDb"

resetDb().then(() => {
  setTimeout(() => {
    process.exit(0)
  }, 1000)
})
