import { DeleteResult } from 'mongodb';
import {
	FilterQuery,
	Model,
	QueryOptions,
	QueryWithHelpers,
	UpdateWriteOpResult,
} from 'mongoose';

import DeletedSchema from './types/DeletedSchema';
import getOverloadedArguments from './utils/getOverloadedArguments';
import { staticDelete } from './utils/deleteDocument';
import DeletedFieldOptions from './types/DeletedFieldOptions';
import { staticRestore } from './utils/restoreDocument';

export interface DeletedStaticMethods<T, TQueryHelpers={}> {
	restoreOne(filter?: FilterQuery<T>, options?: QueryOptions | null): QueryWithHelpers<UpdateWriteOpResult, T, TQueryHelpers>;
	restoreOne(filter?: FilterQuery<T>): QueryWithHelpers<UpdateWriteOpResult, T, TQueryHelpers>;

	restoreMany(filter?: FilterQuery<T>, options?: QueryOptions | null): QueryWithHelpers<UpdateWriteOpResult, T, TQueryHelpers>;
	restoreMany(filter?: FilterQuery<T>): QueryWithHelpers<UpdateWriteOpResult, T, TQueryHelpers>;
}

export interface DeletedByStaticMethods<T, TUser = any, TQueryHelpers={}> {
	deleteManyByUser(user: TUser, filter?: FilterQuery<T>, options?: QueryOptions): QueryWithHelpers<DeleteResult, T, TQueryHelpers>;
	deleteManyByUser(user: TUser, filter: FilterQuery<T>): QueryWithHelpers<DeleteResult, T, TQueryHelpers>;

	deleteOneByUser(user: TUser, filter?: FilterQuery<T>, options?: QueryOptions): QueryWithHelpers<DeleteResult, T, TQueryHelpers>;
	deleteOneByUser(user: TUser, filter: FilterQuery<T>): QueryWithHelpers<DeleteResult, T, TQueryHelpers>;
}

export default function(
	schema: DeletedSchema,
	deletedFieldOptions: DeletedFieldOptions
): void {
	schema.statics.deleteOne = async function<T>(filterArg?: FilterQuery<T>, optionsArg?: QueryOptions | null) {
		const [filter, options] = getOverloadedArguments(filterArg, optionsArg);

		const update = staticDelete(deletedFieldOptions);
		const result = await Model.updateOne.apply(this, [filter, update, options]);
		return convertToDeleteResult(result);
	};
	schema.statics.deleteMany = async function<T>(filterArg?: FilterQuery<T>, optionsArg?: QueryOptions | null) {
		const [filter, options] = getOverloadedArguments(filterArg, optionsArg);

		const update = staticDelete(deletedFieldOptions);
		const result = await Model.updateMany.apply(this, [filter, update, options]);
		return convertToDeleteResult(result);
	};

	schema.statics.deleteOneByUser = async function<TUser, T>(user: TUser, filterArg?: FilterQuery<T>, optionsArg?: QueryOptions | null) {
		const [filter, options] = getOverloadedArguments(filterArg, optionsArg);

		const update = staticDelete(deletedFieldOptions, user);
		const result = await Model.updateOne.apply(this, [filter, update, options]);
		return convertToDeleteResult(result);
	};
	schema.statics.deleteManyByUser = async function<TUser, T>(user: TUser, filterArg?: FilterQuery<T>, optionsArg?: QueryOptions | null) {
		const [filter, options] = getOverloadedArguments(filterArg, optionsArg);

		const update = staticDelete(deletedFieldOptions, user);
		const result = await Model.updateMany.apply(this, [filter, update, options]);
		return convertToDeleteResult(result);
	};

	schema.statics.findOneAndDelete = function<T>(filter?: FilterQuery<T>, options?: QueryOptions | null) {
		const update = staticDelete(deletedFieldOptions);
		return Model.findOneAndUpdate.apply(this, [filter, update, options]);
	};
	schema.statics.findByIdAndDelete = function(id: any, options?: QueryOptions | null) {
		const update = staticDelete(deletedFieldOptions);
		return Model.findByIdAndUpdate.apply(this, [id, update, options] as any);
	};

	schema.statics.restoreOne = function<T>(filterArg?: FilterQuery<T>, optionsArg?: QueryOptions | null) {
		const [filter, options] = getOverloadedArguments(filterArg, optionsArg);
		Object.assign(options, { ignoreDeleted: true });

		const update = staticRestore(deletedFieldOptions);
		return Model.updateOne.apply(this, [filter, update, options]) as any;
	};
	schema.statics.restoreMany = function<T>(filterArg?: FilterQuery<T>, optionsArg?: QueryOptions | null) {
		const [filter, options] = getOverloadedArguments(filterArg, optionsArg);
		Object.assign(options, { ignoreDeleted: true });

		const update = staticRestore(deletedFieldOptions);
		return Model.updateMany.apply(this, [filter, update, options]) as any;
	};
}

function convertToDeleteResult(result: UpdateWriteOpResult): DeleteResult {
	return {
		acknowledged: result.acknowledged,
		deletedCount: result.modifiedCount
	};
}
