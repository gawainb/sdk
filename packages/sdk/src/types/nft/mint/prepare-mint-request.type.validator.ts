// @ts-nocheck
// eslint-disable
// This file is generated by create-validator-ts
import Ajv from 'ajv';
import * as apiTypes from './prepare-mint-request.type';

export const SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": {
        "PrepareMintRequest": {
            "anyOf": [
                {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                        "collection": {
                            "$ref": "#/definitions/Collection"
                        },
                        "tokenId": {
                            "$ref": "#/definitions/TokenId"
                        }
                    },
                    "required": [
                        "collection"
                    ]
                },
                {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                        "collectionId": {
                            "$ref": "#/definitions/UnionAddress"
                        },
                        "tokenId": {
                            "$ref": "#/definitions/TokenId"
                        }
                    },
                    "required": [
                        "collectionId"
                    ]
                }
            ]
        },
        "TokenId": {
            "type": "object",
            "properties": {
                "tokenId": {
                    "type": "string"
                },
                "signature": {
                    "type": "object",
                    "properties": {
                        "v": {
                            "type": "number"
                        },
                        "r": {
                            "$ref": "#/definitions/Binary"
                        },
                        "s": {
                            "$ref": "#/definitions/Binary"
                        }
                    },
                    "required": [
                        "v",
                        "r",
                        "s"
                    ],
                    "additionalProperties": false
                }
            },
            "required": [
                "tokenId",
                "signature"
            ],
            "additionalProperties": false
        },
        "Binary": {
            "type": "string"
        },
        "Collection": {
            "type": "object",
            "properties": {
                "id": {
                    "$ref": "#/definitions/UnionAddress"
                },
                "type": {
                    "$ref": "#/definitions/Collection_Type"
                },
                "name": {
                    "type": "string"
                },
                "symbol": {
                    "type": "string"
                },
                "owner": {
                    "$ref": "#/definitions/UnionAddress"
                },
                "features": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/Collection_Features"
                    }
                }
            },
            "required": [
                "id",
                "type",
                "name",
                "features"
            ],
            "additionalProperties": false
        },
        "UnionAddress": {
            "type": "string"
        },
        "Collection_Type": {
            "type": "string",
            "enum": [
                "CRYPTO_PUNKS",
                "ERC721",
                "ERC1155",
                "FLOW",
                "TEZOS"
            ]
        },
        "Collection_Features": {
            "type": "string",
            "enum": [
                "APPROVE_FOR_ALL",
                "SET_URI_PREFIX",
                "BURN",
                "MINT_WITH_ADDRESS",
                "SECONDARY_SALE_FEES",
                "MINT_AND_TRANSFER"
            ]
        },
        "HasCollection": {
            "type": "object",
            "properties": {
                "collection": {
                    "$ref": "#/definitions/Collection"
                }
            },
            "required": [
                "collection"
            ],
            "additionalProperties": false
        },
        "HasCollectionId": {
            "type": "object",
            "properties": {
                "collectionId": {
                    "$ref": "#/definitions/UnionAddress"
                }
            },
            "required": [
                "collectionId"
            ],
            "additionalProperties": false
        }
    }
};
const ajv = new Ajv({ removeAdditional: true }).addSchema(SCHEMA, "SCHEMA");
export function validatePrepareMintRequest(payload: unknown): apiTypes.PrepareMintRequest {
  if (!isPrepareMintRequest(payload)) {
    const error = new Error('invalid payload: PrepareMintRequest');
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isPrepareMintRequest(payload: unknown): payload is apiTypes.PrepareMintRequest {
  /** Schema is defined in {@link SCHEMA.definitions.PrepareMintRequest } **/
  const ajvValidate = ajv.compile({ "$ref": "SCHEMA#/definitions/PrepareMintRequest" });
  return ajvValidate(payload);
}

export function validateHasCollection(payload: unknown): apiTypes.HasCollection {
  if (!isHasCollection(payload)) {
    const error = new Error('invalid payload: HasCollection');
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isHasCollection(payload: unknown): payload is apiTypes.HasCollection {
  /** Schema is defined in {@link SCHEMA.definitions.HasCollection } **/
  const ajvValidate = ajv.compile({ "$ref": "SCHEMA#/definitions/HasCollection" });
  return ajvValidate(payload);
}

export function validateHasCollectionId(payload: unknown): apiTypes.HasCollectionId {
  if (!isHasCollectionId(payload)) {
    const error = new Error('invalid payload: HasCollectionId');
    error.name = "ValidationError";
    throw error;
  }
  return payload;
}

export function isHasCollectionId(payload: unknown): payload is apiTypes.HasCollectionId {
  /** Schema is defined in {@link SCHEMA.definitions.HasCollectionId } **/
  const ajvValidate = ajv.compile({ "$ref": "SCHEMA#/definitions/HasCollectionId" });
  return ajvValidate(payload);
}
