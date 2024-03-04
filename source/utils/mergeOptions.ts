import { DeleteSchemaOptions } from '../types/DeleteSchemaOptions';

export default function mergeOptions<T extends Record<string, any>>(
	queryOptions: T | undefined | null,
	options: DeleteSchemaOptions
): T {
	const mergedOptions = { ...queryOptions };
	if (typeof options.validateBeforeDelete !== 'undefined') {
		Object.assign(mergedOptions, { validateBeforeSave: Boolean(options.validateBeforeDelete) });
	}
	Object.assign(mergedOptions, { timestamps: false });
	return mergedOptions as T;
}
