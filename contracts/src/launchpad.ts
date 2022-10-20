import { NearBindgen, near, call, view, initialize, UnorderedMap, LookupMap, NearPromise, assert, bytes, Bytes } from 'near-sdk-js';
import { Ownable } from './utils/contracts/ownable';
import { Callback, WithCallback } from './utils/contracts/withCallback';

export type IDOData = {
    members: bigint;
    staticMembers: bigint;
    antagonistMembers: bigint;
    dynamicMembers: bigint;
    launchpadMembers: bigint;
    totalClaimableAmount: bigint; // total amount of launched tokens to be claimable by others
    totalPurchased: bigint; // total amount of tokens already purchased
    totalBNBAmount: bigint; // total amount of raised payment token
    start: bigint; // start time of the vesting period
    cliff: bigint; // cliff duration in seconds of the cliff in which tokens will begin to vest
    duration: bigint; // duration in seconds of the period in which the tokens will vest
    totalVestingAmount: bigint; // total amount of vested tokens
    totalUnreleased: bigint; // total amount of unreleased tokens
}

export type Project = {
    projectName: string;
    projectSignatures: string;
    projectDescription: string;
    hardCap: bigint;
    softCap: bigint;
    saleStartTime: bigint;
    saleEndTime: bigint;
    price: bigint;
}

export type IDOParams = {
    _deployer: string;
    _launchedToken: string;
    _tokenFounder: string;
    _project: Project;
    _nft: string;
    _staking: string;
}


// deprecated
// enum LaunchpadCallbacks {
//     SET_TOTAL_CLAIMABLE_AMOUNT = '_set_totalClaimableAmount_on_balance_of_private_callback',
//     CLAIM_VESTED_TOKENS_GET_NFT_STRUCT = '_claim_vested_tokens_on_nft_struct_private_callback',
//     PURCHASE_TOKENS_GET_OWNER = '_purchase_tokens_on_get_owner_private_callback',
//     PURCHASE_TOKENS_NFT_CHANGE = '_purchase_tokens_on_nft_change_private_callback',
// }


@NearBindgen({ requireInit: true })
class Launchpad extends Ownable {

    public nft: string= '';

    public project: Project;
    public idoData: IDOData;

    public tokenFounder: string= ''; // the owner of the launched token

    public token: string = ''; // address of the token to be launched

    _revocable: boolean = false; // whether or not the vesting is revocable
    _allowRefund: boolean = false; // whether or not the refund is allowed

    public fundRaisedBalance: Record<string, bigint> = {};

    public tokensBought: Record<string, bigint> = {};

    /* Analog of solidity modifiers. Just a private view functions */
    @view({ privateFunction: true })
    onlyInitialized() {
        if (this.idoData.totalClaimableAmount > 0) return;
        throw "PP: 0";
    }

    @view({ privateFunction: true })
    onlyIfSaleEnded() {
        assert((this.project.saleEndTime > 0) && (this.project.saleEndTime < near.blockTimestamp()), "PP: 1")
    }

    constructor() {
        super();

        this.idoData = {
            antagonistMembers: BigInt(0),
            cliff: BigInt(0),
            duration: BigInt(0),
            dynamicMembers: BigInt(0),
            members: BigInt(0),
            launchpadMembers: BigInt(0),
            start: BigInt(0),
            staticMembers: BigInt(0),
            totalBNBAmount: BigInt(0),
            totalClaimableAmount: BigInt(0),
            totalPurchased: BigInt(0),
            totalUnreleased: BigInt(0),
            totalVestingAmount: BigInt(0)
        }

        this.project = {
            hardCap: BigInt(0),
            price: BigInt(0),
            saleEndTime: BigInt(0),
            saleStartTime: BigInt(0),
            softCap: BigInt(0),
            projectDescription: '',
            projectName: '',
            projectSignatures: ''
        }

    }

    @initialize({})
    init(_params: IDOParams) {
        this.__Ownable_init();

        assert(_params._project.hardCap >= _params._project.softCap, "PP: 6");
        assert(
            (_params._project.saleStartTime >= 0) &&
            (_params._project.saleStartTime < _params._project.saleEndTime),
            "PP: 7"
        );
        assert(_params._project.price > 0, "PP: 8");

        this.token = _params._launchedToken;
        this.tokenFounder = _params._tokenFounder;
        this.project = _params._project;

        this.nft = _params._nft;
        this.transferOwnership({ to: _params._deployer });

        this._getBalanceOfContract({
            of: near.currentAccountId(), callback: {
                function: this._set_totalClaimableAmount_on_balance_of_private_callback.name
            }
        })
    }

