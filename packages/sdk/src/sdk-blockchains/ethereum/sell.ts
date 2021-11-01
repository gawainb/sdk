import { EthereumWallet } from "@rarible/sdk-wallet"
import { RaribleSdk } from "@rarible/protocol-ethereum-sdk"
import { toBigNumber } from "@rarible/types/build/big-number"
import { toAddress, toWord } from "@rarible/types"
import { CollectionControllerApi, ItemId, OrderId } from "@rarible/api-client"
import { Action } from "@rarible/action"
import { SellOrderStageId } from "@rarible/protocol-ethereum-sdk/build/order/sell"
import {
	OrderInternalRequest, OrderUpdateRequest,
	PrepareOrderInternalRequest,
	PrepareOrderInternalResponse,
	PrepareOrderUpdateRequest, PrepareOrderUpdateResponse,
} from "../../order/common"
import { Maybe } from "../../common/domain"
import {
	convertOrderHashToOrderId,
	convertUnionToEthereumAddress,
	getEthTakeAssetType,
	getSupportedCurrencies,
} from "./common"

type SellConfig = {
	collectionApi: CollectionControllerApi
	wallet?: EthereumWallet,
	sdk?: RaribleSdk
}

export class SellInternal {
	private readonly collectionApi: CollectionControllerApi
	private readonly sdk: Maybe<RaribleSdk>
	private readonly wallet: Maybe<EthereumWallet>

	constructor(config: SellConfig) {
		this.collectionApi = config.collectionApi
		this.wallet = config.wallet
		this.sdk = config.sdk
		this.sell = this.sell.bind(this)
		this.update = this.update.bind(this)
	}

	async sell(request: PrepareOrderInternalRequest): Promise<PrepareOrderInternalResponse> {
		const collection = await this.collectionApi.getCollectionById({ collection: request.collectionId })

		const response = {
			multiple: collection.type === "ERC1155",
			supportedCurrencies: getSupportedCurrencies(),
			baseFee: await this.sdk.order.getBaseOrderFee(),
		}

		if (!this.sdk || !this.wallet) {
			return {
				...response,
				submit: noSdkSellAction,
			}
		}

		const sdk = this.sdk
		const wallet = this.wallet
		const sellAction = this.sdk.order.sell
			.before(async (sellFormRequest: OrderInternalRequest) => {
				const { itemId } = getEthereumItemId(sellFormRequest.itemId)
				const item = await sdk.apis.nftItem.getNftItemById({ itemId })
				return {
					maker: toAddress(await wallet.ethereum.getFrom()), //TODO do we need maker here? Let's make it optional
					makeAssetType: {
						tokenId: toBigNumber(item.tokenId),
						contract: toAddress(item.contract),
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
			...response,
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
			//TODO here we need to pass type of the order, let's make it required
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

const noSdkSellAction: Action<SellOrderStageId, OrderInternalRequest, OrderId> = Action.create({
	id: "approve", run: () => Promise.reject("No SDK defined"),
})
