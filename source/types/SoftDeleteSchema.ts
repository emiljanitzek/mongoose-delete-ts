import { HydratedDocument, InferRawDocType, ObtainSchemaGeneric, Schema, Types } from 'mongoose';
import { DeletedByMethods, DeletedMethods } from '../methods';
import { DeletedByStaticMethods, DeletedStaticMethods } from '../statics';
import { DeletedQueryHelpers } from './DeletedQuery';
import { DeleteSchemaOptions } from './DeleteSchemaOptions';

type IsAny<T> = 0 extends (1 & T) ? true : false;
type Simplify<T> = { [K in keyof T]: T[K] } & {};

type HasDeletedField<TOptions, K extends 'deletedAt' | 'deletedBy'> =
	TOptions extends Record<K, infer TField>
		? [TField] extends [false | '' | undefined] ? false : true
		: false;

type DeletedByDefinition<TField> = TField extends { type: unknown } ? Omit<TField, 'name'> : typeof Schema.Types.ObjectId;

export type InferDeletedBy<TOptions> =
	TOptions extends { deletedBy: infer TField }
		? IsAny<TField> extends true
			? any
			: InferRawDocType<{ deletedBy: DeletedByDefinition<TField> }> extends { deletedBy?: infer TUser }
				? NonNullable<TUser>
				: any
		: Types.ObjectId;

export type SoftDeleteFields<TOptions extends DeleteSchemaOptions = {}> = Simplify<
	{ deleted: boolean } &
	(HasDeletedField<TOptions, 'deletedAt'> extends true ? { deletedAt?: Date } : {}) &
	(HasDeletedField<TOptions, 'deletedBy'> extends true ? { deletedBy?: InferDeletedBy<TOptions> } : {})
>;

export type SoftDeleteMethods<TOptions extends DeleteSchemaOptions = {}> =
	DeletedMethods &
	(HasDeletedField<TOptions, 'deletedBy'> extends true ? DeletedByMethods<InferDeletedBy<TOptions>> : {});

export type SoftDeleteStatics<
	TOptions extends DeleteSchemaOptions,
	THydratedDocument,
	TQueryHelpers,
	TRawDocType
> =
	DeletedStaticMethods<THydratedDocument, TQueryHelpers, TRawDocType> &
	(HasDeletedField<TOptions, 'deletedBy'> extends true
		? DeletedByStaticMethods<THydratedDocument, InferDeletedBy<TOptions>, TQueryHelpers, TRawDocType>
		: {});

type SchemaGeneric =
	| 'EnforcedDocType'
	| 'M'
	| 'TInstanceMethods'
	| 'TQueryHelpers'
	| 'TVirtuals'
	| 'TStaticMethods'
	| 'TSchemaOptions'
	| 'DocType';
type Generic<TSchema, K extends SchemaGeneric> = ObtainSchemaGeneric<TSchema, K>;

export type SoftDeleteRawDocType<TSchema, TOptions extends DeleteSchemaOptions = {}> =
	(IsAny<Generic<TSchema, 'EnforcedDocType'>> extends true
		? Generic<TSchema, 'DocType'>
		: Generic<TSchema, 'EnforcedDocType'>) & SoftDeleteFields<TOptions>;

type QueryHelpers<TSchema> = Generic<TSchema, 'TQueryHelpers'> & DeletedQueryHelpers;
type InstanceMethods<TSchema, TOptions extends DeleteSchemaOptions> = Generic<TSchema, 'TInstanceMethods'> & SoftDeleteMethods<TOptions>;

export type SoftDeleteSchema<
	TSchema extends Schema<any, any, any, any, any, any, any, any, any, any, any>,
	TOptions extends DeleteSchemaOptions = {}
> = Schema<
	SoftDeleteRawDocType<TSchema, TOptions>,
	Generic<TSchema, 'M'>,
	InstanceMethods<TSchema, TOptions>,
	QueryHelpers<TSchema>,
	Generic<TSchema, 'TVirtuals'>,
	Generic<TSchema, 'TStaticMethods'> & SoftDeleteStatics<
		TOptions,
		HydratedDocument<
			SoftDeleteRawDocType<TSchema, TOptions>,
			InstanceMethods<TSchema, TOptions> & Generic<TSchema, 'TVirtuals'>,
			QueryHelpers<TSchema>,
			Generic<TSchema, 'TVirtuals'>
		>,
		QueryHelpers<TSchema>,
		SoftDeleteRawDocType<TSchema, TOptions>
	>,
	Generic<TSchema, 'TSchemaOptions'>
>;
