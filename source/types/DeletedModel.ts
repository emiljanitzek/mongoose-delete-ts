/* eslint-disable @typescript-eslint/no-empty-interface */
import { Types } from 'mongoose';
import DeletedDocument, { DeletedByDocument } from './DeletedDocument';
import { DeletedByInstanceMethods, DeletedInstanceMethods } from '../statics';

/**
 * @deprecated use DeletedInstanceMethods
 */
interface DeletedModel<T extends DeletedDocument, TMethods={}, TVirtuals={}, TQueryHelpers={}> extends
	DeletedInstanceMethods<T, TQueryHelpers> {}

/**
 * @deprecated use DeletedByInstanceMethods
 */
export interface DeletedByModel<T extends DeletedByDocument<TUser, any>, TUser = Types.ObjectId, TMethods={}, TVirtuals={}, TQueryHelpers={}> extends
	DeletedByInstanceMethods<T, TUser, TQueryHelpers> {}

export default DeletedModel;
