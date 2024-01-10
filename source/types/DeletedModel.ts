/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Types } from 'mongoose';
import DeletedDocument, { DeletedByDocument } from './DeletedDocument';
import { DeletedByStaticMethods, DeletedStaticMethods } from '../statics';

/**
 * @deprecated use DeletedInstanceMethods
 */
interface DeletedModel<
	T extends DeletedDocument,
	TMethods = {},
	TVirtuals = {},
	TQueryHelpers = {}
> extends DeletedStaticMethods<T, TQueryHelpers> {}

/**
 * @deprecated use DeletedByInstanceMethods
 */
export interface DeletedByModel<
	T extends DeletedByDocument<TUser, any>,
	TUser = Types.ObjectId,
	TMethods = {},
	TVirtuals = {},
	TQueryHelpers = {}
> extends DeletedByStaticMethods<T, TUser, TQueryHelpers> {}

export default DeletedModel;
