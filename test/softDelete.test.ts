import { expect } from 'chai';
import { describe } from 'mocha';
import mongoose, { Query, Schema, Types } from 'mongoose';
import { softDelete } from '../source';
import dropModel from './utils/dropModel';
import { testCollectionName } from './utils/setupModel';
import { Accepts, assertType, Equals, HasKey } from './utils/types';

function schemaOptions(modelName: string) {
	return { collection: testCollectionName(modelName), autoIndex: false } as const;
}

describe('softDelete() with an inferred schema', function() {
	const petSchema = softDelete(new Schema({
		name: { type: String, required: true }
	}, schemaOptions('TestSoftDeleteInferred')));
	const Pet = mongoose.model('TestSoftDeleteInferred', petSchema);

	afterEach(async function() {
		await dropModel('TestSoftDeleteInferred');
	});

	it('types the document fields and methods', async function() {
		const pet = await Pet.create({ name: 'Fluffy' });
		assertType<Equals<typeof pet.name, string>>();
		assertType<Equals<typeof pet.deleted, boolean>>();

		const deleted = await pet.delete();
		assertType<Equals<typeof deleted, typeof pet>>();
		expect(deleted.deleted).to.equal(true);
		expect(deleted.name).to.equal('Fluffy');

		const restored = await deleted.restore();
		assertType<Equals<typeof restored, typeof pet>>();
		expect(restored.deleted).to.equal(false);

		assertType<Equals<HasKey<typeof pet, 'deletedAt'>, false>>();
		assertType<Equals<HasKey<typeof pet, 'deleteByUser'>, false>>();
		expect(pet.get('deletedAt')).to.not.exist;
	});

	it('types the query helpers', async function() {
		await Pet.create([{ name: 'Fluffy' }, { name: 'Puffy', deleted: true }]);

		const pets = await Pet.find();
		const all = await Pet.find().allDocuments();
		const deleted = await Pet.find().deletedDocuments().sort({ name: 1 });
		assertType<Equals<typeof all, typeof pets>>();
		expect(pets).to.have.lengthOf(1);
		expect(all).to.have.lengthOf(2);
		expect(deleted.map(pet => pet.name)).to.deep.equal(['Puffy']);

		const exists = await Pet.exists({ name: 'Puffy' }).allDocuments();
		expect(exists?._id).to.be.instanceOf(Types.ObjectId);
	});

	it('types the statics', async function() {
		await Pet.create([{ name: 'Fluffy' }, { name: 'Fluffy' }]);

		const deleteResult = await Pet.deleteMany({ name: 'Fluffy' }).exec();
		expect(deleteResult.deletedCount).to.equal(2);

		const restoreResult = await Pet.restoreOne({ name: 'Fluffy' });
		expect(restoreResult.modifiedCount).to.equal(1);
		await Pet.restoreMany({ name: 'Fluffy' });
		expect(await Pet.countDocuments()).to.equal(2);

		assertType<Equals<Accepts<typeof Pet.restoreOne, [{ name: string }]>, true>>();
		assertType<Equals<Accepts<typeof Pet.restoreOne, [{ name: number }]>, false>>();
		assertType<Equals<HasKey<typeof Pet, 'deleteOneByUser'>, false>>();
	});

	it('types lean documents', async function() {
		await Pet.create({ name: 'Fluffy' });

		const pet = await Pet.findOne({ name: 'Fluffy' }).lean().orFail();
		assertType<Equals<typeof pet.deleted, boolean>>();
		expect(pet.deleted).to.equal(false);
	});
});

