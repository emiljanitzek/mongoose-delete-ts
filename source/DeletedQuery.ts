import DeletedDocument from './DeletedDocument';
import { Query } from 'mongoose';

interface DeletedQuery<T extends DeletedDocument> {
	withDeleted(): Query<T | null, T>
	notDeleted(): Query<T | null, T>
	onlyDeleted(): Query<T | null, T>
}

export default DeletedQuery;
