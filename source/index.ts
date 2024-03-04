import { default as deletedPlugin } from './plugin';

export { default as Deleted } from './types/Deleted';
export { default as DeletedAt } from './types/DeletedAt';
export { default as DeletedBy } from './types/DeletedBy';
export { default as DeletedSchema } from './types/DeletedSchema';
export { DeleteSchemaOptions as DeleteOptions } from './types/DeleteSchemaOptions';

export { DeletedMethods, DeletedByMethods } from './methods';
export { DeletedStaticMethods, DeletedByStaticMethods } from './statics';
export { default as DeletedQuery, DeletedQueryHelpers }  from './types/DeletedQuery';

export default deletedPlugin;
