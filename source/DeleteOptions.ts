import { SchemaTypeOptions, Types } from 'mongoose';

export type Methods =  'count' | 'countDocuments' | 'find' | 'findOne' | 'findOneAndUpdate' | 'update' | 'updateOne' | 'updateMany' | 'aggregate';
export type Properties = 'deleted' | 'deletedAt' | 'deletedBy';

type DeleteSchemaOptions<T> = Omit<SchemaTypeOptions<T>, 'alias'> & {
	name?: string;
}

export type DeletedField<T> = boolean | string | DeleteSchemaOptions<T>

export type DeleteOptions<TUser = Types.ObjectId> = Partial<{
	deletedBy: DeletedField<TUser>;
	deletedAt: DeletedField<Date>;
	overrideMethods: Methods[] | boolean;
	indexFields: Properties[] | boolean;
	validateBeforeDelete: boolean;
}>
