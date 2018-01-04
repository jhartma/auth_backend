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
    mailListener.imap.seq.setFlags(seqno, "DELETED", () => {
      mailListener.imap.seq.move(seqno, "Trash", () => {
        console.log("MOVED")
        mailListener.imap.end()
      })
    })
    mailListener.stop()
    resolve(getUrlFromText(mail))
  }))
}
