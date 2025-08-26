# Changelog


## [2.2.3](https://github.com/emiljanitzek/mongoose-delete-ts/compare/v2.2.2...v2.2.3) (2025-08-26)


### Bug Fixes

* bump patch and minor package updates ([be8dcae](https://github.com/emiljanitzek/mongoose-delete-ts/commit/be8dcae6e174554a310ec80ccd44e8d8ae6083db))

## [2.2.2](https://github.com/emiljanitzek/mongoose-delete-ts/compare/v2.2.1...v2.2.2) (2025-01-08)


### Bug Fixes

* update query helper to match any query operation ([a939e4b](https://github.com/emiljanitzek/mongoose-delete-ts/commit/a939e4b211ce2ebd517db2bcc14f1e786956218c))

## [2.2.1](https://github.com/emiljanitzek/mongoose-delete-ts/compare/v2.2.0...v2.2.1) (2025-01-03)


### Bug Fixes

* github action to publish to npm ([cc98304](https://github.com/emiljanitzek/mongoose-delete-ts/commit/cc9830440a243c3bfa4028c2968c4735c9541164))

## [2.2.0](https://github.com/emiljanitzek/mongoose-delete-ts/compare/v2.1.0...v2.2.0) (2025-01-03)


### Features

* upgrade to latest mongoose ([17ceae6](https://github.com/emiljanitzek/mongoose-delete-ts/commit/17ceae68307da60104b7673e23ffb987227aa627))

## [2.1.0](https://github.com/emiljanitzek/mongoose-delete-ts/compare/v2.0.0...v2.1.0) (2024-04-10)


### Features

* update mongoose/mongodb dependencies ([408cf68](https://github.com/emiljanitzek/mongoose-delete-ts/commit/408cf684506e135f16abf1d5eb5da127a76983b5))

## [2.0.0](https://github.com/emiljanitzek/mongoose-delete-ts/compare/v1.1.1...v2.0.0) (2024-03-14)


### ⚠ BREAKING CHANGES

* dropping support for Node 14, 16
* dropping support for MongoDB 4
* upgrade to mongoose 8

### Features

* dropping support for MongoDB 4 ([09883d3](https://github.com/emiljanitzek/mongoose-delete-ts/commit/09883d38da5e9314ea3c0f5a3ae4012c8c046907))
* dropping support for Node 14, 16 ([09883d3](https://github.com/emiljanitzek/mongoose-delete-ts/commit/09883d38da5e9314ea3c0f5a3ae4012c8c046907))
* removing support for query option `{ withDeleted: true }` (use `deleted: { $in: [true, false] }` in query instead) ([09883d3](https://github.com/emiljanitzek/mongoose-delete-ts/commit/09883d38da5e9314ea3c0f5a3ae4012c8c046907))
* renaming query helper functions `withDeleted()` -&gt; `allDocuments()`, `onlyDeleted()` -> `deletedDocuments()` ([09883d3](https://github.com/emiljanitzek/mongoose-delete-ts/commit/09883d38da5e9314ea3c0f5a3ae4012c8c046907))
* upgrade to mongoose 8 ([09883d3](https://github.com/emiljanitzek/mongoose-delete-ts/commit/09883d38da5e9314ea3c0f5a3ae4012c8c046907))

## [v1.3.1]
> December 28, 2022

- Only add alias if name is different

## [v1.3.0]
> August 25, 2022

- Make delete attributes optional

## [v1.2.0]
> August 16, 2022

- Change type definition to not extend Document

## [v1.1.1]
> July 14, 2022

- Add missing export for DeleteQuery

## [v1.1.0]
> July 14, 2022

- Add support for custom schema definition for deleted
- Improved query helper typescript interface for proper chaining
- Update dependencies and add support for node 18 and mongodb 5

## [v1.0.0]
> November 24, 2021
- Completely re-written in TypeScript

### BREAKING CHANGES
- Only support for Mongoose 6
- Removed typeKey option, will use typeKey from schema instead
- Removed deletedByType option, use custom schema type instead
- Removed use$neOperator option, will always use equal for performance

## [v0.5.4]
> August 31, 2021

- Upgrade all test to support mongoose 5.x and 6.x
- Stop using TravicCI as test runner
- Setup GitHub action for tests 
  - Node: 12, 14, 16
  - MongoDB: 4.0, 4.2, 4.4
- Upgrade Mongoose ^6 in `devDependencies`
- Add Mongoose 6 into `peerDependencies` #105 (@Paso)

## [v0.5.3]
> November 19, 2020

- Add option to `populate` deleted documents #40 (@sven)
- Update documentation for `aggregate` (@Jericho1060)
- Update `mocha` -> `8.x`
- fix: deprecation warning for collection.update when user overrides update method #81 #78 (@nsine)
- fix: `nyc` moved into `devDependencies` #80 (@isikhi)

## [v0.5.2]
> April 1, 2020

- Add option to override `aggregate` (@shimonbrandsdorfer)
- Upgrade all `devDependencies` to latest versions
- Remove Istanbul coverage tool 


## [v0.5.1]
> September 3, 2019

- Add option to disable use of `$ne` operator using `{use$neOperator: false}` (@bdelville, @gabzim) #50
- Fix Mongoose DeprecationWarning: collection.update is deprecated (@cardimajs, @jebarjonet)
- Upgrade all `devDependencies` to latest versions
- Fix security vulnerabilities in dependencies
- Add additional tests for `updateMany`, `countDocuments`, `use$neOperator`
- Setup `.travis.yml` to test plugin on Node: 12, 11, 10, 9, 8, 7, 6, 5, 4

## [v0.5.0]
> December 10, 2018

- Add support to mongoose 5.x (@joelmukuthu, @gforge)
- Add `deleteById` static method #16
- Add `countDocuments` method with related override methods (only for v5 Mongoose) #45
- Upgrade all `devDependencies` to latest versions
- Setup `.travis.yml` to test plugin on Node: 10, 9, 8, 7, 6, 5, 4
- Setup `.travis.yml` to use `coveralls@3.0.2`
- Add additional tests

## [v0.4.0]
> July 10, 2016

- Add custom typeKey support #22
- Add option to set custom type for deletedBy
- Support instance method delete promise
- Add specification about remove() to README

## [v0.3.4]
> June 20, 2016

- Methods override fix for existent DB #11
- Option to create indexes for deleted, deletedAt, deletedBy, related to #12

## [v0.3.3]
> July 1, 2016

- Default delete set to `false` #10

## [v0.3.2]
> April 26, 2016

- Correct field name into documentation, `validateBeforeDelete`

## [v0.3.1]
> April 20, 2016

- Add option to disable validation on delete #6

## [v0.3.0]
> Mar 11, 2016

- Bulk delete and restore
- Remove requirement for callback in delete() and restore()

## [v0.2.1]
> Feb 1, 2016

- Add option to override static model methods (`count`, `find`, `findOne`, `findOneAndUpdate`, `update`)
- Add additional methods for overridden static methods:

 | only not deleted documents | only deleted documents  | all documents               |
|----------------------------|-------------------------|-----------------------------|
| count()                    | countDeleted            | countWithDeleted            |
| find()                     | findDeleted             | findWithDeleted             |
| findOne()                  | findOneDeleted          | findOneWithDeleted          |
| findOneAndUpdate()         | findOneAndUpdateDeleted | findOneAndUpdateWithDeleted |
| update()                   | updateDeleted           | updateWithDeleted           |



## [v0.1.1]
> Aug 1, 2014

- Initial version
- Add `deleted` (true-false) key on document
- Add `deletedAt` key to store time of deletion
- Add `deletedBy` key to record who deleted document
- Restore deleted documents, `restore()` method
