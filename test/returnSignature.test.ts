import { describe } from 'mocha';
import { expect } from 'chai';
import { HydratedDocument, Model } from 'mongoose';
import { Deleted, DeletedMethods, DeletedQueryHelpers, DeletedStaticMethods } from '../source';
import setupModel from './utils/setupModel';
import dropModel from './utils/dropModel';

type Test = { name: string } & Deleted;
type TestQueryHelpers = DeletedQueryHelpers<Test>;
type TestModel = Model<Test, TestQueryHelpers, DeletedMethods> & DeletedStaticMethods<Test, TestQueryHelpers>;
type TestDocument = HydratedDocument<Test, DeletedMethods>;

describe('method return signature', function() {
	let TestModel: TestModel;
	before(function() {
		TestModel = setupModel<Test, TestModel>('TestReturnSignature', { name: String });
	});

	after(async function() {
		await dropModel('TestReturnSignature');
	});

	it('delete() -> return a thenable (Promise)', async function() {
		const puffy = await TestModel.create({ name: 'Puffy' });
		expect(puffy.delete()).to.have.property('then');
	});

	it('delete() -> handle callback', function(done) {
		TestModel.create({ name: 'Puffy2' }, (err: Error | null, puffy: TestDocument) => {
			expect(err).to.not.exist;
			puffy.delete((err: Error | null) => {
				expect(err).to.not.exist;
				done();
			});
		});
	});

	it('delete() -> handle callback with options', function(done) {
		TestModel.create({ name: 'Puffy3' }, (err: Error | null, puffy: TestDocument) => {
			expect(err).to.not.exist;
			puffy.delete({ strict: false }, (err: Error | null) => {
				expect(err).to.not.exist;
				done();
			});
		});
	});
});
