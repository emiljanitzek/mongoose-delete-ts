import { Deleted, DeletedAt, DeletedMethods, DeletedQueryHelpers, DeletedStaticMethods } from '../source';
import { Model } from 'mongoose';
import { describe } from 'mocha';
import setupModel from './utils/setupModel';
import dropModel from './utils/dropModel';
import { expect } from 'chai';
import { expectDeletedCount, expectMatchCount, expectOk } from './utils/mongooseExpects';

type TestDeletedAt = { name: string } & Deleted & DeletedAt;
type TestQueryHelpers<T extends TestDeletedAt = TestDeletedAt> = DeletedQueryHelpers<T>;
type TestDeletedAtModel<TRawDocType extends TestDeletedAt = TestDeletedAt> =
	Model<TRawDocType, TestQueryHelpers<TRawDocType>, DeletedMethods> & DeletedStaticMethods<TRawDocType, TestQueryHelpers<TRawDocType>>;

describe('deletedAt=true', function() {
	let TestModel: TestDeletedAtModel;

	before(async function() {
		TestModel = setupModel<TestDeletedAt, TestDeletedAtModel>(
			'TestDeletedAt',
			{ name: String },
			{ deletedAt: true });
	});

	after(async function() {
		await dropModel('TestDeletedAt');
	});

	it('deleteOne() -> set deletedAt', async function() {
		const puffy = await TestModel.create({ name: 'Puffy1' });

		const result = await puffy.deleteOne();
		expectOk(result);
		expectDeletedCount(result, 1);

		const doc = await TestModel.findById(puffy.id).withDeleted().orFail();
		expect(doc.deletedAt).to.be.an('date');
	});

	it('deleteOne() -> set deletedAt', async function() {
		await TestModel.create({ name: 'Puffy2' });

		const result = await TestModel.deleteOne({ name: 'Puffy2' });

		expectOk(result);
		expectDeletedCount(result, 1);

		const puffy = await TestModel.findOne({ name: 'Puffy2' }).withDeleted().orFail();
		expect(puffy.deletedAt).to.be.an('date');
	});

	it('restoreOne() -> unset deletedAt', async function() {
		const puffy = await TestModel.findOne({ name: 'Puffy1' }).withDeleted().orFail();
		const doc = await puffy.restoreOne();
		expect(doc.deletedAt).to.not.exist;
	});

	it('restoreOne() -> unset deletedAt', async function() {
		const result = await TestModel.restoreOne({ name: 'Puffy2' });

		expectOk(result);
		expectMatchCount(result, 1);

		const puffy = await TestModel.findOne({ name: 'Puffy2' }).withDeleted().orFail();
		expect(puffy.deletedAt).to.not.exist;
	});
});

describe('deletedAt=deleted_at', function() {
	let TestModel: TestDeletedAtModel;

	before(async function() {
		TestModel = setupModel<TestDeletedAt, TestDeletedAtModel>(
			'TestDeletedAtCustomField',
			{ name: String },
			{ deletedAt: 'deleted_at' });
	});

	after(async function() {
		await dropModel('TestDeletedAtCustomField');
	});

	it('deleteOne() -> set deletedAt', async function() {
		const puffy = await TestModel.create({ name: 'Puffy1' });

		const result = await puffy.deleteOne();
		expectOk(result);
		expectDeletedCount(result, 1);

		const doc = await TestModel.findById(puffy.id).withDeleted().orFail();
		expect(doc.deletedAt).to.be.an('date');
		expect(doc.get('deleted_at')).to.be.an('date');
	});

	it('restoreOne() -> unset deletedAt', async function() {
		const puffy = await TestModel.findOne({ name: 'Puffy1' }).withDeleted().orFail();

		const doc = await puffy.restoreOne();

		expect(doc.deletedAt).to.not.exist;
		expect(doc.get('deleted_at')).to.not.exist;
	});
});
