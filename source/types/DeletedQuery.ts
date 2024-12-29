import { HydratedDocument, QueryWithHelpers } from 'mongoose';
import Deleted from './Deleted';

type DeletedQuery<T extends Deleted, TDoc = HydratedDocument<T, any, any>> = QueryWithHelpers<any, TDoc, DeletedQueryHelpers<T, TDoc>, any>;

export interface DeletedQueryHelpers<T extends Deleted, TDoc = HydratedDocument<T, any, any>> {
	allDocuments(this: DeletedQuery<T, TDoc>): this
	deletedDocuments(this: DeletedQuery<T, TDoc>): this
}

export default DeletedQuery;
