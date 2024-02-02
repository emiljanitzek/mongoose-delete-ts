import { Schema, SchemaTypeOptions } from 'mongoose';

import hooks from './hooks';
import methods  from './methods';
import query from './query';
import statics  from './statics';
import DeletedFieldOptions from './types/DeletedFieldOptions';
import { DeletedField, DeleteOptions, Properties } from './types/DeleteOptions';
import DeletedSchema from './types/DeletedSchema';

export default function<TSchema extends DeletedSchema>(
	schema: TSchema,
	options: DeleteOptions = {}
): void {
	const typeKey = schema.get('typeKey') || 'type';
	const deletedFieldNames: DeletedFieldOptions = {};
	const indexFields = indexFieldsOption(options.indexFields);

	schema.add({
		deleted: {
			[typeKey]: Boolean,
			default: false,
			index: indexFields.includes('deleted'),
			...options.deleted
		}
	});
	if (hasDeletedField(options.deletedAt)) {
		const deletedAtName = deletedFieldName(options.deletedAt, 'deletedAt');
		deletedFieldNames.deletedAt = deletedAtName;
		schema.add({
			[deletedAtName]: {
				...deletedFieldOptions('deletedAt', { [typeKey]: Date }, options.deletedAt),
				index: indexFields.includes('deletedAt')
			}
		});
	}

	if (hasDeletedField(options.deletedBy)) {
		const deletedByName = deletedFieldName(options.deletedBy, 'deletedBy');
		deletedFieldNames.deletedBy = deletedByName;
		schema.add({
			[deletedByName]: {
				...deletedFieldOptions('deletedBy', { [typeKey]: Schema.Types.ObjectId }, options.deletedBy),
				index: indexFields.includes('deletedBy')
			}
		});
	}

	hooks(schema, options.overrideMethods);
	query(schema);
	methods(schema, options, deletedFieldNames);
	statics(schema, deletedFieldNames);
}

function hasDeletedField(option: DeletedField<unknown> | undefined): option is DeletedField<unknown> {
	return (option === true) ||
		(typeof option === 'string' && option.length > 0) ||
		(typeof option === 'object' && Object.keys(option).length > 0);
}

function deletedFieldName(option: DeletedField<unknown>, fallbackName: string): string {
	if (typeof option === 'string' && option.length > 0) {
		return option;
	}

	if (typeof option === 'object' && typeof option.name === 'string' && option.name.length > 0) {
		return option.name;
	}

	return fallbackName;
}

function deletedFieldOptions(
	name: string,
	defaultOptions: SchemaTypeOptions<unknown>,
	option: DeletedField<unknown>
): SchemaTypeOptions<unknown> {
	const fieldOption = Object.assign({}, defaultOptions);
	if (typeof option === 'string' && option.length > 0) {
		Object.assign(fieldOption, { alias: name });
	}
	if (typeof option === 'object') {
		Object.assign(fieldOption, option);
		if (option.name && option.name !== name) {
			Object.assign(fieldOption, { alias: name });
		}
	}

	return fieldOption;
}

function indexFieldsOption(indexFields?: Properties[] | boolean): Properties[] {
	if (indexFields === true) {
		return ['deleted', 'deletedAt', 'deletedBy'];
	} else if (Array.isArray(indexFields)) {
		return indexFields;
	} else if (indexFields === false) {
		return [];
	}
	return ['deleted'];
}
