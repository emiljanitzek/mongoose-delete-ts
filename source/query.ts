import { Query, Schema } from 'mongoose';
import DeletedDocument from './DeletedDocument';

export interface DeletedQuery<T extends DeletedDocument> {
	withDeleted(): Query<T | null, T>
	notDeleted(): Query<T | null, T>
	onlyDeleted(): Query<T | null, T>
}

export default function<T extends DeletedDocument>(schema: Schema): void {
	schema.query.withDeleted = function(): DeletedQuery<T>['withDeleted'] {
		return this.setOptions({ ignoreDeleted: true });
	};

	schema.query.notDeleted = function(): DeletedQuery<T>['notDeleted'] {
		return this.where({ deleted: false });
	};

	schema.query.onlyDeleted = function(): DeletedQuery<T>['onlyDeleted'] {
		return this.where({ deleted: true });
	};
}
