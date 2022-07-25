import Deleted from '../types/Deleted';
import deletedProp from './deleteProp';
import DeletedFieldOptions from '../types/DeletedFieldOptions';
import { UpdateQuery } from 'mongoose';

export default function deleteDocument<TUser>(
	{ deletedAt, deletedBy }: DeletedFieldOptions,
	user?: TUser,
): Record<string, unknown> {
	return {
		deleted: true,
		...deletedProp(deletedAt, new Date()),
		...(user && deletedProp(deletedBy, user))
	};
}

export function staticDelete<TUser>(
	deletedFieldOptions: DeletedFieldOptions,
	user?: TUser,
): UpdateQuery<Deleted> {
	return {
		$set: deleteDocument(deletedFieldOptions, user)
	};
}
