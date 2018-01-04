import { resetDb } from "../lib/resetDb"
import { seedUsers } from "../lib/seed"

resetDb().then(() => {
  seedUsers().then((users) => {
    setTimeout(() => {
      console.log("Finished seeding data.") // eslint-disable-line
      process.exit(0)
    }, 3000)
  })
})
