import { EthereumWallet } from "@rarible/sdk-wallet"
import { createE2eProvider } from "@rarible/ethereum-sdk-test-common"
import Web3 from "web3"
import { Web3Ethereum } from "@rarible/web3-ethereum"
import { toAddress, toBigNumber, toUnionAddress } from "@rarible/types"
import { MintType } from "../../nft/mint/domain"
import { createRaribleSdk } from "../../index"

describe("mint", () => {
	const { provider, wallet } = createE2eProvider()
	const ethereum = new Web3Ethereum({ web3: new Web3(provider) })

	const ethereumWallet = new EthereumWallet(ethereum, toUnionAddress(`ETHEREUM:${wallet.getAddressString()}`))
	const sdk = createRaribleSdk(ethereumWallet, "e2e")

	const erc721Address = toAddress("0x22f8CE349A3338B15D7fEfc013FA7739F5ea2ff7")
	const erc1155Address = toAddress("0x268dF35c389Aa9e1ce0cd83CF8E5752b607dE90d")

	test("should mint ERC721 token", async () => {
		const sender = await ethereum.getFrom()

		const collection = await sdk.apis.collection.getCollectionById({ collection: `ETHEREUM:${erc721Address}` })
		const action = await sdk.nft.mint({ collection })

		const result = await action.submit({
			uri: "uri",
			creators: [{ account: toUnionAddress(sender), value: toBigNumber("10000") }],
			royalties: [],
			lazyMint: false,
			supply: 1,
		})

		if (result.type === MintType.ON_CHAIN) {
			await result.transaction.wait()
		}
	})

	test("should mint ERC1155 token", async () => {
		const sender = await ethereum.getFrom()

		const collection = await sdk.apis.collection.getCollectionById({ collection: `ETHEREUM:${erc1155Address}` })
		const action = await sdk.nft.mint({ collection })

		const result = await action.submit({
			uri: "uri",
			creators: [{ account: toUnionAddress(sender), value: toBigNumber("10000") }],
			royalties: [],
			lazyMint: false,
			supply: 1,
		})

		if (result.type === MintType.ON_CHAIN) {
			await result.transaction.wait()
		}
	})

})
