import mongoose, { Schema, SchemaDefinition, SchemaDefinitionType, SchemaOptions } from 'mongoose';
import deletedPlugin, {
	Deleted,
	DeletedMethods,
	DeletedQueryHelpers,
	DeletedStaticMethods,
	DeleteOptions
} from '../../source';

export default function setupModel<T extends Deleted, TModel>(
	modelName: string,
	fields: SchemaDefinition<SchemaDefinitionType<T>>,
	deletedOptions: DeleteOptions = {},
	schemaOptions: SchemaOptions<string, any, any, any> = {}
): TModel {
	const testSchema = new Schema<T, any, DeletedMethods, DeletedQueryHelpers<T>, any, DeletedStaticMethods<T>, any, any>(fields, {
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
