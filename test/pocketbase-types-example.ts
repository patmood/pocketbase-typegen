// This file was @generated using pocketbase-typegen

export type IsoDateString = string

export type RecordIdString = string

export type UserIdString = string

export type BaseRecord = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	"@collectionId": string
	"@collectionName": string
	"@expand"?: { [key: string]: any }
}

export enum Collections {
	Base = "base",
	CustomAuth = "custom_auth",
	Everything = "everything",
	Posts = "posts",
	Users = "users",
}

export type BaseRecord = {
	field?: string
}

export type BaseResponse = BaseRecord & BaseRecord

export type CustomAuthRecord = {
	custom_field?: string
}

export type CustomAuthResponse = CustomAuthRecord & BaseRecord

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

export type EverythingResponse<Tanother_json_field = unknown, Tjson_field = unknown> = EverythingRecord<Tanother_json_field, Tjson_field> & BaseRecord

export type PostsRecord = {
	field?: string
	nonempty_field: string
	nonempty_bool: boolean
	field1?: number
}

export type PostsResponse = PostsRecord & BaseRecord

export type UsersRecord = {
	name?: string
	avatar?: string
}

export type UsersResponse = UsersRecord & BaseRecord

export type CollectionRecords = {
	base: BaseRecord
	custom_auth: CustomAuthRecord
	everything: EverythingRecord
	posts: PostsRecord
	users: UsersRecord
}