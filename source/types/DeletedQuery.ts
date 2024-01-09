import { HydratedDocument, QueryWithHelpers } from 'mongoose';
import Deleted from './Deleted';

type DeletedQueryWithHelpers<T extends Deleted, TDoc = HydratedDocument<T, any, any>> = QueryWithHelpers<any, TDoc, DeletedQueryHelpers<T, TDoc>, T>;

export interface DeletedQueryHelpers<T extends Deleted, TDoc = HydratedDocument<T, any, any>> {
	withDeleted(this: DeletedQueryWithHelpers<T, TDoc>): this
	notDeleted(this: DeletedQueryWithHelpers<T, TDoc>): this
	onlyDeleted(this: DeletedQueryWithHelpers<T, TDoc>): this
}

export default DeletedQueryWithHelpers;
