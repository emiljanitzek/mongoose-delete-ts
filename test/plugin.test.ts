import { expect } from 'chai';
import { describe } from 'mocha';
import mongoose, { Model, Schema, Types } from 'mongoose';
import mongooseDelete, {
	Deleted,
	DeletedAt,
	DeletedBy,
	DeletedByMethods,
	DeletedByStaticMethods,
	DeletedMethods,
	DeletedQueryHelpers,
	DeletedStaticMethods,
	mongooseDelete as namedExport
} from '../source';
import dropModel from './utils/dropModel';
import { testCollectionName } from './utils/setupModel';

type Pet = { name: string } & Deleted & DeletedAt & DeletedBy<Types.ObjectId>;
type PetQueryHelpers = DeletedQueryHelpers<Pet>;
type PetMethods = DeletedMethods & DeletedByMethods<Types.ObjectId>;
type PetStaticMethods = DeletedStaticMethods<Pet, PetQueryHelpers> & DeletedByStaticMethods<Pet, Types.ObjectId, PetQueryHelpers>;
type PetModel = Model<Pet, PetQueryHelpers, PetMethods> & PetStaticMethods;

describe('plugin exports', function() {
	it('exports the plugin as default and as mongooseDelete', function() {
		expect(namedExport).to.equal(mongooseDelete);
	});
});

describe('schema.plugin() with a typed schema', function() {
	const petSchema = new Schema<Pet, PetModel, PetMethods, PetQueryHelpers, {}, PetStaticMethods>({
		name: { type: String, required: true }
	}, { collection: testCollectionName('TestPluginTyped'), autoIndex: false });
	petSchema.plugin(mongooseDelete, { deletedAt: true, deletedBy: true });
	const PetModel = mongoose.model<Pet, PetModel>('TestPluginTyped', petSchema);

	afterEach(async function() {
		await dropModel('TestPluginTyped');
	});

	it('deletes and restores a document', async function() {
		const pet = await PetModel.create({ name: 'Fluffy' });
		const userId = new Types.ObjectId();

		const deleted = await pet.deleteByUser(userId);
		expect(deleted.deletedBy).to.deep.equal(userId);
		expect(deleted.deletedAt).to.be.instanceOf(Date);

		const found = await PetModel.findOne({ name: 'Fluffy' }).deletedDocuments().orFail();
		const restored = await found.restore();
		expect(restored.deleted).to.equal(false);
	});

	it('deletes and restores with statics', async function() {
		await PetModel.create({ name: 'Fluffy' });

		const deleteResult = await PetModel.deleteOneByUser(new Types.ObjectId(), { name: 'Fluffy' });
		expect(deleteResult.deletedCount).to.equal(1);
		expect(await PetModel.exists({ name: 'Fluffy' })).to.be.null;

		const restoreResult = await PetModel.restoreMany({ name: 'Fluffy' });
		expect(restoreResult.modifiedCount).to.equal(1);
		expect(await PetModel.exists({ name: 'Fluffy' })).to.not.be.null;
	});
});
