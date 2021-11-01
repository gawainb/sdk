import { BlockchainWallet } from "@rarible/sdk-wallet"
import { IApisSdk, IRaribleInternalSdk } from "../domain"
import { Config } from "../config/type"
import { createEthereumSdk } from "./ethereum"
import { createFlowSdk } from "./flow"
import { createTezosSdk } from "./tezos"

export function getSDKBlockchainInstance(
	apis: IApisSdk, wallet: BlockchainWallet, config: Config,
): IRaribleInternalSdk {
	if (wallet.blockchain === "ETHEREUM") {
		return createEthereumSdk(wallet, apis, config.ethereumEnv)
	} else if (wallet.blockchain === "FLOW") {
		return createFlowSdk(wallet) as any
	} else if (wallet.blockchain === "TEZOS") {
		return createTezosSdk(wallet) as any
	} else {
		throw new Error("Unsupported wallet blockchain")
	}
}
