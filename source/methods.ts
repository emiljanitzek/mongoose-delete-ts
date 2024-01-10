import { DeleteResult } from 'mongodb';
import { Document, QueryWithHelpers, SaveOptions } from 'mongoose';

import DeletedSchema from './types/DeletedSchema';
import deleteDocument from './utils/deleteDocument';
import DeletedFieldOptions from './types/DeletedFieldOptions';
import restoreDocument from './utils/restoreDocument';
import { DeleteOptions } from './types/DeleteOptions';

export interface DeletedMethods {
	restoreOne(this: Document, saveOptions?: SaveOptions): Promise<this>;
}

export interface DeletedByMethods<TUser = any, T = any, TQueryHelpers = any, DocType = any> {
	deleteOneByUser(user: TUser, saveOptions?: SaveOptions): QueryWithHelpers<
		DeleteResult,
		Document<T, TQueryHelpers, DocType>,
		TQueryHelpers,
		DocType,
		'deleteOne'
	>;
}

export default function(
	schema: DeletedSchema,
	deleteOptions: DeleteOptions,
	deletedFieldOptions: DeletedFieldOptions,
): void {
	schema.methods.deleteOne = async function(saveOptions?: SaveOptions) {
		this.set(deleteDocument(deletedFieldOptions));
		await this.save(mergeArguments(deleteOptions, saveOptions));
		return { acknowledged: true, deletedCount: 1 };
	};
	schema.methods.deleteOneByUser = async function<TUser>(user: TUser, saveOptions?: SaveOptions) {
		this.set(deleteDocument(deletedFieldOptions, user));
		await this.save(mergeArguments(deleteOptions, saveOptions));
		return { acknowledged: true, deletedCount: 1 };
	};
	// @ts-expect-error TypeScript recognizes `this` as `DeletedMethods`, but in fact `this` is Mongoose `Document`.
	schema.methods.restoreOne = function(saveOptions?: SaveOptions) {
		this.set(restoreDocument(deletedFieldOptions));
		return this.save(mergeArguments(deleteOptions, saveOptions));
	};
}

function mergeArguments(deleteOptions: DeleteOptions, saveOptions?: SaveOptions): SaveOptions {
	const options = {};
	if (typeof deleteOptions.validateBeforeDelete !== 'undefined') {
		Object.assign(options, { validateBeforeSave: Boolean(deleteOptions.validateBeforeDelete) });
	}
	Object.assign(options, saveOptions || {}, { timestamps: false });
	return options;
}
