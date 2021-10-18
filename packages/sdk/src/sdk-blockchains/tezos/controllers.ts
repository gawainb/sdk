import {
	Configuration, NftActivityControllerApi,
	NftCollectionControllerApi,
	NftItemControllerApi,
	NftOwnershipControllerApi, OrderActivityControllerApi, OrderControllerApi, OrderSignatureControllerApi,
} from "tezos-api-client/build"

export type TezosControllers = {
	nftActivity: NftActivityControllerApi,
	nftCollection: NftCollectionControllerApi,
	nftItemApi: NftItemControllerApi,
	nftOwnership: NftOwnershipControllerApi,
	orderActivity: OrderActivityControllerApi,
	order: OrderControllerApi,
	orderSignature: OrderSignatureControllerApi,
}

export function createControllers(basePath: string): TezosControllers {
	const config = new Configuration({
		basePath: basePath,
	})

	return {
		nftActivity: new NftActivityControllerApi(config),
		nftCollection: new NftCollectionControllerApi(config),
		nftItemApi: new NftItemControllerApi(config),
		nftOwnership: new NftOwnershipControllerApi(config),
		orderActivity: new OrderActivityControllerApi(config),
		order: new OrderControllerApi(config),
		orderSignature: new OrderSignatureControllerApi(config),
	}
}
