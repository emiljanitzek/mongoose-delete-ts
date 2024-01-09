import { describe } from 'mocha';
import { expect } from 'chai';
import { Model } from 'mongoose';
import { Deleted, DeletedMethods, DeletedQueryHelpers, DeletedStaticMethods } from '../source';
import setupModel from './utils/setupModel';
import dropModel from './utils/dropModel';

type Test = { name: string } & Deleted;
type TestQueryHelpers<T extends Test = Test> = DeletedQueryHelpers<T>;
type TestModel<TRawDocType extends Test = Test> =
	Model<TRawDocType, TestQueryHelpers<TRawDocType>, DeletedMethods> & DeletedStaticMethods<TRawDocType, TestQueryHelpers<TRawDocType>>;

describe('method return signature', function() {
	let TestModel: TestModel;
	before(function() {
		TestModel = setupModel<Test, TestModel>('TestReturnSignature', { name: String });
	});

	after(async function() {
		await dropModel('TestReturnSignature');
	});

	it('deleteOne() -> return a thenable (Promise)', async function() {
		const puffy = await TestModel.create({ name: 'Puffy' });
		expect(puffy.deleteOne()).to.have.property('then');
	});
});
