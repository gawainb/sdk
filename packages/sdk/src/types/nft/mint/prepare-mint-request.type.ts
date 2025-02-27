import type { Collection } from "@rarible/api-client"
import type { UnionAddress } from "@rarible/types"
import type { TokenId } from "../generate-token-id"

export type PrepareMintRequest = {
	tokenId?: TokenId
} & (HasCollection | HasCollectionId)

export type HasCollection = {
	collection: Collection
}

export type HasCollectionId = {
	collectionId: UnionAddress
}
