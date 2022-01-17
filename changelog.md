# Changelog

## Version 2.0.1 (2022-01-17)

### Bug Fixes

- fixed missing `ngv.config.json`
- fixed paths of output files
- fixed problem with extending `IncomingMessage`

## Version 2.0.0 (2022-01-17)

### Features

- added support for returning `MockOptions` with `result` as http result in `useMock`
- added support for adding *http response headers*
- added support for using custom *environment specific* `.json` files

### BREAKING CHANGES

- dropped support of `Node.js <= 12.20`
- new peer dependecy `dotenv` version `^11.0.0`
- new peer dependecy `tslib` version `^2.3.1`
- minimal supported version of `@jscrpt/common` is now `^2.2.0`
- completely reworked package into typescript

## Version 1.1.1

### Bug Fixes

- fixed restoring original options

## Version 1.1.0

### Feature

- added support for custom callback handle `useMock`

## Version 1.0.1

### Bug Fixes

- fix mock file selection, more logs

## Version 1.0.0

- method `connectServer.use` that supports http method restriction and route as `RegExp`
- adds method `useMock` which allows automatical mocks usage from files