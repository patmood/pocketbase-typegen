/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	Base = "base",
	CustomAuth = "custom_auth",
	Everything = "everything",
	MyView = "my_view",
	Posts = "posts",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly auto: unique symbol }
export type RecordIdString = string
export type HTMLString = string
export type Nullable<T> = T | null | ''

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type BaseSystemCreateFields = {
	id?: RecordIdString
}

export type BaseSystemUpdateFields = unknown

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

export type AuthSystemCreateFields = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
}

export type AuthSystemUpdateFields = {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type BaseRecord = {
	created: IsoAutoDateString
	field?: string
	id: string
	updated: IsoAutoDateString
}

export type CustomAuthRecord = {
	created: IsoAutoDateString
	custom_field?: string
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export enum EverythingSelectFieldOptions {
	"optionA" = "optionA",
	"OptionA" = "OptionA",
	"optionB" = "optionB",
	"optionC" = "optionC",
	"option with space" = "option with space",
	"sy?mb@!$" = "sy?mb@!$",
}
export type EverythingRecord<Tanother_json_field = never, Tjson_field = never> = {
	another_json_field?: null | Tanother_json_field
	bool_field?: boolean
	created: IsoAutoDateString
	custom_relation_field?: RecordIdString[]
	date_field?: IsoDateString
	email_field?: string
	file_field?: string | File
	id: string
	json_field?: null | Tjson_field
	number_field?: number
	post_relation_field?: RecordIdString
	rich_editor_field?: HTMLString
	select_field?: EverythingSelectFieldOptions
	select_field_no_values?: string
	text_field?: string
	three_files_field?: string[] | File[]
	updated?: IsoAutoDateString
	url_field?: string
	user_relation_field?: RecordIdString
}

export type MyViewRecord<Tjson_field = never> = {
	id: string
	json_field?: null | Tjson_field
	post_relation_field?: RecordIdString
	text_field?: string
}

export type PostsRecord = {
	created: IsoAutoDateString
	field1?: number
	id: string
	nonempty_bool: boolean
	nonempty_field: string
	updated?: IsoAutoDateString
}

export type UsersRecord = {
	avatar?: string | File
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = never> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = never> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = never> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = never> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = never> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type BaseResponse<Texpand = never> = Required<BaseRecord> & BaseSystemFields<Texpand>
export type CustomAuthResponse<Texpand = never> = Required<CustomAuthRecord> & AuthSystemFields<Texpand>
export type EverythingResponse<Tanother_json_field = never, Tjson_field = never, Texpand = never> = Required<EverythingRecord<Tanother_json_field, Tjson_field>> & BaseSystemFields<Texpand>
export type MyViewResponse<Tjson_field = never, Texpand = never> = Required<MyViewRecord<Tjson_field>> & BaseSystemFields<Texpand>
export type PostsResponse<Texpand = never> = Required<PostsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = never> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	base: BaseRecord
	custom_auth: CustomAuthRecord
	everything: EverythingRecord
	my_view: MyViewRecord
	posts: PostsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	base: BaseResponse
	custom_auth: CustomAuthResponse
	everything: EverythingResponse
	my_view: MyViewResponse
	posts: PostsResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>;
} & PocketBase;

/** Utility types for PocketBase record operations */

// Helper to determine if a collection is Auth
type IsAuthCollection<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields ? true : false;

// Utility type that omits fields of type IsoAutoDateString
type OmitAutodate<T> = {
	[K in keyof T as T[K] extends IsoAutoDateString ? never : K]: T[K]
};

// Create type for Auth collections
export type CreateAuth<T> = OmitAutodate<Omit<T, 'id'>> & AuthSystemCreateFields;

// Create type for Base collections
export type CreateBase<T> = OmitAutodate<Omit<T, 'id'>> & BaseSystemCreateFields;

// Update type for Auth collections
export type UpdateAuth<T> = Partial<Omit<T, keyof AuthSystemFields>> & AuthSystemUpdateFields;

// Update type for Base collections
export type UpdateBase<T> = Partial<Omit<T, keyof BaseSystemFields>> & BaseSystemUpdateFields;

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	IsAuthCollection<T> extends true
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>;

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	IsAuthCollection<T> extends true
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>;
