import { Model } from 'mongoose';
import { Deleted, DeletedMethods, DeletedQueryHelpers, DeletedStaticMethods } from '../source';
import { describe } from 'mocha';
import setupModel from './utils/setupModel';
import dropModel from './utils/dropModel';
import { expect } from 'chai';
import { expectModifiedCount, expectOk, expectUpsertedCount } from './utils/mongooseExpects';

type Test = { name: string } & Deleted;
type TestQueryHelpers<T extends Test = Test> = DeletedQueryHelpers<T>;
type TestModel<TRawDocType extends Test = Test> =
	Model<TRawDocType, TestQueryHelpers<TRawDocType>, DeletedMethods> & DeletedStaticMethods<TRawDocType, TestQueryHelpers<TRawDocType>>;

describe('fetch', function() {
	let TestModel: TestModel;

	before(async function() {
		TestModel = setupModel<Test, TestModel>('TestFetchDelete', { name: String });
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
		await dropModel('TestFetchDelete');
	});

	describe('without deleted', function() {
		it('countDocuments() -> returns 1 document', async function() {
			const count = await TestModel.countDocuments();
			expect(count).to.equal(1);
		});

		it('find() -> returns 1 document', async function() {
			const items = await TestModel.find();
			expect(items).to.have.lengthOf(1);
		});

		it('findOne() -> return non-deleted document', async function() {
			const item = await TestModel.findOne({ name: 'Darth Vader' });
			expect(item).to.not.be.null;
		});

		it('findOne() -> not return deleted document', async function() {
			const item = await TestModel.findOne({ name: 'Obi-Wan Kenobi' });
			expect(item).to.be.null;
		});

		it('findById() -> return non-deleted document', async function() {
			const pre = await TestModel.findOne({ name: 'Darth Vader' }).orFail();
			const item = await TestModel.findById(pre._id);
			expect(item).to.not.be.null;
		});

		it('findById() -> not return deleted document', async function() {
			const pre = await TestModel.findOne({ name: 'Obi-Wan Kenobi' }).withDeleted().orFail();
			const item = await TestModel.findById(pre._id);
			expect(item).to.be.null;
		});

		it('findOneAndUpdate() -> find and update non-deleted document', async function() {
			const doc = await TestModel.findOneAndUpdate({ name: 'Darth Vader' }, { name: 'Darth Vader Test' });
			expect(doc).to.not.be.null;
		});

		it('findOneAndUpdate() -> not find and update deleted document', async function() {
			const doc = await TestModel.findOneAndUpdate({ name: 'Obi-Wan Kenobi' }, { name: 'Obi-Wan Kenobi Test' });
			expect(doc).to.be.null;
		});

		it('findByIdAndUpdate() -> find and update non-deleted document', async function() {
			const pre = await TestModel.findOne({ name: 'Darth Vader' }).orFail();
			const doc = await TestModel.findByIdAndUpdate(pre._id, { name: 'Darth Vader Test' });
			expect(doc).to.not.be.null;
		});

		it('findByIdAndUpdate() -> not find and update deleted document', async function() {
			const pre = await TestModel.findOne({ name: 'Obi-Wan Kenobi' }).withDeleted().orFail();
			const doc = await TestModel.findByIdAndUpdate(pre._id, { name: 'Obi-Wan Kenobi Test' });
			expect(doc).to.be.null;
		});

		it('updateOne() -> updates first non-deleted document', async function() {
			const result = await TestModel.updateOne({ name: 'Darth Vader' }, { name: 'Darth Vader Test' });
			expectOk(result);
			expectModifiedCount(result, 1);
		});

		it('updateOne() -> not to update first deleted document', async function() {
			const result = await TestModel.updateOne({ name: 'Obi-Wan Kenobi' }, { name: 'Obi-Wan Kenobi Test' });
			expectOk(result);
			expectModifiedCount(result, 0);
		});

		it('updateOne() -> insert new document when deleted', async function() {
			const result = await TestModel.updateOne({ name: 'Obi-Wan Kenobi' }, { name: 'Obi-Wan Kenobi Test' }, { upsert: true });
			expectOk(result);
			expectUpsertedCount(result, 1);
		});

		it('updateMany() -> updates non-deleted document', async function() {
			const result = await TestModel.updateMany({}, { name: 'Luke Skywalker Test' });
			expectOk(result);
			expectModifiedCount(result, 1);
		});
	});

	describe('only deleted', function() {
		it('countDocuments() -> returns 2 document', async function() {
			const count = await TestModel.countDocuments().onlyDeleted();
			expect(count).to.equal(2);
		});

		it('find() -> returns 2 document', async function() {
			const items = await TestModel.find().onlyDeleted();
			expect(items).to.have.lengthOf(2);
		});

		it('findOne() -> returns deleted document', async function() {
			const item = await TestModel.findOne({ name: 'Obi-Wan Kenobi' }).onlyDeleted();
			expect(item).to.not.be.null;
		});

		it('findOne() -> not return non-deleted document', async function() {
			const item = await TestModel.findOne({ name: 'Darth Vader' }).onlyDeleted();
			expect(item).to.be.null;
		});

		it('findById() -> not return non-deleted document', async function() {
			const pre = await TestModel.findOne({ name: 'Darth Vader' }).orFail();
			const item = await TestModel.findById(pre._id).onlyDeleted();
			expect(item).to.be.null;
		});

		it('findById() -> return deleted document', async function() {
			const pre = await TestModel.findOne({ name: 'Obi-Wan Kenobi' }).withDeleted().orFail();
			const item = await TestModel.findById(pre._id).onlyDeleted();
			expect(item).to.not.be.null;
		});

		it('findOneAndUpdate() -> not find and update non-deleted document', async function() {
			const doc = await TestModel.findOneAndUpdate({ name: 'Darth Vader' }, { name: 'Darth Vader Test' }).onlyDeleted();
			expect(doc).to.be.null;
		});

		it('findOneAndUpdate() -> find and update deleted document', async function() {
			const doc = await TestModel.findOneAndUpdate({ name: 'Obi-Wan Kenobi' }, { name: 'Obi-Wan Kenobi Test' }).onlyDeleted();
			expect(doc).to.not.be.null;
		});

		it('findByIdAndUpdate() -> not find and update non-deleted document', async function() {
			const pre = await TestModel.findOne({ name: 'Darth Vader' }).orFail();
			const doc = await TestModel.findByIdAndUpdate(pre._id, { name: 'Darth Vader Test' }).onlyDeleted();
			expect(doc).to.be.null;
		});

		it('findByIdAndUpdate() -> find and update deleted document', async function() {
			const pre = await TestModel.findOne({ name: 'Obi-Wan Kenobi' }).withDeleted().orFail();
			const doc = await TestModel.findByIdAndUpdate(pre._id, { name: 'Obi-Wan Kenobi Test' }).onlyDeleted();
			expect(doc).to.not.be.null;
		});

		it('updateOne() -> not to update first non-deleted document', async function() {
			const result = await TestModel.updateOne({ name: 'Darth Vader', deleted: true }, { name: 'Darth Vader Test' });
			expectOk(result);
			expectModifiedCount(result, 0);
		});

		it('updateOne() -> updates first deleted document', async function() {
			const result = await TestModel.updateOne({ name: 'Obi-Wan Kenobi', deleted: true }, { name: 'Obi-Wan Kenobi Test' });
			expectOk(result);
			expectModifiedCount(result, 1);
		});

		it('updateMany() -> updates deleted document', async function() {
			const result = await TestModel.updateMany({ deleted: true }, { name: 'Luke Skywalker Test' });
			expectOk(result);
			expectModifiedCount(result, 2);
		});
	});

	describe('with deleted', function() {
		it('countDocuments() -> return 3 document', async function() {
			const count = await TestModel.countDocuments().withDeleted();
			expect(count).to.equal(3);
		});

		it('find() -> return 3 document', async function() {
			const items = await TestModel.find().withDeleted();
			expect(items.length).to.equal(3);
		});

		it('findOne() -> return deleted document', async function() {
			const item = await TestModel.findOne({ name: 'Obi-Wan Kenobi' }).withDeleted().orFail();
			expect(item).to.not.be.null;
			expect(item.name).to.exist;
		});

		it('findOne() -> return non-deleted document', async function() {
			const item = await TestModel.findOne({ name: 'Darth Vader' }).withDeleted();
			expect(item).to.not.be.null;
		});

		it('findById() -> return non-deleted document', async function() {
			const pre = await TestModel.findOne({ name: 'Darth Vader' }).orFail();
			const item = await TestModel.findById(pre._id).withDeleted();
			expect(item).to.not.be.null;
		});

		it('findById() -> return deleted document', async function() {
			const pre = await TestModel.findOne({ name: 'Obi-Wan Kenobi' }).withDeleted().orFail();
			const item = await TestModel.findById(pre._id).withDeleted();
			expect(item).to.not.be.null;
		});

		it('findOneAndUpdate() -> find and update non-deleted document', async function() {
			const doc = await TestModel.findOneAndUpdate({ name: 'Darth Vader' }, { name: 'Darth Vader Test' }).withDeleted();
			expect(doc).to.not.be.null;
		});

		it('findOneAndUpdate() -> find and update deleted document', async function() {
			const doc = await TestModel.findOneAndUpdate({ name: 'Obi-Wan Kenobi' }, { name: 'Obi-Wan Kenobi Test' }).withDeleted();
			expect(doc).to.not.be.null;
		});

		it('findByIdAndUpdate() -> find and update non-deleted document', async function() {
			const pre = await TestModel.findOne({ name: 'Darth Vader' }).orFail();
			const doc = await TestModel.findByIdAndUpdate(pre._id, { name: 'Darth Vader Test' }).withDeleted();
			expect(doc).to.not.be.null;
		});

		it('findByIdAndUpdate() -> find and update deleted document', async function() {
			const pre = await TestModel.findOne({ name: 'Obi-Wan Kenobi' }).withDeleted().orFail();
			const doc = await TestModel.findByIdAndUpdate(pre._id, { name: 'Obi-Wan Kenobi Test' }).withDeleted();
			expect(doc).to.not.be.null;
		});

		it('updateOne() -> updates first non-deleted document', async function() {
			const result = await TestModel.updateOne({ name: 'Darth Vader', deleted: { $in: [true, false] } }, { name: 'Darth Vader Test' });
			expectOk(result);
			expectModifiedCount(result, 1);
		});

		it('updateOne() -> updates first deleted document', async function() {
			const result = await TestModel.updateOne({ name: 'Obi-Wan Kenobi', deleted: { $in: [true, false] } }, { name: 'Obi-Wan Kenobi Test' });
			expectOk(result);
			expectModifiedCount(result, 1);
		});

		it('updateMany() -> updates all documents', async function() {
			const result = await TestModel.updateMany({ deleted: { $in: [true, false] } }, { name: 'Luke Skywalker Test' });
			expectOk(result);
			expectModifiedCount(result, 3);
		});
	});
});
