import mongoose from 'mongoose';

export default async function dropModel(modelName: string): Promise<void> {
	if (mongoose.connection.db) {
		await mongoose.connection.db.dropCollection(`mongoose_delete_${modelName}`);
	}
}
