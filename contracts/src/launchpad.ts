import { NearBindgen, near, call, view, initialize, UnorderedMap, LookupMap, NearPromise, assert, bytes, Bytes, validateAccountId } from 'near-sdk-js';
import { AccountId } from 'near-sdk-js/lib/types';
import { LaunchpadJsonToken } from './nft';
import { log, parseTGas, promiseResult } from './utils';
import { Ownable } from './utils/contracts/ownable';
import { PromiseCall, WithCallback } from './utils/contracts/withCallback';
import { NO_DEPOSIT } from './utils/contracts/withCallback';

export type IDOData = {
    members: string;
    staticMembers: string;
    antagonistMembers: string;
    dynamicMembers: string;
    launchpadMembers: string;
    totalClaimableAmount: string; // total amount of launched tokens to be claimable by others
    totalPurchased: string; // total amount of tokens already purchased
    totalNearAmount: string; // total amount of raised payment token
    start: string; // start time of the vesting period
    cliff: string; // cliff duration in seconds of the cliff in which tokens will begin to vest
    duration: string; // duration in seconds of the period in which the tokens will vest
    totalVestingAmount: string; // total amount of vested tokens
    totalUnreleased: string; // total amount of unreleased tokens
}

export type Project = {
    hardCap: string;
    softCap: string;
    saleStartTime: string;
    saleEndTime: string;
    price: string;
}

export type IDOParams = {
    _deployer: string;
    _launchedToken: string;
    _tokenFounder: string;
    _project: Project;
    _nft: string;
}

// deprecated
// enum LaunchpadCallbacks {
//     SET_TOTAL_CLAIMABLE_AMOUNT = '_set_totalClaimableAmount_on_balance_of_private_callback',
//     CLAIM_VESTED_TOKENS_GET_NFT_STRUCT = '_claim_vested_tokens_on_nft_struct_private_callback',
//     PURCHASE_TOKENS_GET_OWNER = '_purchase_tokens_on_get_owner_private_callback',
//     PURCHASE_TOKENS_NFT_CHANGE = '_purchase_tokens_on_nft_change_private_callback',
// }


@NearBindgen({ requireInit: false })
class Launchpad extends Ownable {

    public nft: AccountId = '';

    public project: Project;
    public idoData: IDOData;

    public tokenFounder: AccountId = ''; // the owner of the launched token

    public token: AccountId = ''; // address of the token to be launched

    _revocable: boolean = false; // whether or not the vesting is revocable
    _allowRefund: boolean = false; // whether or not the refund is allowed

    public fundRaisedBalance: LookupMap<bigint> = new LookupMap('fundRaisedBalance');

    public tokensBought: LookupMap<bigint> = new LookupMap('tokensBought');
    public tokenTransferedUnused: LookupMap<bigint> = new LookupMap('tokenTransferedUnused');

    private onlyInitialized() {
        assert(BigInt(this.idoData.totalClaimableAmount) > 0, "PP: 0")
    }

    private onlyIfSaleEnded() {
        assert((BigInt(this.project.saleEndTime) > 0) && (BigInt(this.project.saleEndTime) < near.blockTimestamp()), "PP: 1")
    }

    constructor() {
        super();

        this.idoData = {
            antagonistMembers: '0',
            cliff: '0',
            duration: '0',
            dynamicMembers: '0',
            members: '0',
            launchpadMembers: '0',
            start: '0',
            staticMembers: '0',
            totalNearAmount: '0',
            totalClaimableAmount: '0',
            totalPurchased: '0',
            totalUnreleased: '0',
            totalVestingAmount: '0'
        }

        this.project = {
            hardCap: '0',
            price: '0',
            saleEndTime: '0',
            saleStartTime: '0',
            softCap: '0',
        }

    }

