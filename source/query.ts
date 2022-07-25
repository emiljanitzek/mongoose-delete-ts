import DeletedSchema from './types/DeletedSchema';

export default function(
	schema: DeletedSchema
): void {
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
