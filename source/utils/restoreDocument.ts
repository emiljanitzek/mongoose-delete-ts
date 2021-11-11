import deletedProp from './deleteProp';
import DeletedFieldOptions from '../DeletedFieldOptions';

export default function restoreDocument(
	{ deletedAt, deletedBy }: DeletedFieldOptions
): Record<string, unknown> {
	return {
		deleted: false,
		...deletedProp(deletedAt, undefined),
		...deletedProp(deletedBy, undefined)
	};
}

export function staticRestore(
	{ deletedAt, deletedBy }: DeletedFieldOptions
): Record<string, unknown> {
	return {
		$set: { deleted: false },
		$unset: {
			...deletedProp(deletedAt, 1),
			...deletedProp(deletedBy, 1)
		}
	};
}
