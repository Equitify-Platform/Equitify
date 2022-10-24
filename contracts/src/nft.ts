import NEPNft from "./NEPs/nft-contract";
import {near, call, assert, view, LookupMap} from "near-sdk-js";
import { internalTotalSupply } from "./NEPs/nft-contract/enumeration";
import { internalMint } from "./NEPs/nft-contract/mint";
import {JsonToken} from "./NEPs/nft-contract/metadata";

type TokenData = {
    tokenId: string;
    tokenURI: string;
    balance: string; // total amount of tokens to be released at the end of the vesting
    released: string; // amount of tokens released
    revoked: boolean; // whether or not the vesting has been revoked
    initialized: boolean;
    claimed: boolean;
}

export class LaunchpadJsonToken extends JsonToken {
    token_data?: TokenData;

    constructor(
        jsonToken: JsonToken,
        tokenData?: TokenData
    ) {
        super({
            approvedAccountIds: jsonToken.approved_account_ids,
            metadata: jsonToken.metadata,
            ownerId: jsonToken.owner_id,
            royalty: jsonToken.royalty,
            tokenId: jsonToken.token_id
        }) 
        this.token_data = tokenData;
    }
}


export class LaunchpadNft extends NEPNft {

    public tokenData: LookupMap<TokenData> = new LookupMap('tokenData');

    @call({})
    make_revoked({token_id}: {token_id: string}) {
        this._onlyFromOwner();
        const data = this._getTokenDataInternal({token_id});

        data.revoked = true;
        this._setTokenData({token_id, data});
    }

    @call({})
    make_claimed({token_id}: {token_id: string}) {
        this._onlyFromOwner();
        const data = this._getTokenDataInternal({token_id});

        data.claimed = true;
        this._setTokenData({token_id, data});
    }

    @call({})
    change_balance({
        _owner,
        token_id,
        _additionalAmount
    }:{
        _owner: string,
        token_id: string,
        _additionalAmount : string
    }
    ) {
        this._onlyFromOwner()
        const token = this.nft_token({ token_id });
        assert(token.owner_id === _owner, "Not owner call");

        const data = this._getTokenDataInternal({token_id});

        data.balance = (BigInt(data.balance ?? '0') + BigInt(_additionalAmount)).toString();
        this._setTokenData({ token_id, data });
    }

    @call({})
    mint_nft({ receiver_id, balance }: {receiver_id: string, balance: string}) {
        assert(near.predecessorAccountId() === this.owner_id, 'Caller not an owner');
        const token_id = internalTotalSupply({ contract: this }).toString();
        internalMint({ contract: this, tokenId: token_id, metadata: {}, receiverId: receiver_id, perpetualRoyalties: {}});

        this._setTokenData({token_id, data: {
            balance,
            claimed: false,
            initialized: true,
            released: '0',
            revoked: false,
            tokenId: token_id,
            tokenURI: ''
        }})
    }

    @view({})
    get_token_data({token_id}: {token_id: string}){
        return this._getTokenDataInternal({token_id});
    }

    private _onlyFromOwner() {
        assert(near.predecessorAccountId() == this.owner_id, "caller not a contract owner");
    }
    
    private _setTokenData({token_id, data}:{token_id: string, data: TokenData}) {
        this.tokenData.set( token_id, data);
    }

    private _getTokenDataInternal({token_id}: {token_id: string}){
        assert(this.tokenData.containsKey(token_id), 'token data doesn\'t exists')
        return this.tokenData.get(token_id);
    }
}