import { describe } from 'mocha';
import { expect } from 'chai';
import { Model, Query, Types } from 'mongoose';
import {
	Deleted,
	DeletedBy,
	DeletedByMethods,
	DeletedByStaticMethods,
	DeletedMethods,
	DeletedQueryHelpers,
	DeletedStaticMethods
} from '../source';
import setupModel from './utils/setupModel';
import dropModel from './utils/dropModel';

type Test = { name: string } & Deleted & DeletedBy<Types.ObjectId>;
type TestQueryHelpers = DeletedQueryHelpers<Test>;
type TestModel = Model<Test, TestQueryHelpers, DeletedMethods & DeletedByMethods<Types.ObjectId>> &
	DeletedStaticMethods<Test, TestQueryHelpers> &
	DeletedByStaticMethods<Test, Types.ObjectId, TestQueryHelpers>;

describe('method return signature', function() {
	let TestModel: TestModel;
	before(function() {
		TestModel = setupModel<Test, TestModel>('TestReturnSignature', { name: String }, { deletedBy: true });
	});

	afterEach(async function() {
		await dropModel('TestReturnSignature');
	});

	it('delete() -> return a thenable (Promise)', async function() {
		const puffy = await TestModel.create({ name: 'Puffy' });
		expect(puffy.delete()).to.have.property('then');
	});

	it('delete() -> resolve to the document', async function() {
		const puffy = await TestModel.create({ name: 'Puffy' });
		const result = await puffy.delete();
		expect(result.name).to.equal('Puffy');
		expect(result.deleted).to.equal(true);
	});

	it('deleteOne() -> return a Query', async function() {
		await TestModel.create({ name: 'Puffy' });
		const query = TestModel.deleteOne({ name: 'Puffy' });
		expect(query).to.be.instanceOf(Query);
		const result = await query.exec();
		expect(result.deletedCount).to.equal(1);
	});

	it('deleteMany() -> return a Query', async function() {
		await TestModel.create([{ name: 'Puffy' }, { name: 'Puffy' }]);
		const query = TestModel.deleteMany({ name: 'Puffy' });
		expect(query).to.be.instanceOf(Query);
		const result = await query.exec();
		expect(result.deletedCount).to.equal(2);
	});

	it('deleteOneByUser() -> return a Query', async function() {
		await TestModel.create({ name: 'Puffy' });
		const query = TestModel.deleteOneByUser(new Types.ObjectId(), { name: 'Puffy' });
		expect(query).to.be.instanceOf(Query);
		const result = await query.exec();
		expect(result.deletedCount).to.equal(1);
	});

	it('deleteManyByUser() -> return a Query', async function() {
		await TestModel.create([{ name: 'Puffy' }, { name: 'Puffy' }]);
		const query = TestModel.deleteManyByUser(new Types.ObjectId(), { name: 'Puffy' });
		expect(query).to.be.instanceOf(Query);
		const result = await query.exec();
		expect(result.deletedCount).to.equal(2);
	});

	it('restoreOne() -> return a Query', async function() {
		await TestModel.create({ name: 'Puffy', deleted: true });
		const query = TestModel.restoreOne({ name: 'Puffy' });
		expect(query).to.be.instanceOf(Query);
		const result = await query.exec();
		expect(result.modifiedCount).to.equal(1);
	});

	it('findOneAndDelete() -> return a Query', async function() {
		await TestModel.create({ name: 'Puffy' });
		const query = TestModel.findOneAndDelete({ name: 'Puffy' });
		expect(query).to.be.instanceOf(Query);
		const result = await query.exec();
		expect(result?.name).to.equal('Puffy');
	});
});
