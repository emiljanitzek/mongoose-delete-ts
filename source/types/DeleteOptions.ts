import { SchemaTypeOptions } from 'mongoose';

export type Methods =  'count' | 'countDocuments' | 'find' | 'findOne' | 'findOneAndUpdate' | 'update' | 'updateOne' | 'updateMany' | 'aggregate';
export type Properties = 'deleted' | 'deletedAt' | 'deletedBy';

type DeletedSchemaOptions<T> = Omit<SchemaTypeOptions<T>, 'alias'> & {
	name?: string;
}

export type DeletedField<T> = boolean | string | DeletedSchemaOptions<T>

export type DeleteOptions<TUser = any> = Partial<{
	deleted: SchemaTypeOptions<boolean>,
	deletedBy: DeletedField<TUser>;
	deletedAt: DeletedField<Date>;
	overrideMethods: Methods[] | boolean;
	indexFields: Properties[] | boolean;
	validateBeforeDelete: boolean;
}>
