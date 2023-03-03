import { FilterQuery, QueryOptions } from 'mongoose';

export default function getOverloadedArguments<T>(
	filter?: FilterQuery<T>,
	options?: QueryOptions | null,
): [FilterQuery<T>, QueryOptions] {
	const queryOptions = Object.assign({}, options || {}, { timestamps: false });
	return [filter || {}, queryOptions];
}
