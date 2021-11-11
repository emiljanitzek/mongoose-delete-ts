import deletedProp from './deleteProp';
import DeletedFieldOptions from '../DeletedFieldOptions';
import { UpdateQuery } from 'mongoose';
import DeletedDocument from '../DeletedDocument';

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
): UpdateQuery<DeletedDocument> {
	return {
		$set: deleteDocument(deletedFieldOptions, user)
	};
}