    @initialize({})
    init(_params: IDOParams) {
        this.__Ownable_init();
        assert(validateAccountId(_params._launchedToken), "Invalid launched token");
        assert(BigInt(_params._project.hardCap) >= BigInt(_params._project.softCap), "PP: 6");
        assert(
            (BigInt(_params._project.saleStartTime) >= 0) &&
            (BigInt(_params._project.saleStartTime) < BigInt(_params._project.saleEndTime)),
            "PP: 7"
        );
        assert(BigInt(_params._project.price) > 0, "PP: 8");

        this.token = _params._launchedToken;
        this.tokenFounder = _params._tokenFounder;
        this.project = _params._project;

        this.nft = _params._nft;
        this.transferOwnership({ to: _params._deployer });

        log('init storage check', JSON.stringify({
            token: this.token,
            founder: this.tokenFounder,
            project: this.project,
            nft: this.nft,
            owner: this.owner()
        }));

        log('call _getBalanceOfContract');

        return this._getBalanceOfContract({
            account_id: near.currentAccountId(),
            callback: {
                function: '_set_totalClaimableAmount_on_balance_of_private_callback',
                gas: parseTGas(30)
            }
        }).asReturn();
    }

    @call({ payableFunction: true })
    purchaseTokens({ beneficiary, token_id }: { beneficiary: string, token_id: string }) {
        this.onlyInitialized()

        assert(
            (near.blockTimestamp() > BigInt(this.project.saleStartTime)) &&
            (near.blockTimestamp() < BigInt(this.project.saleEndTime)),
            "PP: 12"
        )

        const tokenAmount = near.attachedDeposit() * BigInt(this.project.price);

        assert(
            BigInt(this.idoData.totalNearAmount) + near.attachedDeposit() <= BigInt(this.project.hardCap),
            "PP: 14"
        );

        this._internalFundRaisedBalanceSet(
            near.predecessorAccountId(),
            this._fundRaisedBalanceGet(near.predecessorAccountId() + near.attachedDeposit())
        );

        this._internalTokensBoughtSet(
            beneficiary,
            this._tokensBoughtGet(beneficiary) + tokenAmount
        )

        return this._getTokenData({
            token_id,
            callback: {
                function: '_purchase_tokens_on_get_owner_private_callback',
                args: JSON.stringify({
                    id: token_id,
                    beneficiary,
                    tokenAmount: tokenAmount.toString(),
                    attachedDeposit: near.attachedDeposit().toString()
                }),
                gas: parseTGas(100)
            }
        }).asReturn();
    }

    // Releases claim for the launched token to the beneficiary
    @call({})
    claimVestedTokens({ beneficiary, token_id }: { beneficiary: string, token_id: string }) {
        this.onlyInitialized()

        return this._getTokenData({
            token_id,
            callback: {
                function: '_claim_vested_tokens_on_nft_struct_private_callback',
                args: JSON.stringify({
                    original_predecessor: near.predecessorAccountId(), 
                    beneficiary,
                    id: token_id
                }),
                gas: parseTGas(100)
            }
        }).asReturn()
    }

    // Withdraws payment token
    @call({})
    withdrawFunds({ _recipient }: { _recipient: string }) {
        this.onlyIfSaleEnded();
        const isRecipient = near.predecessorAccountId() === this.tokenFounder;
        const isOwner = near.predecessorAccountId() == this.owner();

        assert(
            isRecipient || isOwner,
            "Launchpad: only tokenFounder or owner can withdraw funds"
        );

        const balanceNear = near.accountBalance();
        return NearPromise.new(_recipient).transfer(balanceNear).asReturn()
    }

    // Withdraws not sold launched tokens back
    @call({})
    withdrawNotSoldTokens({ _recipient }: { _recipient: string }) {
        this.onlyIfSaleEnded();

        assert(near.predecessorAccountId() === this.tokenFounder, "PP: 26");

        const notSold = BigInt(this.idoData.totalClaimableAmount) - BigInt(this.idoData.totalPurchased);
        this.idoData.totalClaimableAmount = '0';

        return this._transferTokens({ receiver_id: _recipient, amount: notSold.toString() }).asReturn()
    }

    // Withdraw unreleased launched tokens after revoke or in case emergency
    @call({})
    withdrawTokens({ _recipient, _amount }: { _recipient: string, _amount: bigint }) {
        assert(near.blockTimestamp() > BigInt(this.idoData.cliff), "PP: 28");
        assert(
            near.predecessorAccountId() === this.tokenFounder || near.predecessorAccountId() == this.owner(),
            "PP: 29"
        );

        this.idoData.totalUnreleased = (BigInt(this.idoData.totalUnreleased) - _amount).toString();

        return this._transferTokens({ receiver_id: _recipient, amount: _amount.toString() }).asReturn()
    }

    @call({})
    enableRefund() {
        assert(!this._allowRefund, "PP: 33");
        this._allowRefund = true;
    }

