import DeletedSchema from './types/DeletedSchema';

export default function(
	schema: DeletedSchema
): void {
	schema.query.allDocuments = function() {
		return this.where({ deleted: { $in: [true, false] } });
	};

	schema.query.deletedDocuments = function() {
		return this.where({ deleted: true });
	};
}
