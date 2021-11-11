import mongoose from 'mongoose';

export const mochaHooks = {
	async beforeAll() {
		await mongoose.connect(process.env.MONGOOSE_TEST_URI || 'mongodb://localhost/test');
	},
	async afterAll() {
		await mongoose.connection.db.dropDatabase();
		await mongoose.disconnect();
	}
};
