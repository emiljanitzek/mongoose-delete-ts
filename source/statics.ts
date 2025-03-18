import {
	FilterQuery,
	Model,
	MongooseQueryOptions,
	QueryOptions,
	QueryWithHelpers,
	RootFilterQuery,
	UpdateWriteOpResult
} from 'mongoose';
import DeletedSchema from './types/DeletedSchema';
import { staticDelete } from './utils/deleteDocument';
import DeletedFieldOptions from './types/DeletedFieldOptions';
import { staticRestore } from './utils/restoreDocument';
import { 
	DeleteResult, 
	DeleteOptions as MongoDbDeleteOptions,
	UpdateOptions as MongoDbUpdateOptions
} from 'mongodb';
import { DeleteSchemaOptions } from './types/DeleteSchemaOptions';
import mergeOptions from './utils/mergeOptions';

type DeleteOptions<RawDocType> = MongoDbDeleteOptions & Omit<MongooseQueryOptions<RawDocType>, 'lean' | 'timestamps'>;
type UpdateOptions<RawDocType> = MongoDbUpdateOptions & Omit<MongooseQueryOptions<RawDocType>, 'lean'>;

export interface DeletedStaticMethods<DocType, THelpers = {}, RawDocType = DocType> {
	restoreOne(
		filter?: FilterQuery<RawDocType>, 
		options?: UpdateOptions<RawDocType> | null
	): QueryWithHelpers<UpdateWriteOpResult, DocType, THelpers, RawDocType, 'updateOne'>;

	restoreMany(
		filter?: FilterQuery<RawDocType>, 
		options?: UpdateOptions<RawDocType> | null
	): QueryWithHelpers<UpdateWriteOpResult, DocType, THelpers, RawDocType, 'updateMany'>;
}

export interface DeletedByStaticMethods<DocType, TUser = any, THelpers = {}, RawDocType = DocType> {
	deleteOneByUser(
		user: TUser, 
		filter?: FilterQuery<RawDocType>, 
		options?: DeleteOptions<RawDocType> | null
	): QueryWithHelpers<DeleteResult, DocType, THelpers, RawDocType, 'deleteOne'>;

	deleteManyByUser(
		user: TUser, 
		filter?: FilterQuery<RawDocType>, 
		options?: DeleteOptions<RawDocType> | null
	): QueryWithHelpers<DeleteResult, DocType, THelpers, RawDocType, 'deleteMany'>;
}

export default function(
	schema: DeletedSchema,
	schemaOptions: DeleteSchemaOptions,
	deletedFieldOptions: DeletedFieldOptions
): void {
	schema.statics.deleteOne = async function<T>(this: Model<any>, filter?: RootFilterQuery<T>, options?: DeleteOptions<T> | null) {
		const update = staticDelete(deletedFieldOptions);
		const result = await this.updateOne.call(this, filter, update, mergeOptions(options, schemaOptions));
		return convertToDeleteResult(result);
	};
	schema.statics.deleteMany = async function<T>(this: Model<any>, filter?: RootFilterQuery<T>, options?: DeleteOptions<T> | null) {
		const update = staticDelete(deletedFieldOptions);
		const result = await this.updateMany.call(this, filter, update, mergeOptions(options, schemaOptions));
		return convertToDeleteResult(result);
	};

	schema.statics.deleteOneByUser = async function<TUser, T>(this: Model<any>, user: TUser, filter?: RootFilterQuery<T>, options?: DeleteOptions<T> | null) {
		const update = staticDelete(deletedFieldOptions, user);
		const result = await this.updateOne.call(this, filter, update, mergeOptions(options, schemaOptions));
		return convertToDeleteResult(result);
	};
	schema.statics.deleteManyByUser = async function<TUser, T>(this: Model<any>, user: TUser, filter?: RootFilterQuery<T>, options?: DeleteOptions<T> | null) {
		const update = staticDelete(deletedFieldOptions, user);
		const result = await this.updateMany.call(this, filter, update, mergeOptions(options, schemaOptions));
		return convertToDeleteResult(result);
	};

	schema.statics.findOneAndDelete = function<T>(this: Model<any>, filter?: RootFilterQuery<T>, options?: QueryOptions | null) {
		const update = staticDelete(deletedFieldOptions);
		return this.findOneAndUpdate.call(this, filter, update, mergeOptions(options, schemaOptions));
	};
	schema.statics.findByIdAndDelete = function(id: any, options?: QueryOptions | null) {
		const update = staticDelete(deletedFieldOptions);
		return this.findByIdAndUpdate.call(this, id, update, mergeOptions(options, schemaOptions));
	};

	schema.statics.restoreOne = function<T>(this: Model<any>, filter?: RootFilterQuery<T>, options?: UpdateOptions<T> | null) {
		const update = staticRestore(deletedFieldOptions);
		return this.updateOne.call(this, { ...filter, deleted: true }, update, mergeOptions(options, schemaOptions));
	};
	schema.statics.restoreMany = function<T>(this: Model<any>, filter?: RootFilterQuery<T>, options?: UpdateOptions<T> | null) {
		const update = staticRestore(deletedFieldOptions);
		return this.updateMany.call(this, { ...filter, deleted: true }, update, mergeOptions(options, schemaOptions));
	};
}

function convertToDeleteResult(result: UpdateWriteOpResult): DeleteResult {
	return {
		acknowledged: result.acknowledged,
		deletedCount: result.modifiedCount
	};
}
