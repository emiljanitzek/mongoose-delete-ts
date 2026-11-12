import { Schema } from 'mongoose';
import deletedPlugin from './plugin';
import { DeleteSchemaOptions } from './types/DeleteSchemaOptions';
import { SoftDeleteSchema } from './types/SoftDeleteSchema';

export default function softDelete<
	TSchema extends Schema<any, any, any, any, any, any, any, any, any, any, any>,
	const TOptions extends DeleteSchemaOptions = {}
>(
	schema: TSchema,
	options?: TOptions
): SoftDeleteSchema<TSchema, TOptions> {
	schema.plugin(deletedPlugin, options);
	return schema as unknown as SoftDeleteSchema<TSchema, TOptions>;
}
