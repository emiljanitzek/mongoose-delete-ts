import { Schema } from 'mongoose';
import DeletedQuery from './DeletedQuery';

export default function(schema: Schema): void {
	schema.query.withDeleted = function(): DeletedQuery['withDeleted'] {
		return this.setOptions({ ignoreDeleted: true });
	};

	schema.query.notDeleted = function(): DeletedQuery['notDeleted'] {
		return this.where({ deleted: false });
	};

	schema.query.onlyDeleted = function(): DeletedQuery['onlyDeleted'] {
		return this.where({ deleted: true });
	};
}