    @call({ payableFunction: true })
    purchaseTokens({ _beneficiary, _id }: { _beneficiary: string, _id: bigint }) {
        this.onlyInitialized()

        assert(
            (near.blockTimestamp() > this.project.saleStartTime) &&
            (near.blockTimestamp() < this.project.saleEndTime),
            "PP: 12"
        );

        const tokenAmount = near.attachedDeposit() * this.project.price;

        assert(
            this.idoData.totalBNBAmount + near.attachedDeposit() <= this.project.hardCap,
            "PP: 14"
        );

        this.fundRaisedBalance[near.predecessorAccountId()] += near.attachedDeposit();

        this.tokensBought[_beneficiary] += tokenAmount;

        this._nftGetOwner({ id: _id, callback: { function: this._purchase_tokens_on_get_owner_private_callback.name } });
    }

    // Releases claim for the launched token to the beneficiary
    @call({})
    claimVestedTokens({ _beneficiary, _id }: { _beneficiary: string, _id: bigint }) {
        this.onlyInitialized()

        this._getNftStruct({
            beneficiary: _beneficiary, id: _id, callback: {
                function: this._claim_vested_tokens_on_nft_struct_private_callback.name
            }
        })
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

        const balanceBNB = near.accountBalance();
        NearPromise.new(_recipient).transfer(balanceBNB)
    }

    // Withdraws not sold launched tokens back
    @call({})
    withdrawNotSoldTokens({ _recipient }: { _recipient: string }) {
        this.onlyIfSaleEnded();

        assert(near.predecessorAccountId() === this.tokenFounder, "PP: 26");

        const notSold = this.idoData.totalClaimableAmount - this.idoData.totalPurchased;
        this.idoData.totalClaimableAmount = BigInt(0);

        this._transferTokens({ to: _recipient, amount: notSold })
    }

    // Withdraw unreleased launched tokens after revoke or in case emergency
    @call({})
    withdrawTokens({ _recipient, _amount }: { _recipient: string, _amount: bigint }) {
        assert(near.blockTimestamp() > this.idoData.cliff, "PP: 28");
        assert(
            near.predecessorAccountId() === this.tokenFounder || near.predecessorAccountId() == this.owner(),
            "PP: 29"
        );

        this.idoData.totalUnreleased -= _amount;
        // how to transfer tokens?

        this._transferTokens({ to: _recipient, amount: _amount })
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
            this.idoData.totalBNBAmount < this.project.softCap,
            "Launchpad: token vesting is launched"
        );

        assert(this._allowRefund, "Launchpad: refund is not allowed");
        const amountBNB = this.fundRaisedBalance[near.predecessorAccountId()];
        assert(amountBNB > 0, "Launchpad: no funds to refund");
        this.idoData.totalBNBAmount -= amountBNB;
        this.fundRaisedBalance[near.predecessorAccountId()] = BigInt(0);

