import { Document, Model } from 'mongoose';
import DeletedDocument from '../source/DeletedDocument';
import DeletedQuery from '../source/DeletedQuery';
import DeletedModel from '../source/DeletedModel';
import { describe } from 'mocha';
import setupModel from './utils/setupModel';
import dropModel from './utils/dropModel';
import { expect } from 'chai';

type TestDocument = Document & DeletedDocument & { name: string };
type TestModel = Model<TestDocument, DeletedQuery<TestDocument>> & DeletedModel<TestDocument>;

describe('aggregation', function() {
	let TestModel: TestModel;

	before(async function() {
		TestModel = setupModel<TestDocument, TestModel>('TestAggregateDelete', { name: String });
	});

	beforeEach(async function() {
		await TestModel.create(
			[
				{ name: 'Obi-Wan Kenobi', deleted: true },
				{ name: 'Darth Vader' },
				{ name: 'Luke Skywalker', deleted: true }
			]);
	});

	afterEach(async function() {
		await dropModel('TestAggregateDelete');
	});

	it('aggregate() -> returns 1 document', async function() {
		const documents = await TestModel.aggregate([
			{ $project : { name: 1 } }
		]);

		expect(documents).to.have.lengthOf(1);
	});

	it('aggregate() -> with pipeline returns 1 document', async function() {
		const documents = await TestModel.aggregate().match({ name: 'Darth Vader' }).project({ name: 1 });
		expect(documents).to.have.lengthOf(1);
	});

	it('aggregate() -> with deleted pipeline returns 0 document', async function() {
		const documents = await TestModel.aggregate().match({ name: 'Luke Skywalker' }).project({ name: 1 });
		expect(documents).to.have.lengthOf(0);
	});

	it('aggregate() -> with delete returns 2 document', async function() {
		const documents = await TestModel.aggregate([
			{ $match: { deleted: true } },
			{ $project : { name: 1 } }
		]);

		expect(documents).to.have.lengthOf(2);
	});

	it('aggregate() -> with delete returns 1 document', async function() {
		const documents = await TestModel.aggregate([
			{ $match: { name: 'Obi-Wan Kenobi' } },
			{ $match: { deleted: { $in: [true, false] } } },
			{ $project : { name: 1 } }
		]);

		expect(documents).to.have.lengthOf(1);
	});

	it('aggregate() -> with onlyDeleted returns 2 document', async function() {
		const documents = await TestModel.aggregate([
			{ $project : { name: 1 } }
		], { onlyDeleted: true } as any);

		expect(documents).to.have.lengthOf(2);
	});

	it('aggregate() -> with withDeleted returns 3 document', async function() {
		const documents = await TestModel.aggregate([
			{ $project : { name: 1 } }
		], { withDeleted: true } as any);

		expect(documents).to.have.lengthOf(3);
	});
});
