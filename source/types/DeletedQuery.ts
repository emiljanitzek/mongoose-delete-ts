import { HydratedDocument, Query } from 'mongoose';
import Deleted from './Deleted';

type DeletedQuery<T extends Deleted, TDoc = HydratedDocument<T>> = Query<any, TDoc, DeletedQueryHelpers<T>> & DeletedQueryHelpers<T>;

export interface DeletedQueryHelpers<T extends Deleted> {
	withDeleted(this: DeletedQuery<T>): this
	notDeleted(this: DeletedQuery<T>): this
	onlyDeleted(this: DeletedQuery<T>): this
}

export default DeletedQuery;
