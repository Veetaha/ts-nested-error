# Changelog

All notable changes to `ts-nested-error` package are documented here.

## [Unreleased]

- Soon to come...

## [1.2.1] - 2020-12-05

### Fixed

- Fix the deployed package (include the compiled javascript files).

## [1.2.0] - 2020-12-05

### Changed

- Allow attaching multiple source errors to `NestedError`.
  Its property `innerError: Error` is changed to `innerErrors: Error[]` ([#5])

### Deprecated

- `innerError` property will be removed in future major version, please use
`innerErrors[0]` instead

## [1.0.0] - 2019-09-20

- Initial release

[Unreleased]: https://github.com/veetaha/ts-nested-error/compare/v1.2.1...HEAD
[1.2.1]: https://github.com/veetaha/ts-nested-error/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/veetaha/ts-nested-error/commits/v1.2.0

[#5]: https://github.com/Veetaha/ts-nested-error/pull/5
