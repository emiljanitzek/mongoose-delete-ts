import { expect } from 'chai';
import { DeleteResult, UpdateWriteOpResult } from 'mongoose';

export function expectOk(result: UpdateWriteOpResult | DeleteResult): void {
	expect(result.acknowledged).to.equal(true);
}

export function expectModifiedCount(result: UpdateWriteOpResult, count: number): void {
	expect(result.modifiedCount).to.equal(count);
}

export function expectMatchCount(result: UpdateWriteOpResult, count: number): void {
	expect(result.matchedCount).to.equal(count);
}

export function expectDeletedCount(result: DeleteResult, count: number): void {
	expect(result.deletedCount).to.equal(count);
}

export function expectUpsertedCount(result: UpdateWriteOpResult, count: number): void {
	expect(result.upsertedCount).to.equal(count);
}
