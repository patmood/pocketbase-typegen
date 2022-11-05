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
	EveryType = "every_type",
	Orders = "orders",
	Profiles = "profiles",
}

export type EveryTypeRecord<Tjson_field = unknown> = {
	text_field: string
	number_field: number
	bool_field: boolean
	email_field?: string
	url_field?: string
	date_field?: IsoDateString
	select_field?: "optionA" | "optionB" | "optionC"
	json_field?: null | Tjson_field
	file_field?: string
	relation_field?: RecordIdString
	user_field?: UserIdString
}

export type EveryTypeResponse<Tjson_field = unknown> = EveryTypeRecord<Tjson_field> & BaseRecord

export type OrdersRecord = {
	amount: number
	payment_type: "credit card" | "paypal" | "crypto"
	user: UserIdString
	product: string
}

export type OrdersResponse = OrdersRecord & BaseRecord

export type ProfilesRecord = {
	userId: UserIdString
	name?: string
	avatar?: string
}

export type ProfilesResponse = ProfilesRecord & BaseRecord

export type CollectionRecords = {
	every_type: EveryTypeRecord
	orders: OrdersRecord
	profiles: ProfilesRecord
}