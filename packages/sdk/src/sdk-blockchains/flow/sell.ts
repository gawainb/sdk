import { FlowWallet } from "@rarible/sdk-wallet"
import { toOrderId } from "@rarible/types"
import { FlowSdk } from "@rarible/flow-sdk"
import { Action } from "@rarible/action"
import { toBn } from "@rarible/utils/build/bn"
import { Order, OrderId } from "@rarible/api-client"
import {
	OrderInternalRequest,
	OrderUpdateRequest,
	PrepareOrderInternalRequest,
	PrepareOrderInternalResponse,
	PrepareOrderUpdateRequest,
	PrepareOrderUpdateResponse,
} from "../../order/common"
import { getFungibleTokenName, parseUnionItemId } from "./common/converters"
import { api } from "./common/api"
import { CurrencyType } from "../../common/domain"

export class FlowSell {
	constructor(private sdk: FlowSdk, private wallet: FlowWallet) {
		this.sell = this.sell.bind(this)
		this.update = this.update.bind(this)
	}

	async getPreparedOrder(request: OrderId): Promise<Order> {
		return api(this.wallet.network).orderController.getOrderById({ id: request })
	}

	async sell(request: PrepareOrderInternalRequest): Promise<PrepareOrderInternalResponse> {
		const [blockchain, contract] = request.collectionId.split(":")
		if (blockchain !== "FLOW") {
			throw new Error("Not an flow item")
		}
		const sellAction = Action.create({
			id: "send-tx" as const,
			run: async (sellRequest: OrderInternalRequest) => {
				if (sellRequest.currency["@type"] === "FLOW_FT") {
					const currency = getFungibleTokenName(sellRequest.currency.contract)
					const { itemId } = parseUnionItemId(sellRequest.itemId)
					return await this.sdk.order.sell(
						contract,
						currency,
						parseInt(itemId), //todo leave string when support it on flow-sdk transactions
						toBn(sellRequest.price).decimalPlaces(8).toString(),
					)
				}
				throw Error(`Unsupported currency type: ${sellRequest.currency["@type"]}`)
			},
		}).after((tx) => {
			const orderId = tx.events.find(e => {
				const eventType = e.type.split(".")[3]
				return eventType === "OrderAvailable"
			})
			if (orderId) {
				return toOrderId(`FLOW:${orderId.data.orderId}`)
			}
			throw Error("Creation order event not fount in transaction result")
		})


		return {
			multiple: false,
			supportedCurrencies: [
				{ blockchain: "FLOW", type: "NATIVE" },
			],
			baseFee: 0, //todo
			submit: sellAction,
		}
	}

	async update(request: PrepareOrderUpdateRequest): Promise<PrepareOrderUpdateResponse> {
		const [blockchain, orderId] = request.orderId.split(":")
		if (blockchain !== "FLOW") {
			throw new Error("Not an flow order")
		}
		const order = await this.getPreparedOrder(request.orderId)
		const sellAction = Action.create({
			id: "send-tx" as const,
			run: async (sellRequest: OrderUpdateRequest) => {
				if (order.make.type["@type"] === "FLOW_FT") {
					const currency = getFungibleTokenName(order.make.type.contract)
					return await this.sdk.order.updateOrder(
						order.make.type.contract,
						currency,
						parseInt(orderId), //todo leave string when support it on flow-sdk transactions
						toBn(sellRequest.price).decimalPlaces(8).toString(),
					)
				}
				throw Error(`Unsupported currency: ${order.make.type["@type"]}`)
			},
		}).after((tx) => {
			const orderId = tx.events.find(e => {
				const eventType = e.type.split(".")[3]
				return eventType === "OrderAvailable"
			})
			if (orderId) {
				if (order.make.type["@type"] === "FLOW_FT") {
					return toOrderId(`FLOW:${orderId.data.orderId}`)
				}
				throw Error(`Unsupported currency: ${order.make.type["@type"]}`)
			}
			throw Error("Creation order event not fount in transaction result")
		})


		return {
			supportedCurrencies: [
				{ blockchain: "FLOW", type: "FT" },
			],
			baseFee: 0, //todo
			submit: sellAction,
		}
	}
}

type Currency = string

function getCurrencies(types: CurrencyType[]): Currency[] {
	return types.flatMap(type => {
		if (type.blockchain === "FLOW") {
			return [
				"FLOW",
				"FLOW_USD",
			]
		}
		return null as any
	})
}
