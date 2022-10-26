import { near, call, assert, view, LookupMap, initialize, NearBindgen, UnorderedMap, validateAccountId } from "near-sdk-js";
import { internalNftMetadata, JsonToken, NFTContractMetadata } from "./NEPs/nft-contract/metadata";
import { log } from "./utils";
import { internalMint } from './NEPs/nft-contract/mint';
import { internalNftTokens, internalSupplyForOwner, internalTokensForOwner, internalTotalSupply } from './NEPs/nft-contract/enumeration';
import { internalNftToken, internalNftTransfer, internalNftTransferCall, internalResolveTransfer } from './NEPs/nft-contract/nft_core';
import { internalNftApprove, internalNftIsApproved, internalNftRevoke, internalNftRevokeAll } from './NEPs/nft-contract/approval';
import { internalNftPayout, internalNftTransferPayout } from './NEPs/nft-contract/royalty';

type TokenData = {
    tokenId: string;
    tokenURI: string;
    balance: string; // total amount of tokens to be released at the end of the vesting
    released: string; // amount of tokens released
    revoked: boolean; // whether or not the vesting has been revoked
    initialized: boolean;
    claimed: boolean;
}

export class LaunchpadJsonToken {
    token_data?: TokenData;
    token?: JsonToken
    constructor(
        jsonToken?: JsonToken,
        tokenData?: TokenData
    ) {
        this.token = jsonToken;
        this.token_data = tokenData;
    }
}


@NearBindgen({ requireInit: true })
export class LaunchpadNft {
    public owner_id: string = '';
    public tokensPerOwner: LookupMap<any> = new LookupMap("tokensPerOwner");
    public tokensById: LookupMap<any> = new LookupMap("tokensById");;
    public tokenMetadataById: UnorderedMap<any> = new UnorderedMap("tokenMetadataById");
    public metadata: NFTContractMetadata;

    public tokenData: LookupMap<TokenData> = new LookupMap('tokenData');


    @initialize({})
    init({
        owner_id,
        metadata = {
            spec: "nft-1.0.0",
            name: "NFT Tutorial Contract",
            symbol: "GOTEAM"
        }
    }: {
        owner_id: string, metadata?: {
            spec: string,
            name: string,
            symbol: string
        }
    }) {
        log('Init nft', owner_id)
        validateAccountId(owner_id ?? '');

        this.owner_id = owner_id;

        this.metadata = metadata;

        log('Init nft res', this.owner_id)

    }

    @call({})
    make_revoked({ token_id }: { token_id: string }) {
        this._onlyFromOwner();
        const data = this._getTokenDataInternal({ token_id });

        data.revoked = true;
        this._setTokenData({ token_id, data });
    }

    @call({})
    make_claimed({ token_id }: { token_id: string }) {
        log('make_claimed', token_id)
        this._onlyFromOwner();
        const data = this._getTokenDataInternal({ token_id });

        data.claimed = true;
        this._setTokenData({ token_id, data });
    }

    @call({})
    change_balance({
        owner_id,
        token_id,
        increase_amount
    }: {
        owner_id: string,
        token_id: string,
        increase_amount: string
    }
    ) {
        this._onlyFromOwner()
        const token = this.nft_token({ token_id });
        assert(token.owner_id === owner_id, "Not owner call");

        const data = this._getTokenDataInternal({ token_id });

        data.balance = (BigInt(data.balance ?? '0') + BigInt(increase_amount)).toString();
        this._setTokenData({ token_id, data });

        log(`Balance changed on ${token_id} to ${data.balance}`);
    }

    @call({ payableFunction: true })
    mint_token({ receiver_id, balance }: { receiver_id: string, balance: string }) {
        log(`Start minting`);

        log(`${near.predecessorAccountId()}, ${this.owner_id}`);

        this._onlyFromOwner();

        log(`Assert`);

        let token_id: string;

        try {
            token_id = (internalTotalSupply({ contract: this }) + 1).toString();
        } catch {
            log('tts error, set tokenId to 0')
            token_id = '1'
        }

        log(`Token id`, token_id);

        internalMint({ contract: this, tokenId: token_id, metadata: {}, receiverId: receiver_id, perpetualRoyalties: null });
        log(`Internal minted`);

        this._setTokenData({
            token_id, data: {
                balance,
                claimed: false,
                initialized: true,
                released: '0',
                revoked: false,
                tokenId: token_id,
                tokenURI: ''
            }
        })

        log(`Token ${token_id} minted to ${receiver_id}`);
    }

    @view({})
    get_token_data({ token_id }: { token_id: string }) {
        log(`Get token data`, token_id);


        return new LaunchpadJsonToken(this.nft_token({ token_id }),
            this.tokenData.containsKey(token_id) ?
                this.tokenData.get(token_id) :
                undefined
        );
    }

    @view({})
    nft_tokens_detailed_for_owner({ account_id, from_index, limit }: { account_id: string, from_index?: string, limit?: number }) {
        const tokens = internalTokensForOwner({ contract: this, accountId: account_id, fromIndex: from_index, limit: limit });
        return this._tokensToDetailed({tokens})
    }

    @view({})
    nft_tokens_detailed({ from_index, limit }) {
        const tokens = internalNftTokens({ contract: this, fromIndex: from_index, limit: limit });
        return this._tokensToDetailed({tokens})
    }

