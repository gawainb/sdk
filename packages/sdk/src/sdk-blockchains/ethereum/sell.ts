import { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { toWord } from "@rarible/types"
import { ItemId } from "@rarible/api-client"
import {
	OrderInternalRequest,
	OrderUpdateRequest,
	PrepareOrderInternalRequest,
	PrepareOrderInternalResponse,
	PrepareOrderUpdateRequest,
	PrepareOrderUpdateResponse,
} from "../../order/common"
import {
	convertOrderHashToOrderId,
	convertUnionToEthereumAddress,
	getEthTakeAssetType,
	getSupportedCurrencies,
} from "./common"

export class SellInternal {
	constructor(private sdk: RaribleSdk) {
		this.sell = this.sell.bind(this)
		this.update = this.update.bind(this)
	}

	async sell(request: PrepareOrderInternalRequest): Promise<PrepareOrderInternalResponse> {
		const [domain, contract] = request.collectionId.split(":")
		if (domain !== "ETHEREUM") {
			throw new Error("Not an ethereum item")
		}
		const collection = await this.sdk.apis.nftCollection.getNftCollectionById({
			collection: contract,
		})

		const sellAction = this.sdk.order.sell
			.before(async (sellFormRequest: OrderInternalRequest) => {
				const { itemId } = getEthereumItemId(sellFormRequest.itemId)
				const item = await this.sdk.apis.nftItem.getNftItemById({ itemId })
				return {
					makeAssetType: {
						tokenId: item.tokenId,
						contract: item.contract,
					},
					amount: sellFormRequest.amount,
					takeAssetType: getEthTakeAssetType(sellFormRequest.currency),
					priceDecimal: sellFormRequest.price,
					payouts: sellFormRequest.payouts?.map(p => ({
						account: convertUnionToEthereumAddress(p.account),
						value: p.value,
					})) || [],
					originFees: sellFormRequest.originFees?.map(fee => ({
						account: convertUnionToEthereumAddress(fee.account),
						value: fee.value,
					})) || [],
				}
			})
			.after(order => convertOrderHashToOrderId(order.hash))

		return {
			multiple: collection.type === "ERC1155",
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: await this.sdk.order.getBaseOrderFee(),
			submit: sellAction,
		}
	}

	async update(prepareRequest: PrepareOrderUpdateRequest): Promise<PrepareOrderUpdateResponse> {
		if (!prepareRequest.orderId) {
			throw new Error("OrderId has not been specified")
		}
		const [blockchain, orderId] = prepareRequest.orderId.split(":")
		if (blockchain !== "ETHEREUM") {
			throw new Error("Not an ethereum order")
		}

		const sellUpdateAction = this.sdk.order.sellUpdate
			.before((request: OrderUpdateRequest) => {
				return {
					orderHash: toWord(orderId),
					priceDecimal: request.price,
				}
			})
			.after(order => convertOrderHashToOrderId(order.hash))

		return {
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: await this.sdk.order.getBaseOrderFee(),
			submit: sellUpdateAction,
		}
	}
}

function getEthereumItemId(itemId: ItemId) {
	const [domain, contract, tokenId] = itemId.split(":")
	if (domain !== "ETHEREUM") {
		throw new Error(`Not an ethereum item: ${itemId}`)
	}
	return {
		itemId: `${contract}:${tokenId}`,
		contract,
		tokenId,
		domain,
	}
}
