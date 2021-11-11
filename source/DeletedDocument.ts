import { Callback, SaveOptions, Types } from 'mongoose';

interface DeletedDocument {
	restore(options?: SaveOptions): Promise<this>
	restore(options?: SaveOptions, fn?: Callback<this>): void;
	restore(fn?: Callback<this>): void;

	deleted: boolean;
}

export interface DeletedAtDocument {
	deletedAt: Date;
}

export interface DeletedByDocument<TUser = Types.ObjectId, TDeletedBy = TUser> {
	deleteByUser(user: TUser, options?: SaveOptions): Promise<this>
	deleteByUser(user: TUser, options?: SaveOptions, fn?: Callback<this>): Promise<this>
	deleteByUser(user: TUser, fn?: Callback<this>): void;

	deletedBy: TDeletedBy;
}

export default DeletedDocument;
