import { Model } from 'mongoose';
import { Deleted, DeletedMethods, DeletedQueryHelpers, DeletedStaticMethods } from '../source';
import { describe } from 'mocha';
import setupModel from './utils/setupModel';
import dropModel from './utils/dropModel';
import { expect } from 'chai';

type Test = { name: string } & Deleted;
type TestQueryHelpers = DeletedQueryHelpers<Test>;
type TestModel = Model<Test, TestQueryHelpers, DeletedMethods> & DeletedStaticMethods<Test, TestQueryHelpers>;

describe('overrideMethods', function() {
	let TestModel: TestModel;

	before(async function() {
		TestModel = setupModel<Test, TestModel>('TestOverrideMethods', { name: String }, { overrideMethods: ['find'] });
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

	it('findOne() -> not return deleted document', async function() {
		const puffy = await TestModel.findOne({ name: 'Obi-Wan Kenobi', deleted: false });
		expect(puffy).to.not.exist;
	});
});
