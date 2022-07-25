import { HydratedDocument, Query } from 'mongoose';
import Deleted from './Deleted';

type DeletedQuery<T extends Deleted, TDoc = HydratedDocument<T, any, any>> = Query<any, TDoc, DeletedQueryHelpers<T, TDoc>> & DeletedQueryHelpers<T, TDoc>;

export interface DeletedQueryHelpers<T extends Deleted, TDoc = HydratedDocument<T, any, any>> {
	withDeleted(this: DeletedQuery<T, TDoc>): this
	notDeleted(this: DeletedQuery<T, TDoc>): this
	onlyDeleted(this: DeletedQuery<T, TDoc>): this
}

export default DeletedQuery;
