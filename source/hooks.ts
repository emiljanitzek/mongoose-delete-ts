import { Aggregate, PipelineStage, Query } from 'mongoose';

import DeletedDocument from './types/DeletedDocument';
import DeletedSchema from './types/DeletedSchema';
import { Methods } from './types/DeleteOptions';

export default function(schema: DeletedSchema, methods?: Methods[] | boolean): void {
	schema.pre('save', function() {
		if (typeof this.deleted === 'undefined') {
			this.deleted = false;
		}
	});

	const allMethods = getMethodsFromOptions(methods);
	if (allMethods.length > 0) {
		schema.pre(allMethods as any, async function <T extends DeletedDocument>(
			this: Query<unknown, T>
		) {
			if (deletedIsNotAlreadyInQuery(this) && notIgnoreDeletedInOptions(this)) {
				this.where({ deleted: false });
			}
		});
	}

	if (hasAggregateInOption(methods)) {
		schema.pre('aggregate', async function(
			this: Aggregate<unknown>
		) {
			if (onlyDeletedInOptions(this)) {
				this.pipeline().unshift({ $match: { deleted: true } });
			} else if (deletedIsNotAlreadyInAggregation(this) && notWithDeletedInOptions(this)) {
				this.pipeline().unshift({ $match: { deleted: false } });
			}
		});
	}
}

function getMethodsFromOptions(methods?: Methods[] | boolean): string[] {
	if (methods === false) {
		return [];
	} else if (Array.isArray(methods)) {
		return methods;
	}
	return ['find', 'findOne', 'findOneAndUpdate', 'count', 'update', 'updateOne', 'updateMany', 'countDocuments'];
}

function hasAggregateInOption(methods?: Methods[] | boolean): boolean {
	if (methods === false) {
		return false;
	} else if (Array.isArray(methods)) {
		return methods.includes('aggregate');
	}
	return true;
}

function deletedIsNotAlreadyInQuery<T>(query: Query<unknown, T>): boolean {
	return typeof query.getQuery().deleted === 'undefined';
}

function notIgnoreDeletedInOptions<T>(query: Query<unknown, T>): boolean {
	return query.getOptions().ignoreDeleted !== true;
}

function deletedIsNotAlreadyInAggregation(aggregation: Aggregate<unknown>): boolean {
	const matches = aggregation.pipeline().filter(isPipelineMatch);
	return !matches.some((match: PipelineStage.Match) => Object.keys(match['$match']).includes('deleted'));
}

function isPipelineMatch(pipeline: PipelineStage): pipeline is PipelineStage.Match {
	return Object.keys(pipeline).includes('$match');
}

function notWithDeletedInOptions(aggregation: Aggregate<unknown>): boolean {
	return (aggregation as any).options?.withDeleted !== true;
}

function onlyDeletedInOptions(aggregation: Aggregate<unknown>): boolean {
	return (aggregation as any).options?.onlyDeleted === true;
}
