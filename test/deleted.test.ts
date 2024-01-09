import { expect } from 'chai';
import { describe } from 'mocha';
import { Model } from 'mongoose';

import { Deleted, DeletedMethods, DeletedQueryHelpers, DeletedStaticMethods } from '../source';
import setupModel from './utils/setupModel';
import dropModel from './utils/dropModel';
import { expectDeletedCount, expectModifiedCount, expectOk } from './utils/mongooseExpects';

type Test = { name: string } & Deleted;
type TestQueryHelpers<T extends Test = Test> = DeletedQueryHelpers<T>;
type TestModel<TRawDocType extends Test = Test> =
	Model<TRawDocType, TestQueryHelpers<TRawDocType>, DeletedMethods> & DeletedStaticMethods<TRawDocType, TestQueryHelpers<TRawDocType>>;

describe('simple delete', function() {
	let TestModel: TestModel;

	before(async function() {
		TestModel = setupModel<Test, TestModel>('TestSimpleDelete', { name: String });
	});

	after(async function() {
		await dropModel('TestSimpleDelete');
	});

	it('deleteOne() -> set deleted=true', async function() {
		const puffy = await TestModel.create({ name: 'Puffy1' });
		const result = await puffy.deleteOne();

		expectOk(result);
		expectDeletedCount(result, 1);

		const doc = await TestModel.findById(puffy.id).withDeleted().orFail();
		expect(doc.deleted).to.equal(true);
	});

	it('deleteOne() -> set deleted=true', async function() {
		const puffy = await TestModel.create({ name: 'Puffy2' });
		const result = await TestModel.deleteOne({ name: 'Puffy2' });

		expectOk(result);
		expectDeletedCount(result, 1);

		const doc = await TestModel.findById(puffy.id).withDeleted().orFail();
		expect(doc.deleted).to.equal(true);
	});

	it('deleteMany() -> set deleted=true', async function() {
		await TestModel.create({ name: 'Puffy' });
		await TestModel.create({ name: 'Puffy' });
		const result = await TestModel.deleteMany({ name: 'Puffy' });
		expectOk(result);
		expectDeletedCount(result, 2);
	});

	it('findByIdAndDelete() -> set deleted=true', async function() {
		const puffy = await TestModel.create({ name: 'Puffy3' });
		await TestModel.findByIdAndDelete(puffy.id);

		const result = await TestModel.findById(puffy.id).withDeleted().orFail();
		expect(result.deleted).to.equal(true);
	});

	it('findOneAndDelete() -> set deleted=true', async function() {
		await TestModel.create({ name: 'Puffy4' });
		await TestModel.findOneAndDelete({ name: 'Puffy4' });

		const result = await TestModel.findOne({ name: 'Puffy4' }).withDeleted().orFail();
		expect(result.deleted).to.equal(true);
	});

	it('restoreOne() -> set deleted=false', async function() {
		const puffy = await TestModel.findOne({ name: 'Puffy1' }).withDeleted().orFail();
		const doc = await puffy.restoreOne();
		expect(doc.deleted).to.equal(false);
	});

	it('restoreOne() -> set deleted=false', async function() {
		const result = await TestModel.restoreOne({ name: 'Puffy2' });

		expectOk(result);
		expectModifiedCount(result, 1);

		const puffy = await TestModel.findOne({ name: 'Puffy2' }).orFail();
		expect(puffy.deleted).to.equal(false);
	});

	it('restoreMany() -> set deleted=false', async function() {
		const result = await TestModel.restoreMany({ name: 'Puffy' });

		expectOk(result);
		expectModifiedCount(result, 2);

		const [puffy1, puffy2] = await TestModel.find({ name: 'Puffy' });
		expect(puffy1.deleted).to.equal(false);
		expect(puffy2.deleted).to.equal(false);
	});
});

type Timestamps = { createdAt: Date, updatedAt: Date };
type TestTimestamps =  Deleted & Timestamps & { name: string };
type TestTimestampsQueryHelpers = DeletedQueryHelpers<TestTimestamps>;
type TestTimestampsModel = Model<TestTimestamps, TestTimestampsQueryHelpers, DeletedMethods> & DeletedStaticMethods<TestTimestamps, TestTimestampsQueryHelpers>;

