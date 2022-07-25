import { Schema } from 'mongoose';
import Deleted from './Deleted';
import { DeletedQueryHelpers } from './DeletedQuery';
import { DeletedMethods } from '../methods';
import { DeletedStaticMethods } from '../statics';

type DeletedSchema<T extends Deleted = Deleted> = Schema<T, any, DeletedMethods, DeletedQueryHelpers<T, any>, any, DeletedStaticMethods<T, any>, any, any>

export default DeletedSchema;
