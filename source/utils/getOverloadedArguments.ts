import { Callback, FilterQuery, QueryOptions } from 'mongoose';

export default function getOverloadedArguments<T>(
	filter?: FilterQuery<T>,
	options?: QueryOptions | null,
	callback?: Callback
): [FilterQuery<T>, QueryOptions, Callback | undefined] {
	if (typeof filter === 'function') {
		callback = filter;
		filter = {};
		options = {};
	} else if (typeof options === 'function') {
		callback = options;
		options = {};
	}

	const queryOptions = Object.assign({}, options, { timestamps: false });

	return [filter || {}, queryOptions, callback];
}
