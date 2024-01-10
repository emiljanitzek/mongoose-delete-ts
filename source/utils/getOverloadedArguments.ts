import { UpdateOptions } from 'mongodb';
import { FilterQuery, MongooseSpecificQueryOptions } from 'mongoose';

export interface MongooseUpdateOptions extends UpdateOptions, Omit<MongooseSpecificQueryOptions, 'lean'> {}

export default function getOverloadedArguments<T>(
	filter?: FilterQuery<T>,
	options?: MongooseUpdateOptions | null,
): [FilterQuery<T>, MongooseUpdateOptions] {
	const updateOptions = Object.assign({}, options || {}, { timestamps: false });
	return [filter || {}, updateOptions];
}
