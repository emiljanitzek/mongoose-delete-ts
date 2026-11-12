import { HydratedDocument, Query, QueryWithHelpers } from 'mongoose';
import Deleted from './Deleted';

type DeletedQuery<T extends Deleted, TDoc = HydratedDocument<T, any, any>> = QueryWithHelpers<any, TDoc, DeletedQueryHelpers<T, TDoc>, any, any, any, any>;

export interface DeletedQueryHelpers<T extends Deleted = Deleted, _TDoc = HydratedDocument<T, any, any>> {
	allDocuments<TQuery extends Query<any, any, any, any, any, any, any>>(this: TQuery): TQuery;
	deletedDocuments<TQuery extends Query<any, any, any, any, any, any, any>>(this: TQuery): TQuery;
}

export default DeletedQuery;
