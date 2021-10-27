import { Action } from "@rarible/action"
import { FlowSdk } from "@rarible/flow-sdk"
import { toItemId } from "@rarible/types"
import { MintType, PrepareMintResponse } from "../../nft/mint/domain"
import { PrepareMintRequest } from "../../nft/mint/prepare-mint-request.type"
import { validatePrepareMintRequest } from "../../nft/mint/prepare-mint-request.type.validator"
import { MintRequest } from "../../nft/mint/mint-request.type"
import { getFlowCollection } from "./common/converters"

export class FlowMint {
	constructor(private sdk: FlowSdk) {
		this.prepare = this.prepare.bind(this)
	}

	async prepare(prepareRequest: PrepareMintRequest): Promise<PrepareMintResponse> {
		const { collection } = prepareRequest
		if (collection.type === "FLOW") {
			validatePrepareMintRequest(prepareRequest)
			const flowCollection = getFlowCollection(collection.id)
			return {
				multiple: false,
				supportsRoyalties: true,
				supportsLazyMint: false,
				submit: Action.create({
					id: "mint" as const,
					run: async (request: MintRequest) => {
						const mintResponse = await this.sdk.nft.mint(flowCollection, request.uri, request.royalties || [])
						return {
							type: MintType.ON_CHAIN,
							itemId: toItemId(`${mintResponse.tokenId}`),
							transaction: {
								blockchain: "FLOW",
								transaction: mintResponse,
								async wait() {
									return {
										blockchain: "FLOW",
										hash: mintResponse.txId,
									}
								},
							},
						}
					},
				}),
			}
		}
		throw new Error("Unsupported collection type")
	}
}
