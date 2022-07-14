import { HydratedDocument, Query } from 'mongoose';

type DeletedQuery<T = any> = Query<any, HydratedDocument<T>, DeletedQueryHelpers> & DeletedQueryHelpers;

interface DeletedQueryHelpers {
	withDeleted(): this
	notDeleted(): this
	onlyDeleted(): this
}

export default DeletedQuery;
