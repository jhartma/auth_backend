const MailListener = require("mail-listener2")
import R from "ramda"

export const getUrlFromText = (mail) => {
  const stringArray = mail.text.split(" ")
  return R.head(R.filter((s) => {
    return s.indexOf("://") !== -1
  }, stringArray))
}

export const createMailListener = () => new MailListener({
  username: process.env.TEST_EMAIL,
  password: process.env.TEST_EMAIL_PWD,
  host: process.env.TEST_EMAIL_HOST,
  connTimeout: 10000,       // Default by node-imap
  authTimeout: 5000,        // Default by node-imap,
  port: 993,                // imap port
  tls: true,                // use secure connection
  mailbox: "INBOX",         // mailbox to monitor
  searchFilter: [ "UNSEEN" ],
  markSeen: true,           // all fetched email willbe marked as seen and not fetched next time
  fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`
})

export function getEmailLink() {
  const mailListener = createMailListener()
  mailListener.start()
  mailListener.on("server:connected", () => null)
  mailListener.on("server:disconnected", () => false)
  mailListener.on("error", (err) => console.log(err))
  return new Promise((resolve) => mailListener.on("mail", (mail, seqno) => {
    const text = getUrlFromText(mail)
    mailListener.imap.seq.setFlags(seqno, "DELETED", () => {
      mailListener.imap.expunge(() => {
        mailListener.stop()
        resolve(text)
      })
    })
  }))
}

export function clearMailbox() {
  const mailListener = createMailListener()
  mailListener.start()
  mailListener.on("error", (err) => console.log(err))
  
  mailListener.imap.once("ready", () => {
    mailListener.imap.openBox("INBOX", false, (err, box) => {
      const total = box.messages.total
      let count = 0
      if (total > 0) {
        const f = mailListener.imap.seq.fetch(`1:${total}`)
        const promise = new Promise((resolve) => {
          f.on("message", (msg, seqno) => {
            mailListener.imap.seq.setFlags(seqno, "DELETED", (err) => {
              if (err) console.log("ERR", err)
              if (!err) {
                count = count + 1
                if (count === total) {
                  resolve()
                }
              }
            })
          })
        })
        promise.then(() => {
          mailListener.imap.expunge((err) => {
            if (err) console.log("Purging Error", err)
            if (!err) {
              console.log("Deleted all Messages")
              mailListener.imap.end()
            }
          })
        })
      }
    })
  })
}