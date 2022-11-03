import { NearBindgen, near, call, view, initialize, UnorderedMap, LookupMap, validateAccountId, assert, NearPromise } from 'near-sdk-js';
import { log } from './utils';
import { WithCallback } from './utils/contracts/withCallback';

export enum OfferCreatorType {
    GUARANTEE_PROVIDER,
    NFT_PROVIDER
}

export type Offer = {
    offerCreatorId: string,
    offerCreatorType: OfferCreatorType,
    nftId: string,
    nftContractId: string,
    nearFeeAmount: string,
    nearGuaranteeAmount: string,
    protectionDuration: string,
    isActive: boolean,
    isCancelled: boolean
}

export type Protection = {
    offerId: string,

    nftProviderId: string,
    guaranteeProviderId: string,

    isGuaranteeClaimed: boolean;
    isNftClaimed: boolean;
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
    create_offer_from_guarantee_provider({
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
        assert(near.attachedDeposit() >= BigInt(near_guarantee_amount), "Insufficient guarantee provided ");

        return this.createOffer({
            nftContractId: nft_contract_id,
            offerCreatorType: OfferCreatorType.GUARANTEE_PROVIDER,
            nftId: nft_id,
            nearFeeAmount: near_fee_amount,
            nearGuaranteeAmount: near_guarantee_amount,
            protectionDuration: duration
        })
    }

    @call({ payableFunction: true })
    create_offer_from_nft_provider({
        nft_contract_id,
        nft_id,
        near_fee_amount,
        near_guarantee_amount,
        duration,
        approval_id
    }: {
        nft_contract_id: string,
        nft_id: string,
        near_fee_amount: string,
        near_guarantee_amount: string,
        duration: string,
        approval_id?: string
    }) {
        this.createOffer({
            nftContractId: nft_contract_id,
            offerCreatorType: OfferCreatorType.NFT_PROVIDER,
            nftId: nft_id,
            nearFeeAmount: near_fee_amount,
            nearGuaranteeAmount: near_guarantee_amount,
            protectionDuration: duration
        })

        assert(near.attachedDeposit() >= BigInt(near_fee_amount), "Insufficient fee provided ");

        return this._transferNftInternal({
            receiver_id: near.currentAccountId(),
            approval_id,
            nft_contract_id: nft_contract_id,
            nft_id: nft_id,
        }).asReturn();
    }

    @call({ payableFunction: true })
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

        assert(offer.offerCreatorId === near.predecessorAccountId(), 'Invalid predecessor');

        offer.isCancelled = true;
        offer.isActive = false;

        this.offers.set(offer_id, offer);

        log('cancel_order end');

        if (offer.offerCreatorType === OfferCreatorType.GUARANTEE_PROVIDER)
            return NearPromise.new(offer.offerCreatorId).transfer(BigInt(offer.nearGuaranteeAmount));
        else if (offer.offerCreatorType === OfferCreatorType.NFT_PROVIDER)
            return this._transferNftInternal({
                receiver_id: offer.offerCreatorId,
                nft_contract_id: offer.nftContractId,
                nft_id: offer.nftId.toString(),
            }).then(NearPromise.new(offer.offerCreatorId)
                .transfer(BigInt(offer.nearGuaranteeAmount))).asReturn();
    }

    @call({ payableFunction: true })
    accept_offer_from_nft_provider({
        offer_id,
        approval_id
    }: {
        offer_id: string,
        approval_id?: string
    }) {
        const { offer } = this.acceptOffer({
            offerId: offer_id
        })

        assert(near.attachedDeposit() >= BigInt(offer.nearFeeAmount), "Insufficient fee provided");

        return this._transferNftInternal({
            receiver_id: near.currentAccountId(),
            nft_contract_id: offer.nftContractId,
            nft_id: offer.nftId.toString(),
            approval_id
        }).asReturn();
    }

    @call({ payableFunction: true })
    accept_offer_from_guarantee_provider({ offer_id }: { offer_id: string }) {
        const { offer } = this.acceptOffer({
            offerId: offer_id
        })

        assert(near.attachedDeposit() >= BigInt(offer.nearGuaranteeAmount), "Insufficient guarantee provided");

        return NearPromise.new(near.predecessorAccountId())
            .transfer(BigInt(offer.nearFeeAmount)).asReturn();
    }

    @call({ payableFunction: true })
    protection_claim_guarantee({
        offer_id
    }: {
        offer_id: string
    }) {
        const { offer, protection } = this._takerClaimVerify({ offer_id });

        protection.isGuaranteeClaimed = true;

        this.protections.set(offer_id, protection);

        return NearPromise.new(protection.nftProviderId)
            .transfer(BigInt(offer.nearGuaranteeAmount))
            .then(this._transferNftInternal({
                receiver_id: protection.guaranteeProviderId,
                nft_contract_id: offer.nftContractId,
                nft_id: offer.nftId.toString()
            })).asReturn();
    }

    @call({ payableFunction: true })
    protection_claim_nft({
        offer_id
    }: {
        offer_id: string
    }) {
        const { offer, protection } = this._takerClaimVerify({ offer_id });

        protection.isNftClaimed = true;

        this.protections.set(offer_id, protection);

        return NearPromise.new(protection.guaranteeProviderId)
            .transfer(BigInt(offer.nearGuaranteeAmount))
            .then(this._transferNftInternal({
                receiver_id: protection.nftProviderId,
                nft_contract_id: offer.nftContractId,
                nft_id: offer.nftId.toString()
            })).asReturn();
    }

    @view({})
    get_offers({
        creator_id,
        offer_id,
        nft_contract_id,
        is_active,
        is_cancelled,
        from_id = '0',
        to_id = '50'
    }: {
        creator_id?: string,
        offer_id?: string,
        nft_contract_id?: string,
        is_active?: boolean,
        is_cancelled?: boolean,
        from_id?: string,
        to_id?: string
    }) {
        let result = this.offersToArrayResult();

        if (!result.length) return result;

        if (offer_id)
            result = result.filter(v => v.id === offer_id);

        if (creator_id)
            result = result.filter(v => v.offerCreatorId === creator_id);

        if (nft_contract_id)
            result = result.filter(v => v.nftContractId === nft_contract_id);

        if (is_active)
            result = result.filter(v => v.isActive === is_active);

        if (is_cancelled)
            result = result.filter(v => v.isCancelled === is_cancelled);

        return result.filter((_, i) => BigInt(i) >= BigInt(from_id) && BigInt(i) < BigInt(to_id));
    }

    @view({})
    get_protections({
        guarantee_provider_id,
        nft_provider_id,
        offer_id,
        is_active,
        from_id = '0',
        to_id = '50'
    }: {
        offer_id?: string,
        guarantee_provider_id?: string,
        nft_provider_id?: string,
        is_active?: boolean,
        from_id?: string,
        to_id?: string
    }) {
        let result = this.protectionsToArrayResult();

        if (!result.length) return result;

        if (offer_id)
            result = result.filter(v => v.offerId === offer_id);

        if (guarantee_provider_id)
            result = result.filter(v => v.guaranteeProviderId === guarantee_provider_id);

        if (nft_provider_id)
            result = result.filter(v => v.nftProviderId === guarantee_provider_id);


        if (is_active)
            result = result.filter(v => !v.isGuaranteeClaimed && !v.isNftClaimed);

        return result.filter((_, i) => BigInt(i) >= BigInt(from_id) && BigInt(i) < BigInt(to_id));
    }

    private createOffer(offer: Omit<Offer, 'isActive' | 'isCancelled' | 'offerCreatorId'>) {
        validateAccountId(offer.nftContractId);
        assert(BigInt(offer.nearFeeAmount) >= 0, "Invalid near_fee_amount");
        assert(BigInt(offer.nearGuaranteeAmount) >= 0, "Invalid near_fee_amount");

        assert(BigInt(offer.protectionDuration) > 0, "Invalid duration");

        const newId = this.offers.length;

        log('Offer id:', newId.toString());

        const _offer = {
            ...offer,
            offerCreatorId: near.predecessorAccountId(),
            isActive: true,
            isCancelled: false
        } as Offer

        log('create_offer', _offer);

        this.offers.set(newId.toString(), _offer);
    }

  
    private acceptOffer(protection: Omit<Protection, 'nftProviderId' | 'isGuaranteeClaimed' | 'isNftClaimed' | 'guaranteeProviderId'>) {
        const offer = this.offers.get(protection.offerId)

        assert(offer, 'Offer is not exists');
        assert(near.predecessorAccountId() !== offer.offerCreatorId, "Maker cannot accept offer");
        assert(!offer.isCancelled, "Offer is cancelled");
        assert(offer.isActive, "Offer is not active");

        const _protection = {
            ...protection,
            isGuaranteeClaimed: false,
            isNftClaimed: false,
            guaranteeProviderId:
                offer.offerCreatorType === OfferCreatorType.GUARANTEE_PROVIDER ?
                    offer.offerCreatorId :
                    near.predecessorAccountId(),
            nftProviderId: offer.offerCreatorType === OfferCreatorType.NFT_PROVIDER ?
                offer.offerCreatorId :
                near.predecessorAccountId(),
        } as Protection

        this.protections.set(protection.offerId, _protection);

        return { protection: _protection, offer };
    }

    private offersToArrayResult() {
        return this.offers.toArray().map(v => ({ id: v[0], ...v[1] }));
    }

    private protectionsToArrayResult() {
        return this.protections.toArray().map(v => ({ id: v[0], ...v[1] }));
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

        assert(protection.nftProviderId === near.predecessorAccountId(), "Predecessor is not a protection taker");
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