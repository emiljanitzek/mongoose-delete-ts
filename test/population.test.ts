import { Document, Model, Types } from 'mongoose';
import DeletedDocument from '../source/DeletedDocument';
import DeletedQuery from '../source/DeletedQuery';
import DeletedModel from '../source/DeletedModel';
import { describe } from 'mocha';
import setupModel from './utils/setupModel';
import dropModel from './utils/dropModel';
import { expect } from 'chai';

type ParentTestDocument = Document & DeletedDocument & { name: string, child: Types.ObjectId };
type ParentTestModel = Model<ParentTestDocument, DeletedQuery<ParentTestDocument>> & DeletedModel<ParentTestDocument>;

type ChildTestDocument = Document & DeletedDocument & { name: string };
type ChildTestModel = Model<ChildTestDocument, DeletedQuery<ChildTestDocument>> & DeletedModel<ChildTestDocument>;

describe('population', function() {
	let ParentTestModel: ParentTestModel;
	let ChildTestModel: ChildTestModel;

	before(async function() {
		ChildTestModel = setupModel<ChildTestDocument, ChildTestModel>('TestPopulationChildDelete', { name: String });
		ParentTestModel = setupModel<ParentTestDocument, ParentTestModel>('TestPopulationParentDelete', { name: String, child: { type: Types.ObjectId, ref: 'TestPopulationChildDelete' } as any });
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
