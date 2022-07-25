import { HydratedDocument, Query } from 'mongoose';
import Deleted from './Deleted';

type DeletedQuery<T extends Deleted, TDoc = HydratedDocument<T>> = Query<any, TDoc, DeletedQueryHelpers<T>> & DeletedQueryHelpers<T>;

export interface DeletedQueryHelpers<T extends Deleted, TDoc = HydratedDocument<T>> {
	withDeleted(this: DeletedQuery<T, TDoc>): this
	notDeleted(this: DeletedQuery<T, TDoc>): this
	onlyDeleted(this: DeletedQuery<T, TDoc>): this
}

export default DeletedQuery;
