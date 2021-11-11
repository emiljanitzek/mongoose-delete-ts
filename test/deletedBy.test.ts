import DeletedDocument, { DeletedAtDocument, DeletedByDocument } from '../source/DeletedDocument';
import { Document, Model, Types } from 'mongoose';
import { DeletedQuery } from '../source/query';
import DeletedModel, { DeletedByModel } from '../source/DeletedModel';
import { describe } from 'mocha';
import setupModel from './utils/setupModel';
import dropModel from './utils/dropModel';
import { expect } from 'chai';
import { expectDeletedCount, expectMatchCount, expectOk } from './utils/mongooseExpects';

type TestDeletedByDocument = Document & DeletedDocument & DeletedAtDocument & DeletedByDocument & { name: string };
type TestDeletedByModel = Model<TestDeletedByDocument, DeletedQuery<TestDeletedByDocument>> & DeletedModel<TestDeletedByDocument> & DeletedByModel<TestDeletedByDocument>;

describe('deletedAt=true', function() {
	let TestModel: TestDeletedByModel;

	before(async function() {
		TestModel = setupModel<TestDeletedByDocument, TestDeletedByModel>(
			'TestDeletedBy',
			{ name: String },
			{ deletedBy: true });
	});

	after(async function() {
		await dropModel('TestDeletedBy');
	});

	it('deleteByUser() -> set deletedBy', async function() {
		const puffy = await TestModel.create({ name: 'Puffy1' });

		const userId = new Types.ObjectId();
		const success = await puffy.deleteByUser(userId);

		expect(success.deletedBy).to.deep.equal(userId);
	});

	it('deleteOneByUser() -> set deletedBy', async function() {
		await TestModel.create({ name: 'Puffy2' });

		const userId = new Types.ObjectId();
		const result = await TestModel.deleteOneByUser(userId, { name: 'Puffy2' });

		expectOk(result);
		expectDeletedCount(result, 1);

		const puffy = await TestModel.findOne({ name: 'Puffy2' }).withDeleted().orFail();

		expect(puffy.deletedBy).to.deep.equal(userId);
	});

	it('restore() -> unset deletedBy', async function() {
		const puffy = await TestModel.findOne({ name: 'Puffy1' }).withDeleted().orFail();

		const success = await puffy.restore();

		expect(success.deletedBy).to.not.exist;
	});

	it('restoreOne() -> unset deletedBy', async function() {
		const result = await TestModel.restoreOne({ name: 'Puffy2' });

		expectOk(result);
		expectMatchCount(result, 1);

		const puffy = await TestModel.findOne({ name: 'Puffy2' }).withDeleted().orFail();

		expect(puffy.deletedBy).to.not.exist;
	});
});

describe('deletedBy=deleted_by', function() {
	let TestModel: TestDeletedByModel;

	before(async function() {
		TestModel = setupModel<TestDeletedByDocument, TestDeletedByModel>(
			'TestDeletedByCustomField',
			{ name: String },
			{ deletedBy: 'deleted_by' });
	});

	after(async function() {
		await dropModel('TestDeletedByCustomField');
	});

	it('deleteByUser() -> set deletedBy', async function() {
		const puffy = await TestModel.create({ name: 'Puffy1' });

		const userId = new Types.ObjectId();
		const success = await puffy.deleteByUser(userId);

		expect(success.deletedBy).to.deep.equal(userId);
		expect(success.get('deleted_by')).to.deep.equal(userId);
	});

	it('restore() -> unset deletedAt', async function() {
		const puffy = await TestModel.findOne({ name: 'Puffy1' }).withDeleted().orFail();

		const success = await puffy.restore();

		expect(success.deletedBy).to.not.exist;
		expect(success.get('deleted_by')).to.not.exist;
	});
});

type User = { id: string }
type TestDeletedByStringDocument = Document & DeletedDocument & DeletedAtDocument & DeletedByDocument<string, User> & { name: string };
type TestDeletedByStringModel = Model<TestDeletedByStringDocument, DeletedQuery<TestDeletedByStringDocument>> & DeletedModel<TestDeletedByStringDocument> & DeletedByModel<TestDeletedByStringDocument, string>;

describe('deletedBy custom schema', function() {
	let TestModel: TestDeletedByStringModel;

	before(async function() {
		TestModel = setupModel<TestDeletedByStringDocument, TestDeletedByStringModel>(
			'TestDeletedByCustomSchema',
			{ name: String },
			{ deletedBy: { name: 'deleted_by', type: String, get: (id: string) => { return id && { id }; } } });
	});

	after(async function() {
		await dropModel('TestDeletedByCustomSchema');
	});

	it('deleteByUser() -> set deletedBy', async function() {
		const puffy = await TestModel.create({ name: 'Puffy1' });

		const userId = new Types.ObjectId().toString();
		const success = await puffy.deleteByUser(userId);

		expect(success.deletedBy).to.deep.equal({ id: userId });
	});

	it('restore() -> unset deletedAt', async function() {
		const puffy = await TestModel.findOne({ name: 'Puffy1' }).withDeleted().orFail();

		const success = await puffy.restore();

		expect(success.deletedBy).to.not.exist;
	});
});
