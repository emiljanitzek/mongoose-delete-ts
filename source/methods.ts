import { SaveOptions } from 'mongoose';
import DeletedSchema from './types/DeletedSchema';
import deleteDocument from './utils/deleteDocument';
import DeletedFieldOptions from './types/DeletedFieldOptions';
import restoreDocument from './utils/restoreDocument';
import { DeleteSchemaOptions } from './types/DeleteSchemaOptions';
import mergeOptions from './utils/mergeOptions';

type DeleteOptions = Omit<SaveOptions, 'timestamps'>;
export interface DeletedMethods {
	delete(options?: DeleteOptions): Promise<this>
	restore(options?: DeleteOptions): Promise<this>
}

export interface DeletedByMethods<TUser = any> {
	deleteByUser(user: TUser, options?: DeleteOptions): Promise<this>
}

export default function(
	schema: DeletedSchema,
	schemaOptions: DeleteSchemaOptions,
	deletedFieldOptions: DeletedFieldOptions
): void {
	schema.methods.delete = function(options?: SaveOptions) {
		this.set(deleteDocument(deletedFieldOptions));
		return this.save(mergeOptions(options, schemaOptions));
	};
	schema.methods.deleteByUser = function<TUser>(user: TUser, options?: SaveOptions) {
		this.set(deleteDocument(deletedFieldOptions, user));
		return this.save(mergeOptions(options, schemaOptions));
	};
	schema.methods.restore = function(options?: SaveOptions) {
		this.set(restoreDocument(deletedFieldOptions));
		return this.save(mergeOptions(options, schemaOptions));
	};
}
