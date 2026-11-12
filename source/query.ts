import { Query } from 'mongoose';
import DeletedSchema from './types/DeletedSchema';

export default function(
	schema: DeletedSchema
): void {
	schema.query.allDocuments = function<TQuery extends Query<any, any, any, any, any, any, any>>(this: TQuery): TQuery {
		return this.where({ deleted: { $in: [true, false] } });
	};

	schema.query.deletedDocuments = function<TQuery extends Query<any, any, any, any, any, any, any>>(this: TQuery): TQuery {
		return this.where({ deleted: true });
	};
}
