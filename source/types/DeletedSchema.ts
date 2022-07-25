import { Model, Schema } from 'mongoose';
import Deleted from './Deleted';
import { DeletedQueryHelpers } from './DeletedQuery';
import { DeletedMethods } from '../methods';
import { DeletedInstanceMethods } from '../statics';

type DeletedSchema<T extends Deleted = Deleted, TModel = Model<T, DeletedQueryHelpers<T>, DeletedMethods>> = Schema<T,TModel, DeletedMethods, DeletedQueryHelpers<T>, any, DeletedInstanceMethods<T>, any>
export type DeletedSchemaMethods<T extends Deleted = Deleted> = Schema<T, any, DeletedMethods, any, any, any, any>;
export type DeletedSchemaInstanceMethods<T extends Deleted = Deleted, TModel = Model<T, DeletedQueryHelpers<T>, DeletedMethods>> = Schema<T, TModel, any, any, any, DeletedInstanceMethods<T>, any>
export type DeletedQueryHelpersSchema<T extends Deleted = Deleted> = Schema<T, any, any, DeletedQueryHelpers<T>, any, any, any>

export default DeletedSchema;
