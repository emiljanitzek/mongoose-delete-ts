import mongoose from 'mongoose';

export const mochaHooks = {
	async beforeAll() {
		await mongoose.connect(process.env.MONGOOSE_TEST_URI || 'mongodb://127.0.0.1/test:27017');
	},
	async afterAll() {
		await mongoose.connection.db.dropDatabase();
		await mongoose.disconnect();
	}
};
