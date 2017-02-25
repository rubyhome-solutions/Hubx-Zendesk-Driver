export interface Protocol {

	identifier: string;
	createAccount(params: Object): Promise<ProtocolResponse>;

}

export interface ProtocolResponse {

	identifier: string;
	data: Object;

}