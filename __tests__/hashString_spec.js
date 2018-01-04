import { hashString } from "../dist/src/lib/helpers/hashString"

describe("Generates a password @ready", () => {
  test.only("should return a hashed and buffered password", async () => {
    const password = "test"

    const passwordHash = await hashString(password)
    expect(Buffer.isBuffer(passwordHash)).toBe(true)

  }, 5000)
})
