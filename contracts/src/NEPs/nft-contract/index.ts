
import { NearBindgen, near, call, view, LookupMap, UnorderedMap, Vector, UnorderedSet, validateAccountId , initialize, assert} from 'near-sdk-js'
import { NFTContractMetadata, Token, TokenMetadata, internalNftMetadata } from './metadata';
import { internalMint } from './mint';
import { internalNftTokens, internalSupplyForOwner, internalTokensForOwner, internalTotalSupply } from './enumeration';
import { internalNftToken, internalNftTransfer, internalNftTransferCall, internalResolveTransfer } from './nft_core';
import { internalNftApprove, internalNftIsApproved, internalNftRevoke, internalNftRevokeAll } from './approval';
import { internalNftPayout, internalNftTransferPayout } from './royalty';

/// This spec can be treated like a version of the standard.
export const NFT_METADATA_SPEC = "nft-1.0.0";

/// This is the name of the NFT standard we're using
export const NFT_STANDARD_NAME = "nep171";


// export default abstract class Contract{
//     owner_id: string;
//     tokensPerOwner: LookupMap<any>;
//     tokensById: LookupMap<any>;
//     tokenMetadataById: UnorderedMap<any>;
//     metadata: NFTContractMetadata;

//     /*
//         initialization function (can only be called once).
//         this initializes the contract with metadata that was passed in and
//         the owner_id. 
//     */
//     protected __NEP_NFt_init({
//         owner_id, 
//         metadata = {
//             spec: "nft-1.0.0",
//             name: "NFT Tutorial Contract",
//             symbol: "GOTEAM"
//         }
//     }: { owner_id: string, metadata?: {
//         spec: string,
//         name: string,
//         symbol: string
//     } }) {
//         validateAccountId(owner_id ?? '');

//         this.owner_id = owner_id;
//         this.tokensPerOwner = new LookupMap("tokensPerOwner");
//         this.tokensById = new LookupMap("tokensById");
//         this.tokenMetadataById = new UnorderedMap("tokenMetadataById");
//         this.metadata = metadata;
//     }

// }