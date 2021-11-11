import { Document, Model } from 'mongoose';
import DeletedDocument from '../source/DeletedDocument';
import { DeletedQuery } from '../source/query';
import DeletedModel from '../source/DeletedModel';
import { describe } from 'mocha';
import setupModel from './utils/setupModel';
import dropModel from './utils/dropModel';
import { expect } from 'chai';

type TestDocument = Document & DeletedDocument & { name: string };
type TestModel = Model<TestDocument, DeletedQuery<TestDocument>> & DeletedModel<TestDocument>;

describe('new model', function() {
	let TestModel: TestModel;

	before(async function() {
		TestModel = setupModel<TestDocument, TestModel>('TestNewModel', { name: String });
	});

	after(async function() {
		await dropModel('TestNewModel');
	});

	describe('new model', function() {
		it('create() -> set deleted=false', async function() {
			const puffy = await TestModel.create({ name: 'Puffy1' });
			expect(puffy.deleted).to.equal(false);
		});

		it('save() -> set deleted=false', async function() {
			const puffy = new TestModel({ name: 'Puffy2' });
			const success = await puffy.save();
			expect(success.deleted).to.equal(false);
		});

		it('insertMany() -> set deleted=false', async function() {
			const [puffy3, puffy4] = await TestModel.insertMany([{ name: 'Puffy3' }, { name: 'Puffy4' }]);
			expect(puffy3.deleted).to.equal(false);
			expect(puffy4.deleted).to.equal(false);
		});

		it('updateOne()-> with upsert set deleted=false', async function() {
			await TestModel.updateOne({ name: 'Puffy5' }, { name: 'Puffy6' }, { upsert: true });
			const puffy = await TestModel.findOne({ name: 'Puffy6' }).orFail();
			expect(puffy.deleted).to.equal(false);
		});

		it('bulkWrite() -> set deleted=false', async function() {
			await TestModel.bulkWrite([{
				insertOne: {
					document: { name: 'Puffy7' }
				}
			}]);
			const puffy = await TestModel.findOne({ name: 'Puffy7' }).orFail();
			expect(puffy.deleted).to.equal(false);
		});
	});
});
