import { Aggregate, PipelineStage, Query } from 'mongoose';
import DeletedSchema from './types/DeletedSchema';
import { Methods } from './types/DeleteSchemaOptions';
import Deleted from './types/Deleted';

export default function(schema: DeletedSchema, methods?: Methods[] | boolean): void {
	schema.pre('save', function() {
		if (typeof this.deleted === 'undefined') {
			this.deleted = false;
		}
	});

	const allMethods = getMethodsFromOptions(methods);
	if (allMethods.length > 0) {
		schema.pre(allMethods as any, async function <T extends Deleted>(
			this: Query<unknown, T>
		) {
			if (deletedIsNotAlreadyInQuery(this)) {
				this.where({ deleted: { $ne: true } });
			}
		});
	}

	if (hasAggregateInOption(methods)) {
		schema.pre('aggregate', async function(
			this: Aggregate<unknown>
		) {
			if (deletedIsNotAlreadyInAggregation(this)) {
				this.pipeline().unshift({ $match: { deleted: { $ne: true } } });
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
	return ['find', 'findOne', 'findOneAndUpdate', 'update', 'updateOne', 'updateMany', 'countDocuments'];
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
