import { DeleteOptions } from '../../source/DeleteOptions';
import mongoose, { Schema, SchemaDefinition, SchemaDefinitionType, SchemaOptions } from 'mongoose';
import mongooseDelete from '../../source';

export default function setupModel<TDocument, TModel>(
	modelName: string,
	fields: SchemaDefinition<SchemaDefinitionType<TDocument>>,
	deletedOptions: DeleteOptions = {},
	schemaOptions: SchemaOptions = {}
): TModel {
	const TestSchema = new Schema<TDocument, TModel>(fields, {
		collection: testCollectionName(modelName),
		autoIndex: false,
		...schemaOptions
	});
	TestSchema.plugin(mongooseDelete, deletedOptions);
	return mongoose.model<TDocument, TModel>(modelName, TestSchema);
}

export function testCollectionName(modelName: string): string {
	return `mongoose_delete_${modelName}`;
}
