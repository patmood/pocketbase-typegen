// This file was @generated using pocketbase-typegen

export enum Collections {
	Base = "base",
	CustomAuth = "custom_auth",
	Everything = "everything",
	Posts = "posts",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string

export type AuthSystemFields = {
	collectionId: string
	collectionName: Collections,
	created: IsoDateString
	email: string
	emailVisibility: boolean
	id: RecordIdString,
	updated: IsoDateString
	username: string
	verified: boolean
	expand?: { [key: string]: any }
}

export type BaseSystemFields = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: { [key: string]: any }
}

export type BaseRecord = {
	field?: string
}

export type BaseResponse = BaseRecord & BaseSystemFields

export type CustomAuthRecord = {
	custom_field?: string
}

export type CustomAuthResponse = CustomAuthRecord & AuthSystemFields

export type EverythingRecord<Tanother_json_field = unknown, Tjson_field = unknown> = {
	text_field?: string
	number_field?: number
	bool_field?: boolean
	email_field?: string
	url_field: string
	date_field?: IsoDateString
	select_field?: "optionA" | "optionB" | "optionC"
	json_field?: null | Tjson_field
	another_json_field?: null | Tanother_json_field
	file_field?: string
	three_files_field?: string[]
	user_relation_field?: RecordIdString
	custom_relation_field?: RecordIdString
}

export type EverythingResponse<Tanother_json_field = unknown, Tjson_field = unknown> = EverythingRecord<Tanother_json_field, Tjson_field> & BaseSystemFields

export type PostsRecord = {
	field?: string
	nonempty_field: string
	nonempty_bool: boolean
	field1?: number
}

export type PostsResponse = PostsRecord & BaseSystemFields

export type UsersRecord = {
	name?: string
	avatar?: string
}

export type UsersResponse = UsersRecord & AuthSystemFields

export type CollectionRecords = {
	base: BaseRecord
	custom_auth: CustomAuthRecord
	everything: EverythingRecord
	posts: PostsRecord
	users: UsersRecord
}