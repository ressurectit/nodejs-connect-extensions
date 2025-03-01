# Changelog

## Version 3.0.0 (2025-01-17)

### BREAKING CHANGES

- minimal supported version of `@jscrpt/common` is `7.0.0`

## Version 2.0.5 (2024-05-06)

### Bug Fixes

- fixed problem with exported types, which are only needed for typescript compilation

## Version 2.0.4 (2022-04-29)

### Bug Fixes

- fixed problem that was introduced in version 2.0.3

## Version 2.0.3 (2022-04-29)

### Bug Fixes

- fixed problem with storing result for next calls when `MockResultFunction` used, more forgotten code

## Version 2.0.2 (2022-03-02)

### Bug Fixes

- fixed problem with storing result for next calls when `MockResultFunction` used

## Version 2.0.1 (2022-01-17)

### Bug Fixes

- fixed missing `ngv.config.json`
- fixed paths of output files
- fixed problem with extending `IncomingMessage`
- for now not supporting error middleware
- fixed obtaining of query parameters in `useMock`
- fixed running application with only string path and handle, or with http method
- fixed obtaining of `result` from *resultOptions*

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