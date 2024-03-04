import { expect } from 'chai';
import { Deleted, DeletedAt, DeletedMethods, DeletedQueryHelpers, DeletedStaticMethods } from '../source';
import { Model } from 'mongoose';
import { describe } from 'mocha';
import setupModel from './utils/setupModel';
import dropModel from './utils/dropModel';
import { expectDeletedCount, expectModifiedCount, expectOk } from './utils/mongooseExpects';

type Test = { name: string } & Deleted & DeletedAt;
type TestQueryHelpers = DeletedQueryHelpers<Test>;
type TestModel = Model<Test, TestQueryHelpers, DeletedMethods> & DeletedStaticMethods<Test, TestQueryHelpers>;

describe('simple delete', function() {
	let TestModel: TestModel;

	before(async function() {
		TestModel = setupModel<Test, TestModel>('TestSimpleDelete', { name: String });
	});

	after(async function() {
		await dropModel('TestSimpleDelete');
	});

	it('delete() -> set deleted=true', async function() {
		const puffy = await TestModel.create({ name: 'Puffy1' });

		const success = await puffy.delete();
		expect(success.deleted).to.equal(true);
		expect(success.deletedAt).to.not.exist;
	});

	it('deleteOne() -> set deleted=true', async function() {
		await TestModel.create({ name: 'Puffy2' });
		const result = await TestModel.deleteOne({ name: 'Puffy2' });
		expectOk(result);
		expectDeletedCount(result, 1);
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

		const result = await TestModel.findById(puffy.id).allDocuments().orFail();

		expect(result.deleted).to.equal(true);
	});

	it('findOneAndDelete() -> set deleted=true', async function() {
		await TestModel.create({ name: 'Puffy4' });
		await TestModel.findOneAndDelete({ name: 'Puffy4' });

		const result = await TestModel.findOne({ name: 'Puffy4' }).allDocuments().orFail();
		expect(result.deleted).to.equal(true);
	});

	it('restore() -> set deleted=false', async function() {
		const puffy = await TestModel.findOne({ name: 'Puffy1' }).allDocuments().orFail();
		const success = await puffy.restore();
		expect(success.deleted).to.equal(false);
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

	it('delete() -> will not change updatedAt', async function() {
		const puffy = await TestModel.create({ name: 'Puffy1' });
		const updatedAt = new Date(puffy.updatedAt);

		const success = await puffy.delete();
		expect(success.deleted).to.equal(true);
		expect(success.updatedAt).to.deep.equal(updatedAt);
	});

	it('deleteOne() -> will not change updatedAt', async function() {
		const puffy = await TestModel.create({ name: 'Puffy2' });
		const updatedAt = new Date(puffy.updatedAt);

		await TestModel.deleteOne({ name: 'Puffy2' });

		const result = await TestModel.findOne({ name: 'Puffy2' }).allDocuments().orFail();
		expect(result.deleted).to.equal(true);
		expect(result.updatedAt).to.deep.equal(updatedAt);
	});

	it('restore() -> will not change updatedAt', async function() {
		const puffy = await TestModel.findOne({ name: 'Puffy1' }).allDocuments().orFail();
		const updatedAt = new Date(puffy.updatedAt);

		const success = await puffy.restore();
		expect(success.deleted).to.equal(false);
		expect(success.updatedAt).to.deep.equal(updatedAt);
	});

	it('restoreOne() -> will not change updatedAt', async function() {
		const before = await TestModel.findOne({ name: 'Puffy2' }).allDocuments().orFail();
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

	it('delete() -> will raise ValidationError error', async function() {
		const puffy = await TestModelTrue.create({ name: 'Puffy1' });
		puffy.name = '';
		try {
			const doc = await puffy.delete();
			expect(doc).to.not.exist;
		} catch (error: unknown) {
			expectError(error);
			expect(error.name).to.equal('ValidationError');
		}
	});

	it('delete() -> will not raise ValidationError error', async function() {
		const puffy = await TestModelFalse.create({ name: 'Puffy1' });
		puffy.name = '';
		const doc = await puffy.delete();
		expect(doc.deleted).to.equal(true);
	});
});

type Destroyed = { name: string } & Deleted & { destroyed: boolean };
type DestroyedTestModel = Model<Destroyed, TestQueryHelpers, DeletedMethods> & DeletedStaticMethods<Destroyed, TestQueryHelpers>;

describe('deleted schema options', function() {
	let DestroyedTestModel: DestroyedTestModel;

	before(async function() {
		DestroyedTestModel = setupModel<Destroyed, DestroyedTestModel>('TestSchemaOptions', { name: String }, { deleted: { alias: 'destroyed' } });
	});
	after(async function() {
		await dropModel('TestSchemaOptions');
	});

	it('use custom schema alias', async function() {
		const puffy = await DestroyedTestModel.create({ name: 'Puffy1' });
		const result = await puffy.delete();

		expect(result.destroyed).to.equal(true);
	});
});

function expectError(error: unknown): asserts error is Error {
	if (!(error instanceof Error)) {
		throw new TypeError('error is not of type Error');
	}
}
