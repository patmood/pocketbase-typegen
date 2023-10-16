/**
* This file was @generated using pocketbase-typegen
*/

import PocketBase, { RecordService } from 'pocketbase'

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
	another_json_field?: null | Tanother_json_field
	bool_field?: boolean
	custom_relation_field?: RecordIdString[]
	date_field?: IsoDateString
	email_field?: string
	file_field?: string
	json_field?: null | Tjson_field
	number_field?: number
	post_relation_field?: RecordIdString
	rich_editor_field?: HTMLString
	select_field?: EverythingSelectFieldOptions
	select_field_no_values?: string
	text_field?: string
	three_files_field?: string[]
	url_field?: string
	user_relation_field?: RecordIdString
}

export type MyViewRecord<Tjson_field = unknown> = {
	json_field?: null | Tjson_field
	post_relation_field?: RecordIdString
	text_field?: string
}

export type PostsRecord = {
	field1?: number
	field?: string
	nonempty_bool: boolean
	nonempty_field: string
}

export type UsersRecord = {
	avatar?: string
	name?: string
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

// Type for usage with type asserted Pocketbase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: string): RecordService
	collection(idOrName: 'base'): RecordService<BaseResponse>
	collection(idOrName: 'custom_auth'): RecordService<CustomAuthResponse>
	collection(idOrName: 'everything'): RecordService<EverythingResponse>
	collection(idOrName: 'my_view'): RecordService<MyViewResponse>
	collection(idOrName: 'posts'): RecordService<PostsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}