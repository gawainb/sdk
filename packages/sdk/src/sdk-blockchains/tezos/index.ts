import { TezosWallet } from "@rarible/sdk-wallet"
import { IRaribleSdk } from "../../domain"
import { Sell } from "./sell"
import { Fill } from "./fill"
import { createControllers } from "./controllers"

export function createTezosSdk(wallet: TezosWallet): IRaribleSdk {
	const controllers = createControllers(wallet.provider.api)

	return {
		nft: {
			mint: null as any,
		},
		order: {
			fill: new Fill(wallet.provider, controllers).fill,
			sell: new Sell(wallet.provider, controllers).sell,
		},
	}
}