        NearPromise.new(near.predecessorAccountId()).transfer(amountBNB)
    }

    @view({})
    getLatestPrice() {
        // TODO
        return BigInt('1');
    }

    @call({ privateFunction: true })
    _getBalanceOfContract({ of, callback }: { of: string, callback?: Callback }) {
        const promise = near.promiseBatchCreate(this.token);

        near.promiseBatchActionFunctionCall(
            promise,
            'balance_of', // TODO
            bytes(JSON.stringify({ of })),
            0,
            30000000000000
        );


        if (callback)
            this._execute_callback_private({
                promise,
                callback,
            })
    }

    @call({ privateFunction: true })
    _transferTokens({ to, amount, callback }: { to: string, amount: bigint, callback?: Callback }) {
        const promise = near.promiseBatchCreate(this.token);

        near.promiseBatchActionFunctionCall(
            promise,
            'transfer', // TODO
            bytes(JSON.stringify({})),
            0,
            30000000000000
        );


        if (callback)
            this._execute_callback_private({
                promise,
                callback,
            })
    }

    @call({ privateFunction: true })
    _getNftStruct({ beneficiary, id, callback }: { beneficiary: string, id: bigint, callback?: Callback }) {
        const promise = near.promiseBatchCreate(this.nft);

        near.promiseBatchActionFunctionCall(
            promise,
            'get_struct', // TODO
            bytes(JSON.stringify({ beneficiary, id })),
            0,
            30000000000000
        );

        if (callback)
            this._execute_callback_private({
                promise,
                callback,
            })
    }

    @call({ privateFunction: true })
    _nftMakeClaimed({ id, callback }: { id: bigint, callback?: Callback }) {
        const promise = near.promiseBatchCreate(this.nft);

        near.promiseBatchActionFunctionCall(
            promise,
            'make_claimed', // TODO
            bytes(JSON.stringify({ id })),
            0,
            30000000000000
        );

        if (callback)
            this._execute_callback_private({
                promise,
                callback,
            })
    }

    @call({ privateFunction: true })
    _nftGetOwner({ id, callback }: { id: bigint, callback?: Callback }) {
        const promise = near.promiseBatchCreate(this.nft);

        near.promiseBatchActionFunctionCall(
            promise,
            'get_owner', // TODO
            bytes(JSON.stringify({ id })),
            0,
            30000000000000
        );

        if (callback)
            this._execute_callback_private({
                promise,
                callback,
            })
    }

    @call({ privateFunction: true })
    _nftChangeData({ id, beneficiary, tokenAmount, attachedDeposit, callback }: { id: bigint, beneficiary: string, tokenAmount: bigint, attachedDeposit: bigint, callback?: Callback }) {
        const promise = near.promiseBatchCreate(this.nft);

        near.promiseBatchActionFunctionCall(
            promise,
            'change_data', // TODO
            bytes(JSON.stringify({ beneficiary, id, tokenAmount })),
            0,
            30000000000000
        );


        if (callback)
            this._execute_callback_private({
                promise,
                callback,
            })
    }


    @call({ privateFunction: true })
    _nftMintToken({ beneficiary, tokenAmount, callback }: { beneficiary: string, tokenAmount: bigint, callback?: Callback }) {
        const promise = near.promiseBatchCreate(this.nft);

        near.promiseBatchActionFunctionCall(
            promise,
            'mint_token', // TODO
            bytes(JSON.stringify({ beneficiary, tokenAmount })),
            0,
            30000000000000
        );


        if (callback)
            this._execute_callback_private({
                promise,
                callback,
            })
    }

    @call({ privateFunction: true })
    _set_totalClaimableAmount_on_balance_of_private_callback() {
        near.log(`_set_totalClaimableAmount_on_balance_of_private_callback callback`);

        const balance = JSON.parse(near.promiseResult(0)) as bigint;
        this.idoData.totalClaimableAmount = balance;

        assert(this.idoData.totalClaimableAmount > 0, "PP: 9");
    }

    @call({ privateFunction: true })
    _claim_vested_tokens_on_nft_struct_private_callback({ beneficiary, id }: { beneficiary: string, id: bigint }) {
        near.log(`_claim_vested_tokens_on_nft_struct_private_callback callback`);

        type NftGetStructResponse = {
            balance: bigint,
            claimed: boolean,
            initialized: boolean,
            revoked: boolean
        }

        const struct = JSON.parse(near.promiseResult(0)) as NftGetStructResponse;


        assert(struct.initialized && !struct.revoked, "")



        const balance = struct.balance;
        const isBeneficiary = near.predecessorAccountId() === beneficiary;
        const isOwner = near.predecessorAccountId() == this.owner();

        assert(
            struct.claimed == false,
            "Already claimed"
        );

        assert(isBeneficiary || isOwner, "PP: 21");

        this.idoData.totalVestingAmount = this.idoData.totalVestingAmount + balance;

        this._transferTokens({ to: beneficiary, amount: balance })

        this._nftMakeClaimed({ id });
    }

    @call({ privateFunction: true })
    _purchase_tokens_on_get_owner_private_callback({ id, beneficiary, tokenAmount, attachedDeposit }: { id: bigint, beneficiary: string, tokenAmount: bigint, attachedDeposit: bigint }) {
        near.log(`_purchase_tokens_on_get_owner_private_callback callback`);

        const owner = near.promiseResult(0);

        if (id != BigInt(0) && owner === beneficiary) {
            this._nftChangeData({ beneficiary, id, tokenAmount, attachedDeposit, callback: { function: this._purchase_tokens_on_nft_change_private_callback.name } });
        } else {
            this._nftMintToken({ beneficiary, tokenAmount, callback: { function: this._purchase_tokens_on_nft_change_private_callback.name } });
        }
    }

    @call({ privateFunction: true })
    _purchase_tokens_on_nft_change_private_callback({ tokenAmount, attachedDeposit }: { tokenAmount: bigint, attachedDeposit: bigint }) {
        near.log(`_purchase_tokens_on_nft_change_private_callback callback`);

        this.idoData.totalPurchased += tokenAmount;
        this.idoData.totalBNBAmount += attachedDeposit;

        assert(
            this.idoData.totalPurchased <= this.idoData.totalClaimableAmount,
            "PP: 15"
        );
    }
}
