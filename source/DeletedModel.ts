import {
	Callback, CallbackWithoutResult, EnforceDocument, FilterQuery, QueryOptions,
	QueryWithHelpers, Types, UpdateWriteOpResult
} from 'mongoose';
import { DeleteResult } from 'mongodb';

interface DeletedModel<T, TMethods={}, TVirtuals={}, TQueryHelpers={}> {
	restoreOne(filter?: FilterQuery<T>, options?: QueryOptions | null, callback?: Callback): QueryWithHelpers<UpdateWriteOpResult, EnforceDocument<T, TMethods, TVirtuals>, TQueryHelpers, T>;
	restoreOne(filter?: FilterQuery<T>, callback?: Callback): QueryWithHelpers<UpdateWriteOpResult, EnforceDocument<T, TMethods, TVirtuals>, TQueryHelpers, T>;
	restoreOne(callback?: Callback): QueryWithHelpers<UpdateWriteOpResult, EnforceDocument<T, TMethods, TVirtuals>, TQueryHelpers, T>;

	restoreMany(filter?: FilterQuery<T>, options?: QueryOptions | null, callback?: Callback): QueryWithHelpers<UpdateWriteOpResult, EnforceDocument<T, TMethods, TVirtuals>, TQueryHelpers, T>;
	restoreMany(filter?: FilterQuery<T>, callback?: Callback): QueryWithHelpers<UpdateWriteOpResult, EnforceDocument<T, TMethods, TVirtuals>, TQueryHelpers, T>;
	restoreMany(callback?: Callback): QueryWithHelpers<UpdateWriteOpResult, EnforceDocument<T, TMethods, TVirtuals>, TQueryHelpers, T>;
}

export interface DeletedByModel<T, TUser = Types.ObjectId, TMethods={}, TVirtuals={}, TQueryHelpers={}> {
	deleteManyByUser(user: TUser, filter?: FilterQuery<T>, options?: QueryOptions, callback?: CallbackWithoutResult): QueryWithHelpers<DeleteResult, EnforceDocument<T, TMethods, TVirtuals>, TQueryHelpers, T>;
	deleteManyByUser(user: TUser, filter: FilterQuery<T>, callback: CallbackWithoutResult): QueryWithHelpers<DeleteResult, EnforceDocument<T, TMethods, TVirtuals>, TQueryHelpers, T>;
	deleteManyByUser(user: TUser, callback: CallbackWithoutResult): QueryWithHelpers<DeleteResult, EnforceDocument<T, TMethods, TVirtuals>, TQueryHelpers, T>;

	deleteOneByUser(user: TUser, filter?: FilterQuery<T>, options?: QueryOptions, callback?: CallbackWithoutResult): QueryWithHelpers<DeleteResult, EnforceDocument<T, TMethods, TVirtuals>, TQueryHelpers, T>;
	deleteOneByUser(user: TUser, filter: FilterQuery<T>, callback: CallbackWithoutResult): QueryWithHelpers<DeleteResult, EnforceDocument<T, TMethods, TVirtuals>, TQueryHelpers, T>;
	deleteOneByUser(user: TUser, callback: CallbackWithoutResult): QueryWithHelpers<DeleteResult, EnforceDocument<T, TMethods, TVirtuals>, TQueryHelpers, T>;
}

export default DeletedModel;
