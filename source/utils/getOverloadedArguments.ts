import { UpdateOptions } from 'mongodb';
import { FilterQuery, MongooseQueryOptions } from 'mongoose';

export interface MongooseUpdateOptions extends UpdateOptions, Omit<MongooseQueryOptions, 'lean'> {}

export default function getOverloadedArguments<T>(
	filter?: FilterQuery<T>,
	options?: MongooseUpdateOptions | null,
): [FilterQuery<T>, MongooseUpdateOptions] {
	const updateOptions = Object.assign({}, options || {}, { timestamps: false });
	return [filter || {}, updateOptions];
}