describe('delete with timestamps', function() {
	let TestModel: TestTimestampsModel;

	before(async function() {
		TestModel = setupModel<TestTimestamps, TestTimestampsModel>('TestDeleteWithTimestamps', { name: String }, {}, { timestamps: true });
	});

	after(async function() {
		await dropModel('TestDeleteWithTimestamps');
	});

	it('deleteOne() -> will not change updatedAt', async function() {
		const puffy = await TestModel.create({ name: 'Puffy1' });
		const updatedAt = new Date(puffy.updatedAt);

		const result = await puffy.deleteOne();
		expectOk(result);
		expectDeletedCount(result, 1);

		const doc = await TestModel.findById(puffy.id).withDeleted().orFail();
		expect(doc.updatedAt).to.deep.equal(updatedAt);
	});

	it('deleteOne() -> will not change updatedAt', async function() {
		const puffy = await TestModel.create({ name: 'Puffy2' });
		const updatedAt = new Date(puffy.updatedAt);

		const result = await TestModel.deleteOne({ name: 'Puffy2' });
		expectOk(result);
		expectDeletedCount(result, 1);

		const doc = await TestModel.findById(puffy.id).withDeleted().orFail();
		expect(doc.deleted).to.equal(true);
		expect(doc.updatedAt).to.deep.equal(updatedAt);
	});

	it('restoreOne() -> will not change updatedAt', async function() {
		const puffy = await TestModel.findOne({ name: 'Puffy1' }).withDeleted().orFail();
		const updatedAt = new Date(puffy.updatedAt);

		const doc = await puffy.restoreOne();
		expect(doc.deleted).to.equal(false);
		expect(doc.updatedAt).to.deep.equal(updatedAt);
	});

	it('restoreOne() -> will not change updatedAt', async function() {
		const before = await TestModel.findOne({ name: 'Puffy2' }).withDeleted().orFail();
		const updatedAt = new Date(before.updatedAt);

		await TestModel.restoreOne({ name: 'Puffy2' });

		const puffy = await TestModel.findOne({ name: 'Puffy2' }).orFail();
		expect(puffy.deleted).to.equal(false);
		expect(puffy.updatedAt).to.deep.equal(updatedAt);
	});
});

describe('delete with validateBeforeDelete', function() {
	let TestModelTrue: TestModel;
	let TestModelFalse: TestModel;

	before(async function() {
		TestModelTrue = setupModel<Test, TestModel>('TestValidateBeforeDeleteTrue', { name: { type: String, required: true } }, { validateBeforeDelete: true });
		TestModelFalse = setupModel<Test, TestModel>('TestValidateBeforeDeleteFalse', { name: { type: String, required: true } }, { validateBeforeDelete: false });
	});
	after(async function() {
		await dropModel('TestValidateBeforeDeleteTrue');
		await dropModel('TestValidateBeforeDeleteFalse');
	});

	it('deleteOne() -> will raise ValidationError error', async function() {
		const puffy = await TestModelTrue.create({ name: 'Puffy1' });
		puffy.name = '';
		try {
			const result = await puffy.deleteOne();
			expectDeletedCount(result, 0);
		} catch (error: unknown) {
			expectError(error);
			expect(error.name).to.equal('ValidationError');
		}
	});

	it('deleteOne() -> will not raise ValidationError error', async function() {
		const puffy = await TestModelFalse.create({ name: 'Puffy1' });
		puffy.name = '';
		const result = await puffy.deleteOne();
		expectOk(result);
		expectDeletedCount(result, 1);
	});
});

describe('deleted schema options', function() {
	type TestDeletedAlias = Test & { readonly destroyed: boolean };
	let TestModel: TestModel<TestDeletedAlias>;

	before(async function() {
		TestModel = setupModel<TestDeletedAlias, TestModel<TestDeletedAlias>>('TestSchemaOptions', { name: String }, { deleted: { alias: 'destroyed' } });
	});
	after(async function() {
		await dropModel('TestSchemaOptions');
	});

	it('use custom schema alias', async function() {
		const puffy = await TestModel.create({ name: 'Puffy1' });
		const result = await puffy.deleteOne();

		expectOk(result);
		expectDeletedCount(result, 1);

		const doc = await TestModel.findById(puffy.id).withDeleted().orFail();
		expect(doc.destroyed).to.equal(true);
	});
});

function expectError(error: unknown): asserts error is Error {
	if (!(error instanceof Error)) {
		throw new TypeError('error is not of type Error');
	}
}
