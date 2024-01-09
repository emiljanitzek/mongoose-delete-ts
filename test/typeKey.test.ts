import { Model } from 'mongoose';
import { Deleted, DeletedMethods, DeletedQueryHelpers, DeletedStaticMethods } from '../source';
import { describe } from 'mocha';
import setupModel from './utils/setupModel';
import dropModel from './utils/dropModel';
import { expect } from 'chai';

type Test = { name: string } & Deleted;
type TestQueryHelpers<T extends Test = Test> = DeletedQueryHelpers<T>;
type TestModel<TRawDocType extends Test = Test> =
	Model<TRawDocType, TestQueryHelpers<TRawDocType>, DeletedMethods> & DeletedStaticMethods<TRawDocType, TestQueryHelpers<TRawDocType>>;

describe('with type key', function() {
	let TestModel: TestModel;

	before(async function() {
		TestModel = setupModel<Test, TestModel>(
			'TestWithTypeKeyModel', { name: { $type: String } }, {}, { typeKey: '$type' }
		);
	});

	after(async function() {
		await dropModel('TestWithTypeKeyModel');
	});

	it('create() -> set deleted=false', async function() {
		const puffy = await TestModel.create({ name: 'Puffy1' });
		expect(puffy.deleted).to.equal(false);
	});

	it('deleteOne() -> set deleted=true', async function() {
		const puffy = await TestModel.findOne({ name: 'Puffy1' }).orFail();
		const result = await puffy.deleteOne();
		expect(result.deletedCount).to.equal(1);
	});

	it('restoreOne() -> set deleted=false', async function() {
		const puffy = await TestModel.findOne({ name: 'Puffy1' }).withDeleted().orFail();
		const doc = await puffy.restoreOne();
		expect(doc.deleted).to.equal(false);
	});
});
