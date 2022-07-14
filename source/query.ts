import { Schema } from 'mongoose';
import DeletedQuery from './DeletedQuery';

export default function<T, M>(schema: Schema<T, M, {}, DeletedQuery<T>>): void {
	schema.query.withDeleted = function() {
		return this.setOptions({ ignoreDeleted: true });
	};

	schema.query.notDeleted = function() {
		return this.where({ deleted: false });
	};

	schema.query.onlyDeleted = function() {
		return this.where({ deleted: true });
	};
}
