# Description

This application is a test wallet application from [lendsqr](https://lendsqr.com). This application allows the user to create an account and verifies that the user is not blacklisted on the lendsqr karma API while onboarding them unto the app.

This application is built using [Nestjs](https://nestjs.org) as the primary nodejs framework and uses [knexjs.js](https://knexjs.com) as the ORM for interacting with the database which is a [MySQL](https://mysql.com) database.

For more information about [Nest please visit](https://github.com/nestjs/nest) framework TypeScript starter repository.

In this application a user can create an account, create multiple wallets in different currencies, fund a wallet in a particular currency, withdraw funds from the wallet and get their wallets.

The overall application is built as an API which uses [JWT](https://auth0.com/docs/secure/tokens/json-web-tokens) as the authentication mechanism while providing [RBAC](https://auth0.com/docs/manage-users/access-control/rbac) to protected routes.

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

## Application Structure
