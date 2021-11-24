import DeletedDocument, { DeletedAtDocument } from '../source/DeletedDocument';
import { Document, Model } from 'mongoose';
import DeletedQuery from '../source/DeletedQuery';
import DeletedModel from '../source/DeletedModel';
import { describe } from 'mocha';
import setupModel from './utils/setupModel';
import dropModel from './utils/dropModel';
import { expect } from 'chai';
import { expectDeletedCount, expectMatchCount, expectOk } from './utils/mongooseExpects';

type TestDeletedAtDocument = Document & DeletedDocument & DeletedAtDocument & { name: string };
type TestDeletedAtModel = Model<TestDeletedAtDocument, DeletedQuery<TestDeletedAtDocument>> & DeletedModel<TestDeletedAtDocument>;

describe('deletedAt=true', function() {
	let TestModel: TestDeletedAtModel;

	before(async function() {
		TestModel = setupModel<TestDeletedAtDocument, TestDeletedAtModel>(
			'TestDeletedAt',
			{ name: String },
			{ deletedAt: true });
	});

	after(async function() {
		await dropModel('TestDeletedAt');
	});

	it('delete() -> set deletedAt', async function() {
		const puffy = await TestModel.create({ name: 'Puffy1' });

		const success = await puffy.delete();

		expect(success.deletedAt).to.be.an('date');
	});

	it('deleteOne() -> set deletedAt', async function() {
		await TestModel.create({ name: 'Puffy2' });

		const result = await TestModel.deleteOne({ name: 'Puffy2' });

		expectOk(result);
		expectDeletedCount(result, 1);

		const puffy = await TestModel.findOne({ name: 'Puffy2' }).withDeleted().orFail();

		expect(puffy.deletedAt).to.be.an('date');
	});

	it('restore() -> unset deletedAt', async function() {
		const puffy = await TestModel.findOne({ name: 'Puffy1' }).withDeleted().orFail();

		const success = await puffy.restore();

		expect(success.deletedAt).to.not.exist;
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
		TestModel = setupModel<TestDeletedAtDocument, TestDeletedAtModel>(
			'TestDeletedAtCustomField',
			{ name: String },
			{ deletedAt: 'deleted_at' });
	});

	after(async function() {
		await dropModel('TestDeletedAtCustomField');
	});

	it('delete() -> set deletedAt', async function() {
		const puffy = await TestModel.create({ name: 'Puffy1' });

		const success = await puffy.delete();

		expect(success.deletedAt).to.be.an('date');
		expect(success.get('deleted_at')).to.be.an('date');
	});

	it('restore() -> unset deletedAt', async function() {
		const puffy = await TestModel.findOne({ name: 'Puffy1' }).withDeleted().orFail();

		const success = await puffy.restore();

		expect(success.deletedAt).to.not.exist;
		expect(success.get('deleted_at')).to.not.exist;
	});
});
