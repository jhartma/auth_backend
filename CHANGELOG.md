# 0.0.31
* automatically login after account verification
* hash signup confirmation token

# 0.0.29
* start port to Typescript
* breaking: "/auth/reset-password" now needs the email adress as additional argument

# 0.0.28
* hash reset tokens with argon2
* rate limiter on login

# 0.0.26
* use argon2 for password hashing
* breaking: due to the new hashing algorithm, existing passwords need to be renewed

# 0.0.25
* increased password salt rounds from 10 to 14
* changed bcrypt user field to 'hash'
