Mongoose Delete TS Plugin
=========

mongoose-delete-ts is simple and lightweight plugin that enables soft deletion of documents in MongoDB. This code is based on plugin [mongoose-delete](https://github.com/dsanel/mongoose-delete). But completely re-written in TypeScript with and using mongoose query helpers. 

[![Build Status](https://github.com/emiljanitzek/mongoose-delete/workflows/Test/badge.svg)](https://github.com/emiljanitzek/mongoose-delete/actions/workflows/test.yml)

## Features
  - [Overwrite __delete()__ method on document (will not change function signature to keep TypeScript types intact. Does not override standard __remove()__ method)](#simple-usage)
  - Add deleteByUser() method on document
  - [Overrides __deleteById()__ static method](#simple-usage)
  - [Add __deleted__ (true-false) key on document](#simple-usage)
  - [Add __deletedAt__ key to store time of deletion](#save-time-of-deletion)
  - [Add __deletedBy__ key to record who deleted document](#who-has-deleted-the-data)
  - Possibility to use custom key name for deletedAt/deletedBy will add alias to original name
  - Restore deleted documents using __restore__ method
  - [Bulk delete and restore](#bulk-delete-and-restore)
  - Override all static methods to exclude deleted documents by default ([Option to not override static methods](#examples-how-to-override-one-or-multiple-methods))
  - Adds query helper `.withDeleted()` to find all documents (even deleted ones)
  - Adds query helper `.onlyDeleted()` to only find deleted documents
  - Adds query helper `.notDeleted()` to only find non-deleted documents (when method is excluded from overrideMethods)
  - [Disable model validation on delete](#disable-model-validation-on-delete)
  - [Option to create index on delete fields](#create-index-on-fields) (__deleted__, __deletedAt__, __deletedBy__)
  - Will use $equal operator to find non-deleted documents. If you are adding this plugin to an existing project, make sure to manually update all existing documents with `deleted=false`
  - Overrides all **aggregate** to only include non-deleted documents.
  - Overrides **populate** to only populate non-deleted documents

## Installation
Install using [npm](https://npmjs.org)
```
npm install mongoose-delete-ts
```

## Usage

We can use this plugin with or without options.

### Simple usage

```typescript
import mongooseDelete, { DeletedDocument, DeletedModel, DeletedQuery } from 'mongoose-delete-ts';

type PetDocument = Document & DeletedDocument & { name?: string };
type PetModel = Model<PetDocument, DeletedQuery<PetDocument>> & DeletedModel<PetDocument>;

const PetSchema = new Schema<PetDocument, PetModel>({
	name: String
});

PetSchema.plugin(mongooseDelete);

const Pet = mongoose.model<PetModel, PetDocument>('Pet', PetSchema);

const fluffy = new Pet({ name: 'Fluffy' });

await fluffy.save();
// mongodb: { deleted: false, name: 'Fluffy' }
await fluffy.delete();
// mongodb: { deleted: true, name: 'Fluffy' }
await fluffy.restore();
// mongodb: { deleted: false, name: 'Fluffy' }

const examplePetId = mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

const petDocument = await Pet.deleteById(examplePetId);
// mongodb: { deleted: true, name: 'Fluffy', _id: '53da93b1...' }
```


### Save time of deletion

```typescript
import mongooseDelete, { DeletedDocument, DeletedAtDocument, DeletedModel, DeletedQuery } from 'mongoose-delete-ts';

type PetDocument = Document & DeletedDocument & DeletedAtDocument & { name?: string };
type PetModel = Model<PetDocument, DeletedQuery<PetDocument>> & DeletedModel<PetDocument>;

const PetSchema = new Schema<PetDocument, PetModel>({
	name: String
});

PetSchema.plugin(mongooseDelete, { deletedAt: true });

const Pet = mongoose.model<PetDocument, PetModel>('Pet', PetSchema);

const fluffy = new Pet({ name: 'Fluffy' });

await fluffy.save();
// mongodb: { deleted: false, name: 'Fluffy' }

// note: you should invoke delete() method instead of standard fluffy.remove()
await fluffy.delete();
// mongodb: { deleted: true, name: 'Fluffy', deletedAt: ISODate("2014-08-01T10:34:53.171Z")}

await fluffy.restore();
// mongodb: { deleted: false, name: 'Fluffy' }
```


### Who has deleted the data?

```typescript
import mongooseDelete, { DeletedDocument, DeletedByDocument, DeletedModel, DeletedByModel, DeletedQuery } from 'mongoose-delete-ts';

type PetDocument = Document & DeletedDocument & DeletedByDocument & { name?: string };
type PetModel = Model<PetDocument, DeletedQuery<PetDocument>> & DeletedModel<PetDocument> & DeletedByModel<PetDocument>;

const PetSchema = new Schema<PetDocument, PetModel>({
    name: String
});

PetSchema.plugin(mongooseDelete, { deletedBy : true });

const Pet = mongoose.model<PetDocument, PetModel>('Pet', PetSchema);

const fluffy = new Pet({ name: 'Fluffy' });

await fluffy.save();
// mongodb: { deleted: false, name: 'Fluffy' }

const idUser = mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

// note: you should invoke deleteByUser()
await fluffy.deleteByUser(idUser);
// mongodb: { deleted: true, name: 'Fluffy', deletedBy: ObjectId("53da93b16b4a6670076b16bf")}

await fluffy.restore();
// mongodb: { deleted: false, name: 'Fluffy' }
```

The type for `deletedBy` does not have to be `ObjectId`, you can set a custom type, such as `String`.

```typescript
import mongooseDelete, { DeletedDocument, DeletedByDocument, DeletedModel, DeletedByModel, DeletedQuery } from 'mongoose-delete-ts';

type PetDocument = Document & DeletedDocument & DeletedByDocument<string> & { name?: string };
type PetModel = Model<PetDocument, DeletedQuery<PetDocument>> & DeletedModel<PetDocument> & DeletedByModel<PetDocument, string>;

const PetSchema = new Schema<PetDocument, PetModel>({
	name: String
});

PetSchema.plugin(mongooseDelete, { deletedBy: { type: String } });

const Pet = mongoose.model<PetDocument, PetModel>('Pet', PetSchema);

const fluffy = new Pet({ name: 'Fluffy' });

await fluffy.save();
// mongodb: { deleted: false, name: 'Fluffy' }

const idUser = '123456789';

// note: you should invoke deleteByUser()
await fluffy.deleteByUser(idUser)
// mongodb: { deleted: true, name: 'Fluffy', deletedBy: '123456789' }

await fluffy.restore()
```

## TypeScript support

### Document types
| Type | Adds property | Adds method
| ---  | --- | ---
| `DeletedDocument` | `document.deleted` | `document.delete()`, `document.restore()`
| `DeletedAtDocument` | `document.deletedAt` |
| `DeletedByDocument<TUser, TDeletedBy = TUser>` | `document.deletedBy` | `document.deleteByUser(...)`

### Model types
| Type | Adds static methods
| ---  | ---
| `DeletedModel<T>` | `Model.deleteOne(...)`, `Model.deleteMany(...)`, `Model.restoreOne(...)`, `Model.restoreMany(...)`
| `DeletedByModel<T, TUser>` | `Model.deleteOneByUser(...)`, `Model.deleteManyByUser(...)`

### Query helper types
| Type | Adds query helpers
| ---  | ---
| `DeletedQuery<T>` | `notDeleted()`, `onlyDeleted()`, `withDeleted()`

### Bulk delete and restore

```typescript
// Delete multiple object, callback
Pet.deleteMany({});
Pet.deleteMany({ age:10 });
Pet.deleteManyByUser(idUser, {});
Pet.deleteManyByUser(idUser, { age:10 });

// Restore multiple object, callback
Pet.restoreMany({});
Pet.restoreMany({ age:10 });
```

### Method overridden

By default, all standard methods will exclude deleted documents from results, documents that have ```deleted = true```. To change this behavior use query helper methods, so we will be able to work with deleted documents.

| only not deleted documents | only deleted documents  | all documents               |
|----------------------------|-------------------------|-----------------------------|
| countDocuments()           | countDocuments().onlyDeleted()   | countDocuments().withDeleted()   |
| find()                     | find().onlyDeleted()             | find().withDeleted()             |
| findById()                 | findById().onlyDeleted()         | findById().withDeleted()         |
| findOne()                  | findOne().onlyDeleted()          | findOne().withDeleted()          |
| findOneAndUpdate()         | findOneAndUpdate().onlyDeleted() | findOneAndUpdate().withDeleted() |
| findByIdAndUpdate()        | findByIdAndUpdate().onlyDeleted()| findByIdAndUpdate().withDeleted()|
| updateOne()                | updateOne({ deleted: true })     | updateOne({ deleted: { $in: [true, false] })        |
| updateMany()               | updateMany({ deleted: true })    | updateMany({ deleted: { $in: [true, false] })       |
| aggregate()                | aggregate([], { onlyDeleted: true })        | aggregate([], { withDeleted: true })     |

### Examples how to override one or multiple methods

```typescript
// Override all methods (default)
PetSchema.plugin(mongooseDelete, { overrideMethods: true });

// Overide only specific methods
PetSchema.plugin(mongooseDelete, { overrideMethods: ['count', 'find', 'findOne'] });
```

### Example of usage overridden methods

```typescript
// will return only NOT DELETED documents
const documents = await Pet.find();

// will return only DELETED documents
const deletedDocuments = await Pet.find().onlyDeleted();

// will return ALL documents
const allDocuments = await Pet.find().withDeleted();

// will return only NOT DELETED documents (if method is not included in overrideMethods)
PetSchema.plugin(mongooseDelete, { overrideMethods: ['count'] });
const nonDeletedDocuments = await Pet.find().notDeleted();
```

### Disable model validation on delete

```typescript
// By default, validateBeforeDelete is set to true
PetSchema.plugin(mongooseDelete);
// the previous line is identical to next line
PetSchema.plugin(mongooseDelete, { validateBeforeDelete: true });

// To disable model validation on delete, set validateBeforeDelete option to false
PetSchema.plugin(mongooseDelete, { validateBeforeDelete: false });
```

This is based on existing Mongoose [validateBeforeSave option](http://mongoosejs.com/docs/guide.html#validateBeforeSave)

### Create index on fields

```typescript
// Index only specific fields (default)
PetSchema.plugin(mongooseDelete, { indexFields: ['deleted'] });
// or
PetSchema.plugin(mongooseDelete, { indexFields: ['deleted', 'deletedAt'] });

// Index all field related to plugin (deleted, deletedAt, deletedBy)
PetSchema.plugin(mongooseDelete, { indexFields: true });
```

### Custom field names or schema type definition

```typescript
type PetDocument = Document & DeletedDocument & DeletedAtDocument & DeletedByDocument<string> & { name?: string };
type PetModel = Model<PetDocument, DeletedQuery<PetDocument>> & DeletedModel<PetDocument> & DeletedByModel<PetDocument, string>;

const PetSchema = new Schema<PetDocument, PetModel>({
	name: String
});

// Add a custom name for each property, will create alias for the original name (deletedBy/deletedAt)
PetSchema.plugin(mongooseDelete, { deletedBy: 'deleted_by', deletedAt: 'deleted_at' });

// Use custom schema type definition by supplying an object
PetSchema.plugin(mongooseDelete, { deletedBy: { name: 'deleted_by', type: String }, deletedAt: { name: 'deleted_at' } });
```
Expects a Mongoose [Schema Types](https://mongoosejs.com/docs/schematypes.html#schematype-options) object with the added option of `name`.

## License

The MIT License

Copyright (c) 2021 Emil Janitzek https://pixel2.se/

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
