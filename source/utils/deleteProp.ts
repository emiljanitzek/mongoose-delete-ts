export default function deletedProp(
	fieldName: string | undefined,
	value: unknown
): Record<string, unknown> {
	if (fieldName) {
		return { [fieldName]: value };
	}
	return {};
}
