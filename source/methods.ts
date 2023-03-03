import { SaveOptions } from 'mongoose';
import DeletedSchema from './types/DeletedSchema';
import deleteDocument from './utils/deleteDocument';
import DeletedFieldOptions from './types/DeletedFieldOptions';
import restoreDocument from './utils/restoreDocument';
import { DeleteOptions } from './types/DeleteOptions';

export interface DeletedMethods {
	deleteOne(saveOptions?: SaveOptions): Promise<this>;
	restoreOne(saveOptions?: SaveOptions): Promise<this>;
}

export interface DeletedByMethods<TUser = any> {
	deleteOneByUser(user: TUser, saveOptions?: SaveOptions): Promise<this>;
}

export default function(
	schema: DeletedSchema,
	deleteOptions: DeleteOptions,
	deletedFieldOptions: DeletedFieldOptions,
): void {
	schema.methods.deleteOne = function(saveOptions?: SaveOptions) {
		this.set(deleteDocument(deletedFieldOptions));
		return this.save(mergeArguments(deleteOptions, saveOptions));
	};
	schema.methods.deleteOneByUser = function<TUser>(user: TUser, saveOptions?: SaveOptions) {
		this.set(deleteDocument(deletedFieldOptions, user));
		return this.save(mergeArguments(deleteOptions, saveOptions));
	};
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
