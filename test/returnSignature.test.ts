import { describe } from 'mocha';
import { expect } from 'chai';
import { Document, Model } from 'mongoose';
import DeletedDocument from '../source/DeletedDocument';
import DeletedQuery from '../source/DeletedQuery';
import DeletedModel from '../source/DeletedModel';
import setupModel from './utils/setupModel';
import dropModel from './utils/dropModel';

type TestDocument = Document & DeletedDocument & { name: string };
type TestModel = Model<TestDocument, DeletedQuery<TestDocument>> & DeletedModel<TestDocument>;

describe('method return signature', function() {
	let TestModel: TestModel;
	before(function() {
		TestModel = setupModel<TestDocument, TestModel>('TestReturnSignature', { name: String });
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
