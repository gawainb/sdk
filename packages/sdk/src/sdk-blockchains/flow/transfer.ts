import { Action } from "@rarible/action"
import { BlockchainFlowTransaction } from "@rarible/sdk-transaction"
import { FlowSdk } from "@rarible/flow-sdk"
import { toBigNumber } from "@rarible/types/build/big-number"
import { PrepareTransferRequest, TransferRequest } from "../../nft/transfer/domain"
import { parseUnionItemId } from "./common/converters"

export class FlowTransfer {
	constructor(
		private sdk: FlowSdk,
	) {
		this.transfer = this.transfer.bind(this)
	}

	async transfer(prepare: PrepareTransferRequest) {

		const { itemId, collectionId } = parseUnionItemId(prepare.itemId)

		return {
			multiple: false,
			maxAmount: toBigNumber("1"),
			submit: Action.create({
				id: "transfer" as const,
				run: async (request: Omit<TransferRequest, "amount">) => {
					//todo remove parseInt when strings are supports by flow-sdk
					const tx = await this.sdk.nft.transfer(collectionId, parseInt(itemId), request.to)
					return new BlockchainFlowTransaction(tx)
				},
			}),
		}
	}
}