describe('softDelete() with deletedAt and deletedBy', function() {
	const petSchema = softDelete(new Schema({
		name: { type: String, required: true }
	}, schemaOptions('TestSoftDeleteFields')), { deletedAt: true, deletedBy: true });
	const Pet = mongoose.model('TestSoftDeleteFields', petSchema);

	afterEach(async function() {
		await dropModel('TestSoftDeleteFields');
	});

	it('types deletedAt and deletedBy', async function() {
		const pet = await Pet.create({ name: 'Fluffy' });
		assertType<Equals<typeof pet.deletedAt, Date | undefined>>();
		assertType<Equals<typeof pet.deletedBy, Types.ObjectId | undefined>>();

		const userId = new Types.ObjectId();
		const deleted = await pet.deleteByUser(userId);
		assertType<Equals<typeof deleted, typeof pet>>();
		expect(deleted.deletedAt).to.be.instanceOf(Date);
		expect(deleted.deletedBy).to.deep.equal(userId);

		assertType<Equals<Accepts<typeof pet.deleteByUser, [Types.ObjectId]>, true>>();
		assertType<Equals<Accepts<typeof pet.deleteByUser, [string]>, false>>();
	});

	it('types the deletedBy statics', async function() {
		await Pet.create({ name: 'Fluffy' });
		const userId = new Types.ObjectId();

		const result = await Pet.deleteOneByUser(userId, { name: 'Fluffy' });
		expect(result.deletedCount).to.equal(1);

		const pet = await Pet.findOne({ name: 'Fluffy' }).allDocuments().orFail();
		expect(pet.deletedBy).to.deep.equal(userId);
	});
});

describe('softDelete() with a custom deletedBy type', function() {
	const petSchema = softDelete(new Schema({
		name: { type: String, required: true }
	}, schemaOptions('TestSoftDeleteDeletedByString')), { deletedBy: { name: 'deleted_by', type: String } });
	const Pet = mongoose.model('TestSoftDeleteDeletedByString', petSchema);

	afterEach(async function() {
		await dropModel('TestSoftDeleteDeletedByString');
	});

	it('infers deletedBy from the schema type', async function() {
		const pet = await Pet.create({ name: 'Fluffy' });
		assertType<Equals<typeof pet.deletedBy, string | undefined>>();

		const deleted = await pet.deleteByUser('john');
		expect(deleted.deletedBy).to.equal('john');
		expect(deleted.get('deleted_by')).to.equal('john');

		await Pet.deleteManyByUser('jane', { name: 'Fluffy' }).allDocuments();
		const updated = await Pet.findById(pet._id).allDocuments().orFail();
		expect(updated.deletedBy).to.equal('jane');
	});
});

type Pet = { name: string; age?: number };
type PetMethods = { greet(): string };
type PetQueryHelpers = { byName<TQuery extends Query<any, any>>(this: TQuery, name: string): TQuery };

describe('softDelete() with an explicitly typed schema', function() {
	const petSchema = softDelete(
		new Schema<Pet, mongoose.Model<Pet>, PetMethods, PetQueryHelpers>({
			name: { type: String, required: true },
			age: Number
		}, {
			...schemaOptions('TestSoftDeleteExplicit'),
			timestamps: true
		}),
		{ deletedAt: true }
	);
	petSchema.methods.greet = function() {
		return `Hello ${this.name}`;
	};
	petSchema.query.byName = function<TQuery extends Query<any, any>>(this: TQuery, name: string): TQuery {
		return this.where({ name });
	};
	const Pet = mongoose.model('TestSoftDeleteExplicit', petSchema);

	afterEach(async function() {
		await dropModel('TestSoftDeleteExplicit');
	});

	it('keeps the schema methods and adds the plugin methods', async function() {
		const pet = await Pet.create({ name: 'Fluffy', age: 3 });
		assertType<Equals<typeof pet.name, string>>();
		assertType<Equals<typeof pet.age, number | undefined>>();
		assertType<Equals<typeof pet.deletedAt, Date | undefined>>();
		expect(pet.greet()).to.equal('Hello Fluffy');

		const deleted = await pet.delete();
		expect(deleted.greet()).to.equal('Hello Fluffy');
		expect(deleted.deletedAt).to.be.instanceOf(Date);
	});

	it('keeps the schema query helpers and adds the plugin query helpers', async function() {
		await Pet.create([{ name: 'Fluffy' }, { name: 'Fluffy', deleted: true }]);

		const pets = await Pet.find().byName('Fluffy').allDocuments();
		expect(pets).to.have.lengthOf(2);

		const deleted = await Pet.find().allDocuments().byName('Fluffy').deletedDocuments();
		expect(deleted).to.have.lengthOf(1);
	});
});