    /*
    MINT
*/
    @call({})
    nft_mint({ token_id, metadata, receiver_id, perpetual_royalties }) {
        assert(false, 'nft_mint is not available')
        // assert(near.predecessorAccountId() === this.owner_id, 'Caller not an owner');
        // return internalMint({ contract: this, tokenId: token_id, metadata: metadata, receiverId: receiver_id, perpetualRoyalties: perpetual_royalties });
    }

    /*
        CORE
    */
    @view({})
    //get the information for a specific token ID
    nft_token({ token_id }) {
        return internalNftToken({ contract: this, tokenId: token_id });
    }

    @call({})
    //implementation of the nft_transfer method. This transfers the NFT from the current owner to the receiver. 
    nft_transfer({ receiver_id, token_id, approval_id, memo }) {
        return internalNftTransfer({ contract: this, receiverId: receiver_id, tokenId: token_id, approvalId: approval_id, memo: memo });
    }

    @call({})
    //implementation of the transfer call method. This will transfer the NFT and call a method on the receiver_id contract
    nft_transfer_call({ receiver_id, token_id, approval_id, memo, msg }) {
        return internalNftTransferCall({ contract: this, receiverId: receiver_id, tokenId: token_id, approvalId: approval_id, memo: memo, msg: msg });
    }

    @call({})
    //resolves the cross contract call when calling nft_on_transfer in the nft_transfer_call method
    //returns true if the token was successfully transferred to the receiver_id
    nft_resolve_transfer({ authorized_id, owner_id, receiver_id, token_id, approved_account_ids, memo }) {
        return internalResolveTransfer({ contract: this, authorizedId: authorized_id, ownerId: owner_id, receiverId: receiver_id, tokenId: token_id, approvedAccountIds: approved_account_ids, memo: memo });
    }

    /*
        APPROVALS
    */
    @view({})
    //check if the passed in account has access to approve the token ID
    nft_is_approved({ token_id, approved_account_id, approval_id }) {
        return internalNftIsApproved({ contract: this, tokenId: token_id, approvedAccountId: approved_account_id, approvalId: approval_id });
    }

    @call({})
    //approve an account ID to transfer a token on your behalf
    nft_approve({ token_id, account_id, msg }) {
        return internalNftApprove({ contract: this, tokenId: token_id, accountId: account_id, msg: msg });
    }

    /*
        ROYALTY
    */
    @view({})
    //calculates the payout for a token given the passed in balance. This is a view method
    nft_payout({ token_id, balance, max_len_payout }) {
        return internalNftPayout({ contract: this, tokenId: token_id, balance: balance, maxLenPayout: max_len_payout });
    }

    @call({})
    //transfers the token to the receiver ID and returns the payout object that should be payed given the passed in balance. 
    nft_transfer_payout({ receiver_id, token_id, approval_id, memo, balance, max_len_payout }) {
        return internalNftTransferPayout({ contract: this, receiverId: receiver_id, tokenId: token_id, approvalId: approval_id, memo: memo, balance: balance, maxLenPayout: max_len_payout });
    }

    @call({})
    //approve an account ID to transfer a token on your behalf
    nft_revoke({ token_id, account_id }) {
        return internalNftRevoke({ contract: this, tokenId: token_id, accountId: account_id });
    }

    @call({})
    //approve an account ID to transfer a token on your behalf
    nft_revoke_all({ token_id }) {
        return internalNftRevokeAll({ contract: this, tokenId: token_id });
    }

    /*
        ENUMERATION
    */
    //Query for the total supply of NFTs on the contract
    @view({})
    nft_total_supply() {
        return internalTotalSupply({ contract: this });
    }

    @view({})
    //Query for nft tokens on the contract regardless of the owner using pagination
    nft_tokens({ from_index, limit }) {
        return internalNftTokens({ contract: this, fromIndex: from_index, limit: limit });
    }

    //get the total supply of NFTs for a given owner
    @view({})
    nft_tokens_for_owner({ account_id, from_index, limit }: { account_id: string, from_index?: string, limit?: number }) {
        return internalTokensForOwner({ contract: this, accountId: account_id, fromIndex: from_index, limit: limit });
    }

    @view({})
    //Query for all the tokens for an owner
    nft_supply_for_owner({ account_id }) {
        return internalSupplyForOwner({ contract: this, accountId: account_id });
    }

    /*
        METADATA
    */
    @view({})
    //Query for all the tokens for an owner
    nft_metadata() {
        return internalNftMetadata({ contract: this });
    }

    private _onlyFromOwner() {
        assert(near.predecessorAccountId() == this.owner_id, "caller not a contract owner");
    }

    private _setTokenData({ token_id, data }: { token_id: string, data: TokenData }) {
        this.tokenData.set(token_id, data);
    }

    private _getTokenDataInternal({ token_id }: { token_id: string }) {
        assert(this.tokenData.containsKey(token_id), 'token data doesn\'t exists')
        return this.tokenData.get(token_id);
    }

    private _tokensToDetailed({tokens}: {tokens: JsonToken[]}) {
        return tokens.map(v => new LaunchpadJsonToken(v, this._getTokenDataInternal({ token_id: v.token_id })))
    }
}