# Description

This application is a test wallet application from [lendsqr](https://lendsqr.com). This application allows the user to create an account and verifies that the user is not blacklisted on the lendsqr karma API while onboarding them unto the app.

This application is built using [Nestjs](https://nestjs.org) as the primary nodejs framework and uses [knexjs.js](https://knexjs.com) as the ORM for interacting with the database which is a [MySQL](https://mysql.com) database.

For more information about [Nest please visit](https://github.com/nestjs/nest) framework TypeScript starter repository.

In this application a user can create an account, create multiple wallets in different currencies, fund a wallet in a particular currency, withdraw funds from the wallet and get their wallets.

The overall application is built as an API which uses [JWT](https://auth0.com/docs/secure/tokens/json-web-tokens) as the authentication mechanism while providing [RBAC](https://auth0.com/docs/manage-users/access-control/rbac) to protected routes.

The postman document will be found in the repo.

[Link to the ER diagram](https://erd.dbdesigner.net/designer/schema/1726586104-lendsqr-be-test)

## Installation

```bash
pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Application Routes

Application Version - v1

Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Wallets](#wallets)

## Authentication

- This module is responsible for creating and validating users on the application.

- **Method**: `POST`
- **Endpoint**: `/v1/auth/login`

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

- **Method**: `POST`
- **Endpoint**: `/v1/auth/create-account`

```json
{
  "email": "jdoe@email.com",
  "password": "TJIAWM-2005-tjiawm",
  "confirmPassword": "TJIAWM-2005-tjiawm",
  "first_name": "victor",
  "last_name": "okonkwo"
}
```

## Users

This has not been fully implemented yet as it doesn't have any routes in the controller.

### Wallets

This module is responsible for creating and managing user wallets on the application.

Please not that all the routes in the wallets service will require the user to be logged in. The routes are only usable by an account having `role` of `user`.

- **Method**: `POST`
- **Endpoint**: `/v1/wallets/`

This is responsible for creating a wallet for a user, if the the currency value is not passed in the body, it'll default to creating an NGN wallet for the user.

```json
{
  "currency": "NGN"
}
```

This route is responsible for transferring funds between users on the platform.

- **Method**: `POST`
- **Endpoint**: `/v1/wallets/transfers`

```json
{
  "receiverWalletId": "8f0d8d0a-746a-11ef-8931-0242ac150003",
  "senderWalletId": "9bc9cab9-7463-11ef-8931-0242ac150003",
  "currency": "NGN",
  "amount": 5
}
```

This route is responsible for transferring funding a wallet.
The currency field is a required field as a user shouldn't be able to transfer funds of another currency to another user's wallet it a different currency.

- **Method**: `POST`
- **Endpoint**: `/v1/wallets/fund`

```json
{
  "walletId": "9bc9cab9-7463-11ef-8931-0242ac150003",
  "currency": "NGN",
  "amount": 1000.0
}
```

This route is responsible for performing withdrawals on wallets.

- **Method**: `POST`
- **Endpoint**: `/v1/wallets/withdraw`

```json
{
  "walletId": "9bc9cab9-7463-11ef-8931-0242ac150003",
  "currency": "NGN",
  "amount": 7000,
  "bankCode": "0001"
}
```

This route is responsible for getting all the wallets belonging to the currently logged in user.

- **Method**: `GET`
- **Endpoint**: `/v1/wallets/withdraw`

This route is responsible for performing getting a wallet belonging to the currently logged in user by the wallet id.

- **Method**: `GET`
- **Endpoint**: `/v1/wallets/:id`
