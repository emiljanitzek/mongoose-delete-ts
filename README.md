Mongoose Delete TS Plugin
=========

mongoose-delete-ts is simple and lightweight plugin that enables soft deletion of documents in MongoDB. This code is based on plugin [mongoose-delete](https://github.com/dsanel/mongoose-delete). But completely re-written in TypeScript and using mongoose query helpers. 

[![Build Status](https://github.com/emiljanitzek/mongoose-delete/workflows/Test/badge.svg)](https://github.com/emiljanitzek/mongoose-delete/actions/workflows/test.yml)

## Installation
Install using [npm](https://npmjs.org)
```
npm install mongoose-delete-ts
```

## Before you get started
This plugin uses `$equal: true` for improved query performance. If you are adding this plugin to an existing project, make sure to manually update all existing documents with `deleted=false`

## Usage

We can use this plugin with or without options.

### Simple usage

```typescript
import mongooseDelete, { Deleted, DeletedQueryHelpers, DeletedMethods, DeletedStaticMethods } from 'mongoose-delete-ts';

type Pet = { name: string } & Deleted;
type PetQueryHelpers = DeletedQueryHelpers<Pet>;
type PetStaticMethods = DeletedStaticMethods<Pet, PetQueryHelpers>;
type PetModel = Model<Pet, PetQueryHelpers, DeletedMethods> & PetStaticMethods;

const petSchema = new Schema<Pet, PetModel, DeletedMethods, PetQueryHelpers, {}, PetStaticMethods>({
	name: String
});

petSchema.plugin(mongooseDelete);

const PetPetModel = mongoose.model<PetModel>('Pet', petSchema);

const fluffy = new PetModel({ name: 'Fluffy' });

await fluffy.save();
// mongodb: { name: 'Fluffy', deleted: false }
await fluffy.delete();
// mongodb: { name: 'Fluffy', deleted: true }
await fluffy.restore();
// mongodb: { name: 'Fluffy', deleted: false }

const examplePetId = mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

const petDocument = await PetModel.deleteById(examplePetId);
// mongodb: { _id: '53da93b1...', name: 'Fluffy', deleted: true }
```


### Deleted at timestamp

```typescript
import mongooseDelete, { Deleted, DeletedAt DeletedQueryHelpers, DeletedMethods, DeletedStaticMethods } from 'mongoose-delete-ts';

type Pet = { name: string } & Deleted & DeletedAt;
type PetQueryHelpers = DeletedQueryHelpers<Pet>;
type PetStaticMethods = DeletedStaticMethods<Pet, PetQueryHelpers>;
type PetModel = Model<Pet, PetQueryHelpers, DeletedMethods> & PetStaticMethods;

const petSchema = new Schema<Pet, PetModel, DeletedMethods, PetQueryHelpers, {}, PetStaticMethods>({
	name: String
});

petSchema.plugin(mongooseDelete, { deletedAt: true });

const PetModel = mongoose.model<Pet, PetModel>('Pet', petSchema);

const fluffy = new PetModel({ name: 'Fluffy' });

await fluffy.save();
// mongodb: { name: 'Fluffy', deleted: false }

await fluffy.delete();
// mongodb: { name: 'Fluffy', deleted: true, deletedAt: ISODate("2014-08-01T10:34:53.171Z")}

await fluffy.restore();
// mongodb: { name: 'Fluffy', deleted: false }
```

### Deleted by user

```typescript
import mongooseDelete, { Deleted, DeletedBy DeletedQueryHelpers, DeletedMethods, DeletedStaticMethods } from 'mongoose-delete-ts';

type Pet = { name: string } & Deleted & DeletedBy<Types.ObjectId>;
type PetQueryHelpers = DeletedQueryHelpers<Pet>;
type PetStaticMethods = DeletedStaticMethods<Pet, PetQueryHelpers> & DeletedByStaticMethods<Pet, Types.ObjectId, PetQueryHelpers>
type PetModel = Model<Pet, PetQueryHelpers, DeletedMethods & DeletedByMethods<Types.ObjectId>> & PetStaticMethods;

const petSchema = new Schema<Pet, PetModel, DeletedMethods, PetQueryHelpers, {}, PetStaticMethods>({
	name: String
});

petSchema.plugin(mongooseDelete, { deletedBy: true });

const PetModel = mongoose.model<Pet, PetModel>('Pet', petSchema);

const fluffy = new PetModel({ name: 'Fluffy' });

await fluffy.save();
// mongodb: { name: 'Fluffy', deleted: false }

const idUser = mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

await fluffy.deleteByUser(idUser);
// mongodb: { name: 'Fluffy', deleted: true, deletedBy: ObjectId("53da93b16b4a6670076b16bf")}

await fluffy.restore();
// mongodb: { name: 'Fluffy', deleted: false }
```

The type for `deletedBy` does not have to be `ObjectId`, you can set a custom type, such as `String`.

```typescript
import mongooseDelete, { Deleted, DeletedBy DeletedQueryHelpers, DeletedMethods, DeletedStaticMethods } from 'mongoose-delete-ts';

type Pet = { name: string } & Deleted & DeletedBy<string>;
type PetQueryHelpers = DeletedQueryHelpers<Pet>;
type PetStaticMethods = DeletedStaticMethods<Pet, PetQueryHelpers> & DeletedByStaticMethods<Pet, string, PetQueryHelpers>
type PetModel = Model<Pet, PetQueryHelpers, DeletedMethods & DeletedByMethods<string>> & PetStaticMethods;

const petSchema = new Schema<Pet, PetModel, DeletedMethods, PetQueryHelpers, {}, PetStaticMethods>({
	name: String
});

petSchema.plugin(mongooseDelete, { deletedBy: { type: String } });

const PetModel = mongoose.model<Pet, PetModel>('Pet', petSchema);

const fluffy = new PetModel({ name: 'Fluffy' });

await fluffy.save();
// mongodb: { deleted: false, name: 'Fluffy' }

const userName = 'John Doe';

await fluffy.deleteByUser(userName)
// mongodb: { name: 'Fluffy', deleted: true, deletedBy: 'John Doe' }

await fluffy.restore()
```

## TypeScript support

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
PetModel.deleteMany({});
PetModel.deleteMany({ age:10 });
PetModel.deleteManyByUser(idUser, {});
PetModel.deleteManyByUser(idUser, { age: 10 });

// Restore multiple object
PetModel.restoreMany({});
PetModel.restoreMany({ age: 10 });
```

### Method overridden

By default, all standard methods will exclude deleted documents from results, documents that have `deleted = true`. To override this behavior use `allDocuments()` or `deletedDocuments()` query helper functions or simply specify the deleted attribute manually.

| only non deleted documents | only deleted documents  | all documents               |
|----------------------------|-------------------------|-----------------------------|
| countDocuments()           | countDocuments().deletedDocuments()   | countDocuments().allDocuments()   |
| find()                     | find().deletedDocuments()             | find().allDocuments()             |
| findById()                 | findById().deletedDocuments()         | findById().allDocuments()         |
| findOne()                  | findOne().deletedDocuments()          | findOne().allDocuments()          |
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

## License

The MIT License

Copyright (c) 2021 Emil Janitzek https://pixel2.se/

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
