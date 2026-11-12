import {
	DeleteResult,
	Model,
	mongo,
	MongooseBaseQueryOptions,
	QueryFilter,
	QueryOptions,
	QueryWithHelpers,
	UpdateWriteOpResult
} from 'mongoose';
import DeletedSchema from './types/DeletedSchema';
import { staticDelete } from './utils/deleteDocument';
import DeletedFieldOptions from './types/DeletedFieldOptions';
import { staticRestore } from './utils/restoreDocument';
import { DeleteSchemaOptions } from './types/DeleteSchemaOptions';
import mergeOptions from './utils/mergeOptions';

export type DeleteQueryOptions<RawDocType = unknown> = mongo.DeleteOptions & Omit<MongooseBaseQueryOptions<RawDocType>, 'lean' | 'timestamps'>;
export type RestoreQueryOptions<RawDocType = unknown> = mongo.UpdateOptions & Omit<MongooseBaseQueryOptions<RawDocType>, 'lean'>;

export interface DeletedStaticMethods<DocType, THelpers = {}, RawDocType = DocType> {
	restoreOne(
		filter?: QueryFilter<RawDocType>,
		options?: RestoreQueryOptions<RawDocType> | null
	): QueryWithHelpers<UpdateWriteOpResult, DocType, THelpers, RawDocType, 'updateOne'>;

	restoreMany(
		filter?: QueryFilter<RawDocType>,
		options?: RestoreQueryOptions<RawDocType> | null
	): QueryWithHelpers<UpdateWriteOpResult, DocType, THelpers, RawDocType, 'updateMany'>;
}

export interface DeletedByStaticMethods<DocType, TUser = any, THelpers = {}, RawDocType = DocType> {
	deleteOneByUser(
		user: TUser,
		filter?: QueryFilter<RawDocType>,
		options?: DeleteQueryOptions<RawDocType> | null
	): QueryWithHelpers<DeleteResult, DocType, THelpers, RawDocType, 'deleteOne'>;

	deleteManyByUser(
		user: TUser,
		filter?: QueryFilter<RawDocType>,
		options?: DeleteQueryOptions<RawDocType> | null
	): QueryWithHelpers<DeleteResult, DocType, THelpers, RawDocType, 'deleteMany'>;
}

type AnyModel = Model<any>;
type Filter = QueryFilter<any> | null | undefined;

export default function(
	schema: DeletedSchema,
	schemaOptions: DeleteSchemaOptions,
	deletedFieldOptions: DeletedFieldOptions
): void {
	schema.statics.deleteOne = function(this: AnyModel, filter?: Filter, options?: DeleteQueryOptions | null) {
		return this.updateOne(filter ?? {}, staticDelete(deletedFieldOptions), mergeOptions(options, schemaOptions))
			.transform(toDeleteResult);
	};
	schema.statics.deleteMany = function(this: AnyModel, filter?: Filter, options?: DeleteQueryOptions | null) {
		return this.updateMany(filter ?? {}, staticDelete(deletedFieldOptions), mergeOptions(options, schemaOptions))
			.transform(toDeleteResult);
	};

	schema.statics.deleteOneByUser = function(this: AnyModel, user: unknown, filter?: Filter, options?: DeleteQueryOptions | null) {
		return this.updateOne(filter ?? {}, staticDelete(deletedFieldOptions, user), mergeOptions(options, schemaOptions))
			.transform(toDeleteResult);
	};
	schema.statics.deleteManyByUser = function(this: AnyModel, user: unknown, filter?: Filter, options?: DeleteQueryOptions | null) {
		return this.updateMany(filter ?? {}, staticDelete(deletedFieldOptions, user), mergeOptions(options, schemaOptions))
			.transform(toDeleteResult);
	};

	schema.statics.findOneAndDelete = function(this: AnyModel, filter?: Filter, options?: QueryOptions | null) {
		return this.findOneAndUpdate(filter ?? {}, staticDelete(deletedFieldOptions), mergeOptions(options, schemaOptions));
	};
	schema.statics.findByIdAndDelete = function(this: AnyModel, id: unknown, options?: QueryOptions | null) {
		return this.findByIdAndUpdate(id, staticDelete(deletedFieldOptions), mergeOptions(options, schemaOptions));
	};

	schema.statics.restoreOne = function(this: AnyModel, filter?: Filter, options?: RestoreQueryOptions | null) {
		return this.updateOne({ ...filter, deleted: true }, staticRestore(deletedFieldOptions), mergeOptions(options, schemaOptions));
	};
	schema.statics.restoreMany = function(this: AnyModel, filter?: Filter, options?: RestoreQueryOptions | null) {
		return this.updateMany({ ...filter, deleted: true }, staticRestore(deletedFieldOptions), mergeOptions(options, schemaOptions));
	};
}

function toDeleteResult(result: UpdateWriteOpResult): DeleteResult {
	return {
		acknowledged: result.acknowledged,
		deletedCount: result.modifiedCount
	};
}
