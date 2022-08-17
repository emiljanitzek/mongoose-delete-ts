import { Callback, SaveOptions } from 'mongoose';
import DeletedSchema from './types/DeletedSchema';
import deleteDocument from './utils/deleteDocument';
import DeletedFieldOptions from './types/DeletedFieldOptions';
import restoreDocument from './utils/restoreDocument';
import { DeleteOptions } from './types/DeleteOptions';

export interface DeletedMethods {
	restore(options?: SaveOptions): Promise<this>
	restore(options?: SaveOptions, fn?: Callback<this>): void;
	restore(fn?: Callback<this>): void;
}

export interface DeletedByMethods<TUser = any> {
	deleteByUser(user: TUser, options?: SaveOptions): Promise<this>
	deleteByUser(user: TUser, options?: SaveOptions, fn?: Callback<this>): void
	deleteByUser(user: TUser, fn?: Callback<this>): void;
}

export default function(
	schema: DeletedSchema,
	options: DeleteOptions,
	deletedFieldOptions: DeletedFieldOptions
): void {
	schema.methods.delete = function(...args: any[]) {
		this.set(deleteDocument(deletedFieldOptions));
		return this.save(...mergeArguments(args, options));
	};
	schema.methods.deleteByUser = function<TUser>(user: TUser, ...args: any[]) {
		this.set(deleteDocument(deletedFieldOptions, user));
		return this.save(...mergeArguments(args, options));
	};
	schema.methods.restore = function(...args: any[]) {
		this.set(restoreDocument(deletedFieldOptions));
		return this.save(...mergeArguments(args, options));
	};
}

function mergeArguments(
	args: any[],
	options: DeleteOptions
): unknown[] {
	const saveOptions = typeof args[0] === 'object' ? args[0] : {};
	const callback = typeof args[0] === 'function' ? args[0] : args[1];
	if (typeof options.validateBeforeDelete !== 'undefined') {
		Object.assign(saveOptions, { validateBeforeSave: Boolean(options.validateBeforeDelete) });
	}
	Object.assign(saveOptions, { timestamps: false });
	return [saveOptions, callback];
}
