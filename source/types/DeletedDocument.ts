/* eslint-disable @typescript-eslint/no-empty-interface */
import { DeletedByMethods, DeletedMethods } from '../methods';
import Deleted from './Deleted';
import DeletedAt from './DeletedAt';
import DeletedBy from './DeletedBy';

/**
 * @deprecated use Deleted and DeletedMethods
 */
interface DeletedDocument extends Deleted, DeletedMethods {}

/**
 * @deprecated use DeletedAt
 */
export interface DeletedAtDocument extends DeletedAt {}

/**
 * @deprecated use DeletedBy and DeletedByMethods
 */
export interface DeletedByDocument<TUser = any, TDeletedBy = TUser> extends
	DeletedBy<TDeletedBy>,
	DeletedByMethods<TUser> {}

export default DeletedDocument;
