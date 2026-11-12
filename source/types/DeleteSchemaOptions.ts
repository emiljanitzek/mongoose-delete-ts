import { SchemaTypeOptions } from 'mongoose';

export type QueryMethods = 'countDocuments' | 'find' | 'findOne' | 'findOneAndUpdate' | 'updateOne' | 'updateMany';
export type Methods = QueryMethods | 'aggregate';
export type Properties = 'deleted' | 'deletedAt' | 'deletedBy';

type DeletedSchemaTypeOptions<T> = Omit<SchemaTypeOptions<T>, 'alias'> & {
	name?: string;
};

export type DeletedField<T> = boolean | string | DeletedSchemaTypeOptions<T>;

export type DeleteSchemaOptions<TUser = any> = Partial<{
	deleted: SchemaTypeOptions<boolean>,
	deletedBy: DeletedField<TUser>;
	deletedAt: DeletedField<Date>;
	overrideMethods: Methods[] | boolean;
	indexFields: Properties[] | boolean;
	validateBeforeDelete: boolean;
}>;