    @call({})
    refund() {
        this.onlyIfSaleEnded();

        assert(
            this.idoData.totalNearAmount < this.project.softCap,
            "Launchpad: token vesting is launched"
        );

        assert(this._allowRefund, "Launchpad: refund is not allowed");
        const amountNear = this._fundRaisedBalanceGet(near.predecessorAccountId());
        assert(amountNear > 0, "Launchpad: no funds to refund");
        this.idoData.totalNearAmount = (BigInt(this.idoData.totalNearAmount) - amountNear).toString();
        this._internalFundRaisedBalanceSet(near.predecessorAccountId(), BigInt(0));

        return NearPromise.new(near.predecessorAccountId()).transfer(amountNear).asReturn()
    }

    @view({})
    getIdoData() {
        return this.idoData;
    }


    @view({})
    _fundRaisedBalanceGet(accountId: string) {
        if (this.fundRaisedBalance.containsKey(accountId))
            return this.fundRaisedBalance.get(accountId);
        return BigInt(0);
    }

    private _internalFundRaisedBalanceSet(accountId: string, value: bigint) {
        this.fundRaisedBalance.set(accountId, value);
    }

    @view({})
    _tokensBoughtGet(accountId: string) {
        if (this.tokensBought.containsKey(accountId))
            return this.tokensBought.get(accountId);
        return BigInt(0);
    }

    private _internalTokensBoughtSet(accountId: string, value: bigint) {
        this.tokensBought.set(accountId, value);
    }

    @view({})
    _tokensTransferedGet(accountId: string) {
        if (this.tokenTransferedUnused.containsKey(accountId))
            return this.tokenTransferedUnused.get(accountId);
        return BigInt(0);
    }

    _internalTokensTransferedSet(accountId: string, value: bigint) {
        this.tokenTransferedUnused.set(accountId, value);
    }

    // @call({ privateFunction: true })
    private _getBalanceOfContract({ account_id, callback }: { account_id: string, callback?: PromiseCall }) {
        return this._executePromise({
            call: {
                accountId: this.token,
                function: 'ft_balance_of',
                args: JSON.stringify({ account_id }),
                gas: parseTGas(30)
            },
            callback
        })
    }

    private _transferTokens({ receiver_id, amount, callback }: { receiver_id: string, amount: string, callback?: PromiseCall }) {
        return this._executePromise({
            call: {
                accountId: this.token,
                function: 'ft_transfer',
                args: JSON.stringify({ receiver_id, amount, memo: '' }),
                deposit: BigInt(1),
                gas: parseTGas(30)
            },
            callback
        })
    }

    private _getTokenData({ token_id, callback }: { token_id: string, callback?: PromiseCall }) {
        log('Token Id: ', token_id)
        return this._executePromise({
            call: {
                accountId: this.nft,
                function: 'get_token_data',
                args: JSON.stringify({ token_id }),
                gas: parseTGas(100)
            },
            callback
        })
    }

    private _nftMakeClaimed({ id, callback }: { id: string, callback?: PromiseCall }) {
        return this._executePromise({
            call: {
                accountId: this.nft,
                function: 'make_claimed',
                args: JSON.stringify({ token_id: id }),
                gas: parseTGas(30)
            },
            callback
        })
    }

    @call({ privateFunction: true })
    _nftGetOwner({ id, callback }: { id: string, callback?: PromiseCall }) {
        return this._executePromise({
            call: {
                accountId: this.nft,
                function: 'get_owner',
                args: JSON.stringify({ id }),
                gas: parseTGas(30)
            },
            callback
        })
    }

    @call({ privateFunction: true })
    _nftChangeData({ token_id, beneficiary, increase_amount, callback }: { token_id: string, beneficiary: string, increase_amount: string, callback?: PromiseCall }) {
        return this._executePromise({
            call: {
                accountId: this.nft,
                function: 'change_balance',
                args: JSON.stringify({ owner_id: beneficiary, token_id, increase_amount }),
                gas: parseTGas(30)
            },
            callback
        })
    }


    @call({ privateFunction: true })
    _nftMintToken({ beneficiary, tokenAmount, callback }: { beneficiary: string, tokenAmount: string, callback?: PromiseCall }) {
        return this._executePromise({
            call: {
                accountId: this.nft,
                function: 'mint_token',
                args: JSON.stringify({ receiver_id: beneficiary, balance: tokenAmount }),
                deposit: BigInt('7000000000000000000000')
                // gas: parseTGas(60)
            },
            callback
        })
    }

