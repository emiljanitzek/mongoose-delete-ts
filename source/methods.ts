import { Schema } from 'mongoose';
import deleteDocument from './utils/deleteDocument';
import DeletedFieldOptions from './DeletedFieldOptions';
import restoreDocument from './utils/restoreDocument';
import { DeleteOptions } from './DeleteOptions';

export default function(
	schema: Schema,
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
