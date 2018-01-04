Simple Passport.js backend for rapid prototyping. A word of caution: it is not supposed to be used in production, as it may not be fully secure.

# Features
* create user accounts
* authenticate users
* set up user sessions
* restoring passwords
* update account data
* sends emails on signin or resetting passwords
* fully customizable messages
* argon2 hashes for max security
* hashed tokens for password reset
* hashed tokens for signup confirmation
* rate limiting in production

# Why?
- it is generally a good idea to have user authentication data in a separate database
- authentication as a microservice makes it reusable across projects

# What does it do?
The microservice provides basic functionality for authentication and user management. New users are stored in MongoDb (also when you sign in with Google or Facebook). When a user signs in, a cookie is sent to the client and the session is stored in MongoDb. In your main app, you can then use the cookie from the client's requests to resolve the user and see whether the user session is valid.

# How to use it in dev mode
The entire app runs in a docker container (makes it easer to deploy in production and work on it on different machines) which are orchestrated by ```docker-compose```. You find the files for it in the ```docker``` folder.

Before you start, you need to create ssl certificates (for running it on https) and environment variables.
Put the ```cert.crt```, ```cert.key```, and ```dhparam.pem``` inside ```docker/certs```. Then create the ```docker/env``` folder and place two env files for development and testing inside it with the following variables:

## Dev environment variables
```bash
# Basic Settings
ACCOUNTS_BACKEND_PORT=4200    # the port for th express server
APP_NAME=Auth_BACKEND         # app name displayed in email messages
APP_URL=localhost             # the url of your site
AUTH_REDIRECT=/private        # redirect route after login

# External OAuth provider credentials
GOOGLE_CLIENT_ID==**********
GOOGLE_CLIENT_SECRET==**********
GOOGLE_REDIRECT=/auth/google/return

FACEBOOK_CLIENT_ID==**********
FACEBOOK_CLIENT_SECRET=**********
FACEBOOK_REDIRECT=/auth/facebook/return

# For sending emails
SMTP_PASSWORD=****
SMTP_PORT=465
SMTP_SERVER=smtp.something.com
SMTP_USER=emailuser
EMAIL_ADDRESS=your@email.com

# Mongodb Settings
MONGO_DB_NAME=auth_dev
MONGO_PORT=27017
MONGO_URL=127.0.0.1
ACCOUNTS_MONGO_STRING=mongodb://localhost/accounts

# Tests need an email account to which they send mails
TEST_EMAIL=you@me.co      # your email address
TEST_EMAIL_PWD=********   # your password
TEST_EMAIL_HOST=...       # Imap url

```

## Dev commands
```bash
yarn dev:start    # start docker dev container
yarn dev:stop     # stop docker dev container
yarn dev:seed     # seed accounts data
yarn dev:resetDb  # reset MongoDb

yarn build        # build docker production image
yarn build:dev    # build docker development image
yarn build:test   # build image for the test suite

yarn run test     # run tests in docker image
yarn run test:all # run all tests from the command line (make sure yarn dev:start runs and new data is seeded)
yarn run test:dev # run tests marked with @dev from the command line
yarn run test:new # run new tests from the command line
```

## Routes
When you use the service together with the app you are developing, you need to send requests to the routes provided by the app.
```js
// GET Routes
"/auth/sign-out"                
"/auth/confirm-account/:token"
"/auth/:userId"

// POST Routes
"/auth/forgot-password"
"/auth/reset-password"
"/auth/sign-in"
"/auth/sign-up"
"/auth/update-email"
"/auth/update-password"
"/auth/update-username"
"/auth/removeUser"

// Others
"/internal/seedUsers"
```

## How to call the service from the client
Here is how you would use it from within your own app. You must adjust the url path though
```js
export function signup({ username, password, email }) {
  return fetch("https://localhost/auth/sign-up", {
    method: "POST",
    mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password })
  })
  .catch((err) => console.log("ERR", err))
  .then(response => response.json())
}
```

## Responses
### Response object
Whenever you send a request, you will get a response back from the auth service. The response always has the form
```js
{
  status: 200,
  message: "Some message",
  data: {
    ...someData
  }
}
```

### Response codes
The status field in the response object sends a numeric value. Here is what they MESSAGE_ACCOUNT_CREATED

* 200 - Success
* 500 - Undefined Error
* 501 - Invalid token
* 502 - Couldn't create user
* 503 - Username already exists
* 504 - Email address already exists
* 505 - Password is too short
* 506 - Password is insecure
* 507 - Email sending error
* 508 - Couldn't create validation token
* 509 - Couldn't find user in db
* 510 - Invalid email address
* 511 - Coudn't save password
* 512 - Couldn't update user
* 513 - Wrong username on login
* 514 - Username too short
* 515 - User not found
* 516 - Failure removing user
* 517 - Success removing user

### Custom Response Messages
The response messages can be customised via environment variables.
```bash
MESSAGE_ACCOUNT_CONFIRMED_SUCCESS = "You successfully created your new account!"
MESSAGE_ACCOUNT_CREATED = "Successfully created your account!"
MESSAGE_FAILURE_EMAIL_EXISTS = "Your email address already exists!"
MESSAGE_FAILURE_EMAIL_INVALID = "This is not a valid email address!"
MESSAGE_FAILURE_FIND_USER = "Error: We cannot find a user with this email address. Please try again!"
MESSAGE_FAILURE_INVALID_TOKEN = "Sorry, your token is invalid!"
MESSAGE_FAILURE_PASSWD_INSECURE = "Password needs at least one capital letter and a special character"
MESSAGE_FAILURE_PASSWD_TOO_SHORT = "A password needs at least 6 characters!"
MESSAGE_FAILURE_SAVE_PASSWD = "Couldn't save password"
MESSAGE_FAILURE_SAVE_USER = "Something went wrong, could not create your account!"
MESSAGE_FAILURE_SEND_MAIL = "Could not send an email to your address!"
MESSAGE_FAILURE_UNDEFINED = "Sorry, something went wrong"
MESSAGE_FAILURE_UPDATE_USER = "Couldn't update user"
MESSAGE_FAILURE_USER_EXISTS = "Your username already exists!"
MESSAGE_FAILURE_VALIDATION_TOKEN = "Couldn't create validation token!"
MESSAGE_SUCCESS_RESEND_PASSWD = "Please check your email account, we sent you a link!"
MESSAGE_SUCCESS_SIGNIN = "You signed in"
MESSAGE_SUCCESS_SIGNOUT = "You signed out"
MESSAGE_SUCCESS_UPDATE_USER = "Successfully updated your account"

```
# Under the hood
- MongoDb for storing user authentication data
- Node.js with Express as serve
- Passport.js for authentication
- nodemailer for sending emails

# 3rd Party Auth Providers
* Google
* Facebook

# Todo:
* implement /auth/about route showing the version and status of the microservice
* /auth/inspect for checking user tokens without having to connect to mongodb from the main app
* /auth/revoke to remove user session

### Contributions welcome
