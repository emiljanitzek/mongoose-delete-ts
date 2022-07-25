import { DeletedQueryHelpers } from '../../source/types/DeletedQuery';
import { DeleteOptions } from '../../source/types/DeleteOptions';
import mongoose, { Schema, SchemaDefinition, SchemaDefinitionType, SchemaOptions } from 'mongoose';
import deletedPlugin, { Deleted, DeletedInstanceMethods, DeletedMethods } from '../../source';

export default function setupModel<T extends Deleted, TModel>(
	modelName: string,
	fields: SchemaDefinition<SchemaDefinitionType<T>>,
	deletedOptions: DeleteOptions = {},
	schemaOptions: SchemaOptions<string, any, any, any> = {}
): TModel {
	const testSchema = new Schema<T, any, DeletedMethods, DeletedQueryHelpers<T>, any, DeletedInstanceMethods<T>, any>(fields, {
		collection: testCollectionName(modelName),
		autoIndex: false,
		...schemaOptions
	});
	testSchema.plugin(deletedPlugin, deletedOptions);
	return mongoose.model<T, TModel, DeletedQueryHelpers<T>>(modelName, testSchema);
}

export function testCollectionName(modelName: string): string {
	return `mongoose_delete_${modelName}`;
}
