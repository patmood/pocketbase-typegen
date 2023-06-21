/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
	Base = "base",
	CustomAuth = "custom_auth",
	Everything = "everything",
	MyView = "my_view",
	Posts = "posts",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type BaseRecord = {
	field?: string
}

export type CustomAuthRecord = {
	custom_field?: string
}

export enum EverythingSelectFieldOptions {
	"optionA" = "optionA",
	"OptionA" = "OptionA",
	"optionB" = "optionB",
	"optionC" = "optionC",
	"option with space" = "option with space",
	"sy?mb@!$" = "sy?mb@!$",
}
export type EverythingRecord<Tanother_json_field = unknown, Tjson_field = unknown> = {
	text_field?: string
	number_field?: number
	bool_field?: boolean
	email_field?: string
	url_field?: string
	date_field?: IsoDateString
	select_field?: EverythingSelectFieldOptions
	json_field?: null | Tjson_field
	another_json_field?: null | Tanother_json_field
	file_field?: string
	three_files_field?: string[]
	user_relation_field?: RecordIdString
	custom_relation_field?: RecordIdString[]
	post_relation_field?: RecordIdString
	select_field_no_values?: string
	rich_editor_field?: HTMLString
}

export type MyViewRecord<Tjson_field = unknown> = {
	post_relation_field?: RecordIdString
	text_field?: string
	json_field?: null | Tjson_field
}

export type PostsRecord = {
	field?: string
	nonempty_field: string
	nonempty_bool: boolean
	field1?: number
}

export type UsersRecord = {
	name?: string
	avatar?: string
}

// Response types include system fields and match responses from the PocketBase API
export type BaseResponse<Texpand = unknown> = Required<BaseRecord> & BaseSystemFields<Texpand>
export type CustomAuthResponse<Texpand = unknown> = Required<CustomAuthRecord> & AuthSystemFields<Texpand>
export type EverythingResponse<Tanother_json_field = unknown, Tjson_field = unknown, Texpand = unknown> = Required<EverythingRecord<Tanother_json_field, Tjson_field>> & BaseSystemFields<Texpand>
export type MyViewResponse<Tjson_field = unknown, Texpand = unknown> = Required<MyViewRecord<Tjson_field>> & BaseSystemFields<Texpand>
export type PostsResponse<Texpand = unknown> = Required<PostsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	base: BaseRecord
	custom_auth: CustomAuthRecord
	everything: EverythingRecord
	my_view: MyViewRecord
	posts: PostsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	base: BaseResponse
	custom_auth: CustomAuthResponse
	everything: EverythingResponse
	my_view: MyViewResponse
	posts: PostsResponse
	users: UsersResponse
}