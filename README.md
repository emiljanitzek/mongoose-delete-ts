Mongoose Delete TS Plugin
=========

mongoose-delete-ts is simple and lightweight plugin that enables soft deletion of documents in MongoDB. This code is based on plugin [mongoose-delete](https://github.com/dsanel/mongoose-delete). But completely re-written in TypeScript and using mongoose query helpers. 

[![Build Status](https://github.com/emiljanitzek/mongoose-delete-ts/actions/workflows/test.yml/badge.svg)](https://github.com/emiljanitzek/mongoose-delete-ts/actions/workflows/test.yml)

## Requirements

| mongoose-delete-ts | Mongoose | Node.js     |
| ---                | ---      | ---         |
| 3.x                | 9.x      | >= 22.0.0   |
| 2.x                | 8.x      | >= 16.20.1  |

## Installation
Install using [npm](https://npmjs.org)
```
npm install mongoose-delete-ts
```

## Before you get started
This plugin queries `deleted: false` for improved query performance. If you are adding this plugin to an existing project, make sure to manually update all existing documents with `deleted=false`

## Usage

### Simple usage

Wrap your schema with `softDelete()`. It applies the plugin and returns the same schema, typed with everything the plugin adds, so `mongoose.model()` infers the fields, methods, query helpers and statics for you.

```typescript
import mongoose, { Schema } from 'mongoose';
import { softDelete } from 'mongoose-delete-ts';

const petSchema = softDelete(new Schema({
	name: { type: String, required: true }
}));

const PetModel = mongoose.model('Pet', petSchema);

const fluffy = await PetModel.create({ name: 'Fluffy' });
// mongodb: { name: 'Fluffy', deleted: false }
await fluffy.delete();
// mongodb: { name: 'Fluffy', deleted: true }
await fluffy.restore();
// mongodb: { name: 'Fluffy', deleted: false }

await PetModel.deleteOne({ name: 'Fluffy' });
// mongodb: { name: 'Fluffy', deleted: true }
```

`softDelete(schema, options)` takes the same options as `schema.plugin(mongooseDelete, options)`, and the types follow the options:

```typescript
const petSchema = softDelete(new Schema({ name: String }), {
	deletedAt: true,
	deletedBy: { type: String }
});
const PetModel = mongoose.model('Pet', petSchema);

const fluffy = await PetModel.findOne({ name: 'Fluffy' }).orFail();
await fluffy.deleteByUser('John Doe');
fluffy.deletedAt; // Date | undefined
fluffy.deletedBy; // string | undefined (inferred from the deletedBy type, defaults to ObjectId)

await PetModel.deleteManyByUser('John Doe', { name: 'Fluffy' });
await PetModel.restoreMany({ name: 'Fluffy' });
```

Schemas with an explicit document type, instance methods, query helpers or statics keep them:

```typescript
type Pet = { name: string };
type PetMethods = { greet(): string };

const petSchema = softDelete(new Schema<Pet, Model<Pet>, PetMethods>({ name: String }), { deletedAt: true });
```

### Deleted at timestamp

```typescript
const petSchema = softDelete(new Schema({ name: String }), { deletedAt: true });
const PetModel = mongoose.model('Pet', petSchema);

const fluffy = await PetModel.create({ name: 'Fluffy' });
// mongodb: { name: 'Fluffy', deleted: false }

await fluffy.delete();
// mongodb: { name: 'Fluffy', deleted: true, deletedAt: ISODate("2014-08-01T10:34:53.171Z")}

await fluffy.restore();
// mongodb: { name: 'Fluffy', deleted: false }
```

### Deleted by user

```typescript
const petSchema = softDelete(new Schema({ name: String }), { deletedBy: true });
const PetModel = mongoose.model('Pet', petSchema);

const fluffy = await PetModel.create({ name: 'Fluffy' });
// mongodb: { name: 'Fluffy', deleted: false }

const idUser = new mongoose.Types.ObjectId('53da93b16b4a6670076b16bf');

await fluffy.deleteByUser(idUser);
// mongodb: { name: 'Fluffy', deleted: true, deletedBy: ObjectId("53da93b16b4a6670076b16bf")}

await fluffy.restore();
// mongodb: { name: 'Fluffy', deleted: false }
```

The type for `deletedBy` does not have to be `ObjectId`, you can set a custom type, such as `String`.

```typescript
const petSchema = softDelete(new Schema({ name: String }), { deletedBy: { type: String } });
const PetModel = mongoose.model('Pet', petSchema);

const fluffy = await PetModel.create({ name: 'Fluffy' });
// mongodb: { deleted: false, name: 'Fluffy' }

await fluffy.deleteByUser('John Doe');
// mongodb: { name: 'Fluffy', deleted: true, deletedBy: 'John Doe' }

await fluffy.restore();
```

### Using `schema.plugin()` with explicit types

The plugin can also be applied with `schema.plugin()`. Mongoose does not change the type of a schema when a plugin is applied, so the types have to be declared by hand:

```typescript
import mongoose, { Model, Schema, Types } from 'mongoose';
import mongooseDelete, {
	Deleted,
	DeletedBy,
	DeletedByMethods,
	DeletedByStaticMethods,
	DeletedMethods,
	DeletedQueryHelpers,
	DeletedStaticMethods
} from 'mongoose-delete-ts';

type Pet = { name: string } & Deleted & DeletedBy<Types.ObjectId>;
type PetQueryHelpers = DeletedQueryHelpers<Pet>;
type PetMethods = DeletedMethods & DeletedByMethods<Types.ObjectId>;
type PetStaticMethods = DeletedStaticMethods<Pet, PetQueryHelpers> & DeletedByStaticMethods<Pet, Types.ObjectId, PetQueryHelpers>;
type PetModel = Model<Pet, PetQueryHelpers, PetMethods> & PetStaticMethods;

const petSchema = new Schema<Pet, PetModel, PetMethods, PetQueryHelpers, {}, PetStaticMethods>({
	name: String
});

petSchema.plugin(mongooseDelete, { deletedBy: true });

const PetModel = mongoose.model<Pet, PetModel>('Pet', petSchema);
```

### ES modules

The package is published as CommonJS. In an ES module project (`"type": "module"` in `package.json`), import the plugin by name:

```typescript
import { mongooseDelete } from 'mongoose-delete-ts';

petSchema.plugin(mongooseDelete);
```

## TypeScript support

### Schema helper
| Export | Description
| ---  | ---
| `softDelete(schema, options?)` | Applies the plugin and returns the schema typed as `SoftDeleteSchema<typeof schema, typeof options>`
| `SoftDeleteSchema<TSchema, TOptions>` | The type of a schema with the plugin applied

### Document types
| Type | Adds property
| ---  | ---
| `Deleted` | `document.deleted`
| `DeletedAt` | `document.deletedAt`
| `DeletedBy<TUser>` | `document.deletedBy`

### Method types
| Type | Adds method
| ---  | ---
| `DeletedMethods` | `document.delete()`, `document.restore()`
| `DeletedByMethods<TUser>` | `document.deleteByUser(user: TUser)`

### Static types
| Type | Adds static methods
| ---  | ---
| `DeletedStaticMethods<DocType>` | `Model.restoreOne(...)`, `Model.restoreMany(...)`
| `DeletedByStaticMethods<DocType, TUser>` | `Model.deleteOneByUser(user: TUser, ...)`, `Model.deleteManyByUser(user: TUser, ...)`

### Query helper types
| Type | Adds query helpers
| ---  | ---
| `DeletedQuery<T>` | `allDocuments()`, `deletedDocuments()`

### Bulk delete and restore

```typescript
// Delete multiple object
await PetModel.deleteMany({});
await PetModel.deleteMany({ age:10 });
await PetModel.deleteManyByUser(idUser, {});
await PetModel.deleteManyByUser(idUser, { age: 10 });

// Restore multiple object
await PetModel.restoreMany({});
await PetModel.restoreMany({ age: 10 });
```

The delete and restore statics return Mongoose queries, like the built-in methods. A query only runs when it is awaited or `exec()` is called, and it can be chained:

```typescript
const result = await PetModel.deleteMany({ age: 10 }).session(session).exec();
result.deletedCount;
```

### Method overridden

By default, all standard methods will exclude deleted documents from results, documents that have `deleted = true`. To override this behavior use `allDocuments()` or `deletedDocuments()` query helper functions or simply specify the deleted attribute manually.

| only non deleted documents | only deleted documents  | all documents               |
|----------------------------|-------------------------|-----------------------------|
| countDocuments()           | countDocuments().deletedDocuments()   | countDocuments().allDocuments()   |
| find()                     | find().deletedDocuments()             | find().allDocuments()             |
| findById()                 | findById().deletedDocuments()         | findById().allDocuments()         |
| findOne()                  | findOne().deletedDocuments()          | findOne().allDocuments()          |
| exists()                   | exists().deletedDocuments()           | exists().allDocuments()           |
| findOneAndUpdate()         | findOneAndUpdate().deletedDocuments() | findOneAndUpdate().allDocuments() |
| findByIdAndUpdate()        | findByIdAndUpdate().deletedDocuments()| findByIdAndUpdate().allDocuments()|
| updateOne()                | updateOne({ deleted: true })     | updateOne({ deleted: { $in: [true, false] } })        |
| updateMany()               | updateMany({ deleted: true })    | updateMany({ deleted: { $in: [true, false] } })       |
| aggregate()                | aggregate([{ $match: { deleted: true }}])        | aggregate([{ $match: { deleted: { $in: [true, false] } }}])     |

### Examples how to override one or multiple methods

```typescript
// Override all methods (default)
petSchema.plugin(mongooseDelete, { overrideMethods: true });

// Overide only specific methods
petSchema.plugin(mongooseDelete, { overrideMethods: ['countDocuments', 'find', 'findOne'] });
```

Supported methods are `countDocuments`, `find`, `findOne`, `findOneAndUpdate`, `updateOne`, `updateMany` and `aggregate`.

`exists()` is executed by Mongoose as a `findOne()` query, so it is filtered whenever `findOne` is overridden.

### Example of query helpers

```typescript
// will return only NON DELETED documents
const documents = await PetModel.find();

// will return only DELETED documents
const deletedDocuments = await PetModel.find().deletedDocuments();

// will return ALL documents
const allDocuments = await PetModel.find().allDocuments();
```

### Disable model validation on delete

```typescript
// By default, validateBeforeDelete is set to true
petSchema.plugin(mongooseDelete);
// the previous line is identical to next line
petSchema.plugin(mongooseDelete, { validateBeforeDelete: true });

// To disable model validation on delete, set validateBeforeDelete option to false
petSchema.plugin(mongooseDelete, { validateBeforeDelete: false });
```

This is based on existing Mongoose [validateBeforeSave option](http://mongoosejs.com/docs/guide.html#validateBeforeSave)

### Create index on fields

```typescript
// Index only specific fields (default)
petSchema.plugin(mongooseDelete, { indexFields: ['deleted'] });
// or
petSchema.plugin(mongooseDelete, { indexFields: ['deleted', 'deletedAt'] });

// Index all field related to plugin (deleted, deletedAt, deletedBy)
petSchema.plugin(mongooseDelete, { indexFields: true });
```

### Custom field names or schema type definition

```typescript
type Pet = { name: string; deleted_by?: string; deleted_at?: Date };
type PetQueryHelpers = DeletedQueryHelpers<Pet>;
type PetStaticMethods = DeletedStaticMethods<Pet, PetQueryHelpers> & DeletedByStaticMethods<Pet, string, PetQueryHelpers>
type PetModel = Model<Pet, PetQueryHelpers, DeletedMethods & DeletedByMethods<string>> & PetStaticMethods;

const petSchema = new Schema<Pet, PetModel>({
	name: String
});

// Add a custom name for each property, will create alias for the original name (deletedBy/deletedAt)
petSchema.plugin(mongooseDelete, { deletedBy: 'deleted_by', deletedAt: 'deleted_at' });

// Use custom schema type definition by supplying an object
petSchema.plugin(mongooseDelete, { deletedBy: { name: 'deleted_by', type: String }, deletedAt: { name: 'deleted_at' } });
```
Expects a Mongoose [Schema Types](https://mongoosejs.com/docs/schematypes.html#schematype-options) object with the added option of `name`.

## Migrating from 2.x to 3.x

3.x requires Mongoose 9 and Node.js 22 or later. Read the [Mongoose 9 migration guide](https://mongoosejs.com/docs/migrating_to_9.html) first.

- `update` was removed from the `overrideMethods` option. `Model.update()` was removed in Mongoose 7, so the option had no effect.
- `delete()`, `restore()` and `deleteByUser()` are typed with a generic `this` parameter, so they resolve to the document type they are called on.
- Mongoose 9 renamed `FilterQuery` to `QueryFilter`. The filters of the plugin statics are typed with `QueryFilter`, which is stricter than before.
- New: `softDelete()` to get the plugin types without declaring them by hand.

## License

The MIT License

Copyright (c) 2021 Emil Janitzek https://pixel2.se/

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
