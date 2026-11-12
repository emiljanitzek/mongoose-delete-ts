import { SaveOptions } from 'mongoose';
import DeletedSchema from './types/DeletedSchema';
import deleteDocument from './utils/deleteDocument';
import DeletedFieldOptions from './types/DeletedFieldOptions';
import restoreDocument from './utils/restoreDocument';
import { DeleteSchemaOptions } from './types/DeleteSchemaOptions';
import mergeOptions from './utils/mergeOptions';

export type DeleteDocumentOptions = Omit<SaveOptions, 'timestamps'>;

export interface DeletedMethods {
	delete<TDocument>(this: TDocument, options?: DeleteDocumentOptions): Promise<TDocument>;
	restore<TDocument>(this: TDocument, options?: DeleteDocumentOptions): Promise<TDocument>;
}

export interface DeletedByMethods<TUser = any> {
	deleteByUser<TDocument>(this: TDocument, user: TUser, options?: DeleteDocumentOptions): Promise<TDocument>;
}

export default function(
	schema: DeletedSchema,
	schemaOptions: DeleteSchemaOptions,
	deletedFieldOptions: DeletedFieldOptions
): void {
	schema.methods.delete = function(options?: DeleteDocumentOptions) {
		this.set(deleteDocument(deletedFieldOptions));
		return this.save(mergeOptions(options, schemaOptions));
	};
	schema.methods.deleteByUser = function(user: unknown, options?: DeleteDocumentOptions) {
		this.set(deleteDocument(deletedFieldOptions, user));
		return this.save(mergeOptions(options, schemaOptions));
	};
	schema.methods.restore = function(options?: DeleteDocumentOptions) {
		this.set(restoreDocument(deletedFieldOptions));
		return this.save(mergeOptions(options, schemaOptions));
	};
}
