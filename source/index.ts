import { default as deletedPlugin } from './plugin';

export { default as DeletedDocument, DeletedAtDocument, DeletedByDocument } from './types/DeletedDocument';
export { default as DeletedModel, DeletedByModel } from './types/DeletedModel';
export { default as Deleted } from './types/Deleted';
export { default as DeletedAt } from './types/DeletedAt';
export { default as DeletedBy } from './types/DeletedBy';
export { default as DeletedSchema } from './types/DeletedSchema';
export { DeleteOptions } from './types/DeleteOptions';

export { DeletedMethods, DeletedByMethods } from './methods';
export { DeletedStaticMethods, DeletedByStaticMethods } from './statics';
export { default as DeletedQueryWithHelpers, DeletedQueryHelpers }  from './types/DeletedQuery';

export default deletedPlugin;
