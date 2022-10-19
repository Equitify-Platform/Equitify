import { NearBindgen, near, call, view, initialize, UnorderedMap, LookupMap } from 'near-sdk-js';
import { require } from './utils';

type IDOData = {
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

type Project = {
    projectName: string;
    projectSignatures: string;
    projectDescription: string;
    hardCap:bigint;
    softCap:bigint;
    saleStartTime:bigint;
    saleEndTime:bigint;
    price:bigint;
}


type UserApplication = {
    randomedID: number;
    attempt: boolean;
    allocation: boolean;
    gotResult: boolean;
    registerInIDO: boolean;
}

type PoolWeights  = { 
    staticTier: string;
    antagonistTier: string;
    dynamicTier: string;
    launchpadTier: string;
}

type IDOParams=  {
    _deployer: string;
    _launchedToken: string;
    _tokenFounder: string;
    // Project _project;
    _nft: string;
    _staking: string;
}

@NearBindgen({ requireInit: true })
class Launchpad {
    // public nft:NFT  ;

    public project: Project;
    public idoData: IDOData;

    public tokenFounder: string; // the owner of the launched token

    public token: string; // address of the token to be launched

    _revocable: boolean = false; // whether or not the vesting is revocable
    _allowRefund: boolean = false; // whether or not the refund is allowed

    // mapping(address => UserApplication) public surveyedAddresses; //mapping with address which applied
    public fundRaisedBalance: Record<string, bigint> = {};

    public tokensBought: Record<string, bigint> = {};
    private readonly _poolWeights = [BigInt(5), BigInt(20), BigInt(30), BigInt(45)] as const;

    /* Analog of solidity modifiers. Just a private view functions */
    @view({privateFunction: true})
    onlyInitialized() {
        if(this.idoData.totalClaimableAmount > 0) return; 
        throw "PP: 0";
    }

    @view({privateFunction: true})
    onlyIfSaleEnded() {
        require((this.project.saleEndTime > 0) && (this.project.saleEndTime < near.blockTimestamp()),"PP: 1")
    }

    @view({privateFunction: true})
    onlyIfVestingExists({_beneficiary, _id} : {_beneficiary: string, _id: BigInt}) {
        require(this.nft.getStruct(_beneficiary, _id).initialized == true &&
            this.ownerOf(_id) == _beneficiary, "PP: 2")
    }

    @view({privateFunction: true})
    onlyIfVestingNotRevoked({_beneficiary, _id} : {_beneficiary: string, _id: BigInt}) {
        require( this.nft.getStruct(_beneficiary, _id).initialized == true &&
            this.nft.ownerOf(_id) == _beneficiary &&
            this.nft.getStruct(_beneficiary, _id).revoked == false, "VestingNotRevoked")
    }

    @view({privateFunction: true})
    validSoftHardCap() {
        require( (this.idoData.totalBNBAmount <= this.project.hardCap) &&
        (this.idoData.totalBNBAmount >= this.project.softCap), "PP: 4")
    }

    @view({privateFunction: true})
    validTokenAmount({_beneficiary, _id} : {_beneficiary: string, _id: BigInt}) {
        require( this.nft.getStruct(_beneficiary, _id).initialized == true &&
            this.nft.ownerOf(_id) == _beneficiary, "VestingNotRevoked")
    }


    constructor() {
        this.idoData = {
            antagonistMembers: BigInt(0),
            cliff:BigInt(0),
            duration:BigInt(0),
            dynamicMembers:BigInt(0),
            members:BigInt(0),
            launchpadMembers:BigInt(0),
            start:BigInt(0),
            staticMembers:BigInt(0),
            totalBNBAmount:BigInt(0),
            totalClaimableAmount:BigInt(0),
            totalPurchased:BigInt(0),
            totalUnreleased:BigInt(0),
            totalVestingAmount:BigInt(0)
        }

        this.project = {
            hardCap:BigInt(0),
            price:BigInt(0),
            saleEndTime:BigInt(0),
            saleStartTime:BigInt(0),
            softCap:BigInt(0),
        }
       
    }

    @initialize({})
    init(_params: IDOParams) {
        require(_params._project.hardCap >= _params._project.softCap, "PP: 6");
        require(
            (_params._project.saleStartTime >= 0) &&
                (_params._project.saleStartTime < _params._project.saleEndTime),
            "PP: 7"
        );
        require(_params._project.price > 0, "PP: 8");

        this.token = _params._launchedToken;
        this.tokenFounder = _params._tokenFounder;
        this.project = _params._project;

        this.nft = NFT(_params._nft);
        this.staking = Staking(_params._staking);
        transferOwnership(_params._deployer);

        this.idoData.totalClaimableAmount = token.balanceOf(address(this));
        require(idoData.totalClaimableAmount > 0, "PP: 9");
    }

    // Make sure the allower has provided the right allowance
    @view({privateFunction: true})
    _verifyAllowance({
            _allower,
        _amount,
        _token
    }:{_allower:string,
            _amount: BigInt,
            _token: string
        }
    ) {
        const ourAllowance = _token.allowance(_allower, address(this));
        require(_amount <= ourAllowance, "PP: 11");
    }

    @call({payableFunction:true})
    purchaseTokens({_beneficiary, _id} : {_beneficiary: string, _id: bigint}){
        require(
            (near.blockTimestamp() > this.project.saleStartTime) &&
                (near.blockTimestamp() < this.project.saleEndTime),
            "PP: 12"
        );
       
        const tokenAmount =  near.attachedDeposit() * this.project.price;
       
        require(
            this.idoData.totalBNBAmount + near.attachedDeposit() <= this.project.hardCap,
            "PP: 14"
        );


        this.fundRaisedBalance[near.predecessorAccountId()] +=  near.attachedDeposit();
        this.tokensBought[_beneficiary] += tokenAmount;
        
        if (_id != BigInt(0) && this.nft.ownerOf(_id) == _beneficiary) {
            this.nft.changeData(_beneficiary, _id, tokenAmount);
        } else {
            this.nft.mintToken(_beneficiary, tokenAmount);
        }

        this.idoData.totalPurchased += tokenAmount;
        this.idoData.totalBNBAmount += near.attachedDeposit();

        require(
            this.idoData.totalPurchased <= this.idoData.totalClaimableAmount,
            "PP: 15"
        );
    }


    // Releases claim for the launched token to the beneficiary
    @call({})
    claimVestedTokens({_beneficiary, _id} : {_beneficiary: string, _id: bigint})
    {
        this.onlyIfVestingNotRevoked({_beneficiary, _id});

        const balance = this.nft.getStruct(_beneficiary, _id).balance;
        const isBeneficiary =  near.predecessorAccountId() === _beneficiary;
        const isOwner = near.predecessorAccountId() == owner();

        require(
            this.nft.getStruct(_beneficiary, _id).claimed == false,
            "Already claimed"
        );

        require(isBeneficiary || isOwner, "PP: 21");

        this.idoData.totalVestingAmount = this.idoData.totalVestingAmount + balance;
        this.token.safeTransfer(_beneficiary, balance);
        this.nft.makeClaimed(_id);
    }

    // Withdraws payment token
    @call({})
    withdrawFunds({_recipient}: {_recipient: string}){
        this.onlyIfSaleEnded();
        const isRecipient = near.predecessorAccountId() === this.tokenFounder;
        const isOwner = near.predecessorAccountId() == owner();

        require(
            isRecipient || isOwner,
            "Launchpad: only tokenFounder or owner can withdraw funds"
        );

        const balanceBNB = near.accountBalance();
        payable(_recipient).transfer(balanceBNB);
    }

    // Withdraws not sold launched tokens back
    @call({})
    withdrawNotSoldTokens({_recipient}: {_recipient: string}){
        this.onlyIfSaleEnded();

        require(near.predecessorAccountId() === this.tokenFounder, "PP: 26");

        const notSold = this.idoData.totalClaimableAmount - this.idoData.totalPurchased;
        this.idoData.totalClaimableAmount = BigInt(0);
        this.token.safeTransfer(_recipient, notSold);
    }

    // Withdraw unreleased launched tokens after revoke or in case emergency
    @call({})
    withdrawTokens({_recipient, _amount}: {_recipient: string, _amount: bigint})
    {
        require(near.blockTimestamp() > this.idoData.cliff, "PP: 28");
        require(
            near.predecessorAccountId() === this.tokenFounder || near.predecessorAccountId() == owner(),
            "PP: 29"
        );

        this.idoData.totalUnreleased -= _amount;
        require(this.token.transfer(_recipient, _amount), "PP: 30");
    }

    @call({})
    enableRefund() {
        require(!this._allowRefund, "PP: 33");
        this._allowRefund = true;
    }

    @call({})
    refund() {
        this.onlyIfSaleEnded();

        require(
            this.idoData.totalBNBAmount < this.project.softCap,
            "Launchpad: token vesting is launched"
        );

        require(this._allowRefund, "Launchpad: refund is not allowed");
        const amountBNB = this.fundRaisedBalance[near.predecessorAccountId()];
        require(amountBNB > 0, "Launchpad: no funds to refund");
        this.idoData.totalBNBAmount -= amountBNB;
        this.fundRaisedBalance[near.predecessorAccountId()] = BigInt(0);
        payable(_msgSender()).transfer(amountBNB);
    }

    @view({})
    getLatestPrice() {
        // TODO
        return BigInt('1');
    }
}