import { Model } from 'mongoose';
import { Deleted, DeletedMethods, DeletedQueryHelpers, DeletedStaticMethods } from '../source';
import { describe } from 'mocha';
import setupModel from './utils/setupModel';
import dropModel from './utils/dropModel';
import { expect } from 'chai';

type Test = { name: string } & Deleted;
type TestQueryHelpers = DeletedQueryHelpers<Test>;
type TestModel = Model<Test, TestQueryHelpers, DeletedMethods> & DeletedStaticMethods<Test, TestQueryHelpers>;

describe('exists', function() {
	let TestModel: TestModel;

	before(async function() {
		TestModel = setupModel<Test, TestModel>('TestExists', { name: String });
	});

	beforeEach(async function() {
		await TestModel.create(
			[
				{ name: 'Obi-Wan Kenobi', deleted: true },
				{ name: 'Darth Vader' }
			]);
	});

	afterEach(async function() {
		await dropModel('TestExists');
	});

	describe('without deleted', function() {
		it('exists() -> return non-deleted document', async function() {
			const result = await TestModel.exists({ name: 'Darth Vader' });
			expect(result).to.not.be.null;
		});

		it('exists() -> not return deleted document', async function() {
			const result = await TestModel.exists({ name: 'Obi-Wan Kenobi' });
			expect(result).to.be.null;
		});
	});

	describe('only deleted', function() {
		it('exists() -> return deleted document', async function() {
			const result = await TestModel.exists({ name: 'Obi-Wan Kenobi' }).deletedDocuments();
			expect(result).to.not.be.null;
		});

		it('exists() -> not return non-deleted document', async function() {
			const result = await TestModel.exists({ name: 'Darth Vader' }).deletedDocuments();
			expect(result).to.be.null;
		});

		it('exists() -> return deleted document with deleted in filter', async function() {
			const result = await TestModel.exists({ name: 'Obi-Wan Kenobi', deleted: true });
			expect(result).to.not.be.null;
		});
	});

	describe('with deleted', function() {
		it('exists() -> return deleted document', async function() {
			const result = await TestModel.exists({ name: 'Obi-Wan Kenobi' }).allDocuments();
			expect(result).to.not.be.null;
		});

		it('exists() -> return non-deleted document', async function() {
			const result = await TestModel.exists({ name: 'Darth Vader' }).allDocuments();
			expect(result).to.not.be.null;
		});
	});
});
