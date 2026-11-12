import { Aggregate, PipelineStage, Query } from 'mongoose';
import DeletedSchema from './types/DeletedSchema';
import { Methods, QueryMethods } from './types/DeleteSchemaOptions';

const defaultQueryMethods: QueryMethods[] = [
	'countDocuments',
	'find',
	'findOne',
	'findOneAndUpdate',
	'updateOne',
	'updateMany'
];

export default function(schema: DeletedSchema, methods?: Methods[] | boolean): void {
	schema.pre('save', function() {
		if (typeof this.deleted === 'undefined') {
			this.deleted = false;
		}
	});

	const queryMethods = getQueryMethodsFromOptions(methods);
	if (queryMethods.length > 0) {
		schema.pre(queryMethods, function(this: Query<unknown, unknown>) {
			if (deletedIsNotAlreadyInQuery(this)) {
				this.where({ deleted: false });
			}
		});
	}

	if (hasAggregateInOption(methods)) {
		schema.pre('aggregate', function(this: Aggregate<unknown>) {
			if (deletedIsNotAlreadyInAggregation(this)) {
				this.pipeline().unshift({ $match: { deleted: false } });
			}
		});
	}
}

function getQueryMethodsFromOptions(methods?: Methods[] | boolean): QueryMethods[] {
	if (methods === false) {
		return [];
	} else if (Array.isArray(methods)) {
		return methods.filter(isQueryMethod);
	}
	return defaultQueryMethods;
}

function isQueryMethod(method: Methods): method is QueryMethods {
	return method !== 'aggregate';
}

function hasAggregateInOption(methods?: Methods[] | boolean): boolean {
	if (methods === false) {
		return false;
	} else if (Array.isArray(methods)) {
		return methods.includes('aggregate');
	}
	return true;
}

function deletedIsNotAlreadyInQuery(query: Query<unknown, unknown>): boolean {
	return typeof query.getQuery().deleted === 'undefined';
}

function deletedIsNotAlreadyInAggregation(aggregation: Aggregate<unknown>): boolean {
	const matches = aggregation.pipeline().filter(isPipelineMatch);
	return !matches.some((matchStage: PipelineStage.Match) => {
		const match = matchStage['$match'];
		const matchHasDeleted = Object.keys(match).includes('deleted');
		if (matchHasDeleted) {
			return true;
		}

		const nested = Object.entries(match).filter(([key]) => key === '$or' || key === '$and');
		return nested.some(([,array]) => array.some((value: Record<string, unknown>) => Object.keys(value).includes('deleted')));
	});
}

function isPipelineMatch(pipeline: PipelineStage): pipeline is PipelineStage.Match {
	return Object.keys(pipeline).includes('$match');
}
