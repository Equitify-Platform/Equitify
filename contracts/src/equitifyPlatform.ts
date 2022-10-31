import { NearBindgen, near, call, view, initialize, UnorderedMap, LookupMap, validateAccountId, assert, NearPromise } from 'near-sdk-js';
import { log } from './utils';
import { WithCallback } from './utils/contracts/withCallback';

export type Offer = {
    nftContractId: string,
    makerId: string,
    nftId: string,
    nearFeeAmount: string,
    nearGuaranteeAmount: string,
    protectionDuration: string,
    isActive: boolean,
    isCancelled: boolean
}

export type Protection = {
    offerId: string,
    isGuaranteeClaimed: boolean;
    isNftClaimed: boolean;
    takerId: string
}

@NearBindgen({ requireInit: true })
export class EquitifyPlatform extends WithCallback {

    public offers: UnorderedMap<Offer> = new UnorderedMap('offers');
    public protections: UnorderedMap<Protection> = new UnorderedMap('protections');

    // constructor() {

    // }

    @initialize({})
    init() {

    }

    @call({ payableFunction: true })
    create_offer({
        nft_contract_id,
        nft_id,
        near_fee_amount,
        near_guarantee_amount,
        duration
    }: {
        nft_contract_id: string,
        nft_id: string,
        near_fee_amount: string,
        near_guarantee_amount: string,
        duration: string
    }) {
        log('create_offer', { nft_contract_id, nft_id, near_fee_amount, near_guarantee_amount, duration });

        validateAccountId(nft_contract_id);
        assert(BigInt(near_fee_amount) >= 0, "Invalid near_fee_amount");
        assert(BigInt(near_guarantee_amount) >= 0, "Invalid near_fee_amount");
        assert(near.attachedDeposit() >= BigInt(near_guarantee_amount), "Insufficient guarantee provided ");

        assert(BigInt(duration) > 0, "Invalid duration");

        const newId = this.offers.length;

        log('Offer id:',newId.toString());
        const offer = {
            nftContractId: nft_contract_id,
            nftId: nft_id,
            makerId: near.predecessorAccountId(),
            nearFeeAmount: near_fee_amount,
            nearGuaranteeAmount: near_fee_amount,
            protectionDuration: duration,
            isActive: true,
            isCancelled: false
        } as Offer

        this.offers.set(newId.toString(), offer);

        log('created offer', this.offers.get(newId.toString()));
    }

    @call({payableFunction: true})
    cancel_order({
        offer_id
    }: {
        offer_id: string
    }) {
        log('cancel_order', { offer_id })
        const offer = this.offers.get(offer_id);
        assert(offer, 'Offer is not exists');
        assert(!offer.isCancelled, 'Offer is already cancelled');
        assert(offer.isActive, 'Offer is not active');

        assert(offer.makerId === near.predecessorAccountId(), 'Invalid predecessor');

        offer.isCancelled = true;
        offer.isActive = false;

        this.offers.set(offer_id, offer);

        log('cancel_order end');

        return NearPromise.new(offer.makerId).transfer(BigInt(offer.nearGuaranteeAmount));
    }

    @call({ payableFunction: true })
    accept_offer({
        offer_id,
        approval_id
    }: {
        offer_id: string,
        approval_id?: string
    }) {
        log('accept_order end', offer_id, approval_id);

        const offer = this.offers.get(offer_id)

        assert(offer, 'Offer is not exists');
        assert(near.predecessorAccountId() !== offer.makerId, "Maker cannot accept offer");
        assert(!offer.isCancelled, "Offer is cancelled");
        assert(offer.isActive, "Offer is not active");
        assert(near.attachedDeposit() >= BigInt(offer.nearFeeAmount), "Insufficient fee provided");

        const protection = {
            offerId: offer_id,
            isGuaranteeClaimed: false,
            isNftClaimed: false,
            takerId: near.predecessorAccountId()
        } as Protection

        this.protections.set(offer_id, protection);

        log('accept_order end');
        
        return this._transferNftInternal({
            receiver_id: near.currentAccountId(),
            nft_contract_id: offer.nftContractId,
            nft_id: offer.nftId.toString(),
            approval_id
        }).asReturn();
    }

    @call({ payableFunction: true })
    taker_claim_guarantee({
        offer_id
    }: {
        offer_id: string
    }) {
        const { offer, protection } = this._takerClaimVerify({ offer_id });

        protection.isGuaranteeClaimed = true;

        this.protections.set(offer_id, protection);

        return NearPromise.new(offer.makerId)
            .transfer(BigInt(offer.nearGuaranteeAmount))
            .then(this._transferNftInternal({
                receiver_id: protection.takerId,
                nft_contract_id: offer.nftContractId,
                nft_id: offer.nftId.toString()
            })).asReturn();
    }

    @call({payableFunction: true})
    taker_claim_nft({
        offer_id
    }: {
        offer_id: string
    }) {
        const { offer, protection } = this._takerClaimVerify({ offer_id });

        protection.isNftClaimed = true;

        this.protections.set(offer_id, protection);

        return NearPromise.new(protection.takerId)
            .transfer(BigInt(offer.nearGuaranteeAmount))
            .then(this._transferNftInternal({
                receiver_id: offer.makerId,
                nft_contract_id: offer.nftContractId,
                nft_id: offer.nftId.toString()
            })).asReturn();
    }

    private _takerClaimVerify({
        offer_id
    }: {
        offer_id: string
    }) {
        const offer = this.offers.get(offer_id)

        assert(!offer.isCancelled, "Offer is cancelled");
        assert(offer.isActive, "Offer is not active");

        const protection = this.protections.get(offer_id)

        assert(protection.takerId === near.predecessorAccountId(), "Predecessor is not a protection taker");
        assert(!protection.isNftClaimed && !protection.isGuaranteeClaimed, "Guarantee/Nft is already claimed");

        return { offer, protection }
    }

    private _transferNftInternal(
        { receiver_id, nft_contract_id, nft_id, approval_id }:
            { receiver_id: string, nft_contract_id: string, nft_id: string, approval_id?: string }
    ) {
        return this._executePromise({
            call: {
                accountId: nft_contract_id,
                function: 'nft_transfer',
                args: JSON.stringify({
                    receiver_id,
                    token_id: nft_id,
                    approval_id,
                    memo: '',
                    msg: ''
                }),
                deposit: BigInt('1')
            }
        });
    }
}