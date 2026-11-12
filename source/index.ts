import { default as deletedPlugin } from './plugin';

export { default as softDelete } from './softDelete';

export type { default as Deleted } from './types/Deleted';
export type { default as DeletedAt } from './types/DeletedAt';
export type { default as DeletedBy } from './types/DeletedBy';
export type { default as DeletedSchema } from './types/DeletedSchema';
export type { DeleteSchemaOptions as DeleteOptions, Methods as OverrideMethods } from './types/DeleteSchemaOptions';

export type { DeletedMethods, DeletedByMethods, DeleteDocumentOptions } from './methods';
export type { DeletedStaticMethods, DeletedByStaticMethods, DeleteQueryOptions, RestoreQueryOptions } from './statics';
export type { default as DeletedQuery, DeletedQueryHelpers } from './types/DeletedQuery';
export type {
	InferDeletedBy,
	SoftDeleteFields,
	SoftDeleteMethods,
	SoftDeleteRawDocType,
	SoftDeleteSchema,
	SoftDeleteStatics
} from './types/SoftDeleteSchema';

export { deletedPlugin as mongooseDelete };
export default deletedPlugin;
