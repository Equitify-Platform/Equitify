import { NearBindgen, near, call, view, initialize, UnorderedMap } from 'near-sdk-js';

export type Offer = {
    nftContractId: string,
    nftId: string,
    nearFeeAmount: bigint,
    protectionDuration: bigint
}

@NearBindgen({ requireInit: true })
export class EquitifyPlatform {

    public offers: UnorderedMap<Offer> = new UnorderedMap('offers');

    constructor() {

    }

    @initialize({}) 
    init() {

    }

    create_offer({
        nft_contract_id,
        nft_id,
        near_fee_amount,
    }: {
        nft_contract_id: string,
        nft_id: string,
        near_fee_amount: string
    }) {

    }
}