import * as nodemailer from "nodemailer"

/**
 * Sends email to given receiver address with given content and subject
 * @param  {String} email   [ the email address of the receiver ]
 * @param  {String} subject [ the email subject field ]
 * @param  {String} message [ the email message ]
 * @return {String}         [ signal whether email has been successfully sent ]
 */
export function sendMail(email: string, subject: string, text: string, env: any): any {
  return new Promise((resolve, reject) => {
    const { SMTP_PASSWORD, SMTP_USER, SMTP_SERVER, SMTP_PORT, EMAIL_ADDRESS } = env
    const smtpTransport = nodemailer.createTransport({
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
      host: SMTP_SERVER,
      port: SMTP_PORT,
      secure: true,
    })
    const mailOptions = {
      from: EMAIL_ADDRESS,
      subject,
      text,
      to: email,
    }
    smtpTransport.sendMail(mailOptions, (err: any) => {
      if (err) {
        reject(err)
      }
      console.log(`[ EMAIL ] Sent email to ${email}`) // eslint-disable-line
      resolve("done")
    })
  })
}
