import mongoose from 'mongoose';

export default async function dropModel(modelName: string): Promise<void> {
	await mongoose.connection.db.dropCollection(`mongoose_delete_${modelName}`);
}
