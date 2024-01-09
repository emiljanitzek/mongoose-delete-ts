import { Model, Schema, Types } from 'mongoose';
import { Deleted, DeletedMethods, DeletedQueryHelpers, DeletedStaticMethods } from '../source';
import { describe } from 'mocha';
import setupModel from './utils/setupModel';
import dropModel from './utils/dropModel';
import { expect } from 'chai';

type ParentTest = { name: string, child: Types.ObjectId } & Deleted;
type ParentTestQueryHelpers<T extends ParentTest = ParentTest> = DeletedQueryHelpers<T>;
type ParentTestModel<TRawDocType extends ParentTest = ParentTest> =
	Model<TRawDocType, ParentTestQueryHelpers<TRawDocType>, DeletedMethods> &
	DeletedStaticMethods<TRawDocType, ParentTestQueryHelpers<TRawDocType>>;

type ChildTest = { name: string } & Deleted;
type ChildTestQueryHelpers<T extends ChildTest = ChildTest> = DeletedQueryHelpers<T>;
type ChildTestModel<TRawDocType extends ChildTest = ChildTest> =
	Model<TRawDocType, ChildTestQueryHelpers<TRawDocType>, DeletedMethods> &
	DeletedStaticMethods<TRawDocType, ChildTestQueryHelpers<TRawDocType>>;

describe('population', function() {
	let ParentTestModel: ParentTestModel;
	let ChildTestModel: ChildTestModel;

	before(async function() {
		ChildTestModel = setupModel<ChildTest, ChildTestModel>('TestPopulationChildDelete', { name: String });
		ParentTestModel = setupModel<ParentTest, ParentTestModel>('TestPopulationParentDelete', {
			name: String,
			child: { type: Schema.Types.ObjectId, ref: 'TestPopulationChildDelete' }
		});
	});

	beforeEach(async function() {
		await ChildTestModel.create(
			[
				{ name: 'Obi-Wan Kenobi', _id: new Types.ObjectId('53da93b16b4a6670076b16b1'), deleted: true },
				{ name: 'Darth Vader', _id: new Types.ObjectId('53da93b16b4a6670076b16b2') },
				{ name: 'Luke Skywalker', _id: new Types.ObjectId('53da93b16b4a6670076b16b3'), deleted: true }
			]);
		await ParentTestModel.create(
			[
				{ name: 'Student 1', child: new Types.ObjectId('53da93b16b4a6670076b16b1') },
				{ name: 'Student 2', child: new Types.ObjectId('53da93b16b4a6670076b16b2') },
				{ name: 'Student 3', child: new Types.ObjectId('53da93b16b4a6670076b16b3'), deleted: true }
			]);
	});

	afterEach(async function() {
		await dropModel('TestPopulationChildDelete');
		await dropModel('TestPopulationParentDelete');
	});

	it('populate() -> not return deleted sub-document', async function() {
		const document = await ParentTestModel
			.findOne({ name: 'Student 1' })
			.populate({ path: 'child' })
			.orFail();

		expect(document.child).to.be.null;
	});

	it('populate() -> return non-deleted sub-document', async function() {
		const document = await ParentTestModel
			.findOne({ name: 'Student 2' })
			.populate({ path: 'child' })
			.orFail();

		expect(document.child).to.not.be.null;
	});

	it('populate() -> return deleted sub-document withDeleted=true', async function() {
		const document = await ParentTestModel
			.findOne({ name: 'Student 1' })
			.populate({ path: 'child', options: { ignoreDeleted: true } })
			.orFail();

		expect(document.child).to.not.be.null;
	});
});
