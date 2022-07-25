import { Types } from 'mongoose';

type DeletedBy<TDeletedBy = Types.ObjectId> = {
	deletedBy: TDeletedBy;
}

export default DeletedBy;
