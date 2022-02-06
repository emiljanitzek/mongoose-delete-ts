interface DeletedQuery {
	withDeleted(): this
	notDeleted(): this
	onlyDeleted(): this
}

export default DeletedQuery;
