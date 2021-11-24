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

describe('overrideMethods', function() {
	let TestModel: TestModel;

	before(async function() {
		TestModel = setupModel<TestDocument, TestModel>('TestOverrideMethods', { name: String }, { overrideMethods: ['find'] });
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
		await dropModel('TestOverrideMethods');
	});

	it('find() -> returns non-deleted documents', async function() {
		const docs = await TestModel.find();
		expect(docs).to.have.lengthOf(1);
	});

	it('findOne() -> return deleted document', async function() {
		const puffy = await TestModel.findOne({ name: 'Obi-Wan Kenobi' });
		expect(puffy).to.exist;
	});

	it('findOne().notDeleted() -> not return deleted document', async function() {
		const puffy = await TestModel.findOne({ name: 'Obi-Wan Kenobi' }).notDeleted();
		expect(puffy).to.not.exist;
	});
});
