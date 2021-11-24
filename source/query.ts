import { Schema } from 'mongoose';
import DeletedDocument from './DeletedDocument';
import DeletedQuery from './DeletedQuery';

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