    @call({ privateFunction: true })
    _set_totalClaimableAmount_on_balance_of_private_callback() {
        near.log(`_set_totalClaimableAmount_on_balance_of_private_callback callback`);

        let { result, success } = promiseResult()

        log('callback', result); 
        assert(success, "PromiseCall !success")

        const balance = JSON.parse(result);

        this.idoData.totalClaimableAmount = balance;

        assert(BigInt(this.idoData.totalClaimableAmount) > 0, "PP: 9");
    }

    @call({ privateFunction: true })
    _claim_vested_tokens_on_nft_struct_private_callback({ original_predecessor, beneficiary, id }: { original_predecessor:string, beneficiary: string, id: string }) {
        near.log(`_claim_vested_tokens_on_nft_struct_private_callback callback`);

        const { result, success } = promiseResult();

        assert(success, 'Call is not successful')
        const tokenData = JSON.parse(result) as LaunchpadJsonToken;

        assert(tokenData && tokenData.token_data && tokenData.token_data.initialized && !tokenData.token_data.revoked, "invalid token data");

        const balance = tokenData.token_data.balance;
        const isBeneficiary = original_predecessor === beneficiary;
        const isOwner = original_predecessor == this.owner();

        assert(
            tokenData.token_data.claimed == false,
            "Already claimed"
        );

        log({
            original_predecessor, 
            beneficiary,
            isOwner,
            isBeneficiary,
            balance
        })
        assert(isBeneficiary || isOwner, "PP: 21");

        this.idoData.totalVestingAmount = (BigInt(this.idoData.totalVestingAmount) + BigInt(balance)).toString();

        return this._transferTokens({ receiver_id: beneficiary, amount: balance }).then(
            this._nftMakeClaimed({ id })
        ).asReturn()
    }

    @call({ privateFunction: true })
    _purchase_tokens_on_get_owner_private_callback({ id, beneficiary, tokenAmount, attachedDeposit }: { id: string, beneficiary: string, tokenAmount: string, attachedDeposit: string }) {
        near.log(`_purchase_tokens_on_get_owner_private_callback callback`);

        const { result, success } = promiseResult();

        const tokenData = JSON.parse(result) as LaunchpadJsonToken;

        log('success: ', JSON.stringify(tokenData));

        if (id && BigInt(id) != BigInt(0) && tokenData && tokenData.token &&  tokenData.token.owner_id === beneficiary)
            return this._nftChangeData({ beneficiary, token_id: id, increase_amount: tokenAmount, callback: { function: '_purchase_tokens_on_nft_change_private_callback' } });

        log('not success, mint token');

        return this._nftMintToken({
            beneficiary,
            tokenAmount,
            callback: {
                function: '_purchase_tokens_on_nft_change_private_callback',
                args: JSON.stringify({ attachedDeposit, tokenAmount }),
                // gas: parseTGas(100)
            }
        });
    }

    @call({ privateFunction: false })
    _purchase_tokens_on_nft_change_private_callback({ tokenAmount, attachedDeposit }: { tokenAmount: string, attachedDeposit: string }) {
        near.log(`_purchase_tokens_on_nft_change_private_callback callback`);
        const { result, success } = promiseResult();

        assert(success, 'callback is not successful')
        
        this.idoData.totalPurchased = (BigInt(this.idoData.totalPurchased) + BigInt(tokenAmount)).toString();
        this.idoData.totalNearAmount += (BigInt(this.idoData.totalNearAmount) + BigInt(attachedDeposit)).toString();

        assert(
            BigInt(this.idoData.totalPurchased) <= BigInt(this.idoData.totalClaimableAmount),
            "PP: 15"
        );
    }

    @call({})
    ft_on_transfer({
        sender_id,
        amount,
        msg,
        receiver_id,
    }: {
        sender_id: string;
        amount: string;
        msg: string;
        receiver_id: string;
    }) {
        if (this.tokenTransferedUnused)
            this.tokenTransferedUnused
        log(`[${amount} from ${sender_id} to ${receiver_id}] ${msg}`);

        this._internalTokensTransferedSet(
            sender_id,
            this._tokensTransferedGet(sender_id) + BigInt(amount)
        );
    }


}
