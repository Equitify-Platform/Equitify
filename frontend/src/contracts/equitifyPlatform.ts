import { THIRTY_TGAS, Wallet } from "../near-wallet";

interface GetOffersArgs extends Record<string, unknown> {
  creator_id?: string;
  offer_id?: string;
  nft_contract_id?: string;
  is_active?: boolean;
  is_cancelled?: boolean;
  from_id?: string;
  to_id?: string;
}

export interface GetProtectionsArgs extends Record<string, unknown> {
  offer_id?: string;
  guarantee_provider_id?: string;
  nft_provider_id?: string;
  is_active?: boolean;
  from_id?: string;
  to_id?: string;
}

export interface CreateOfferFromGuaranteeProviderArgs
  extends Record<string, unknown> {
  nft_contract_id: string;
  nft_id: string;
  near_fee_amount: string;
  near_guarantee_amount: string;
  duration: string;
}

export interface CreateOfferFromNftProviderArgs
  extends Record<string, unknown> {
  nft_contract_id: string;
  nft_id: string;
  near_fee_amount: string;
  near_guarantee_amount: string;
  duration: string;
  approval_id?: string;
}

export interface AcceptOfferFromNftProviderArgs
  extends Record<string, unknown> {
  offer_id: string;
  approval_id?: string;
  near_fee_amount: string;
}

export interface AcceptOfferFromGuaranteeProviderArgs
  extends Record<string, unknown> {
  offer_id: string;
  near_guarantee_amount: string;
}

export enum OfferCreatorType {
  GUARANTEE_PROVIDER,
  NFT_PROVIDER,
}

export interface Offer {
  offerCreatorId: string;
  offerCreatorType: OfferCreatorType;
  nftId: string;
  nftContractId: string;
  nearFeeAmount: string;
  nearGuaranteeAmount: string;
  protectionDuration: string;
  isActive: boolean;
  isCancelled: boolean;
}

export interface Protection {
  offerId: string;
  nftProviderId: string;
  guaranteeProviderId: string;
  isGuaranteeClaimed: boolean;
  isNftClaimed: boolean;
  protectionStart: string;
  offer: Offer;
}

export class EquitifyPlatform {
  constructor(
    private readonly contractId: string,
    private readonly wallet: Wallet
  ) {}

  public async getOffers(args: GetOffersArgs) {
    return await this.wallet.view<Offer[]>(this.contractId, "get_offers", args);
  }

  public async getProtections(args: GetProtectionsArgs) {
    return await this.wallet.view<Protection[]>(
      this.contractId,
      "get_protections",
      args
    );
  }

  public async createOfferFromGuaranteeProvider(
    args: CreateOfferFromGuaranteeProviderArgs
  ) {
    return await this.wallet.call(
      this.contractId,
      "create_offer_from_guarantee_provider",
      args,
      THIRTY_TGAS,
      args.near_guarantee_amount
    );
  }

  public async createOfferFromNftProvider(
    args: CreateOfferFromNftProviderArgs
  ) {
    return await this.wallet.call(
      this.contractId,
      "create_offer_from_nft_provider",
      args,
      THIRTY_TGAS,
      args.near_fee_amount
    );
  }

  public async cancelOrder(offer_id: string) {
    return await this.wallet.call(this.contractId, "cancel_order", {
      offer_id,
    });
  }

  public async acceptOfferFromNftProvider(
    args: AcceptOfferFromNftProviderArgs
  ) {
    return await this.wallet.call(
      this.contractId,
      "accept_offer_from_nft_provider",
      args,
      THIRTY_TGAS,
      args.near_fee_amount
    );
  }

  public async acceptOfferFromGuaranteeProvider(
    args: AcceptOfferFromGuaranteeProviderArgs
  ) {
    return await this.wallet.call(
      this.contractId,
      "accept_offer_from_guarantee_provider",
      args,
      THIRTY_TGAS,
      args.near_guarantee_amount
    );
  }

  public async protectionClaimGuarantee(offer_id: string) {
    return await this.wallet.call(
      this.contractId,
      "protection_claim_guarantee",
      {
        offer_id,
      }
    );
  }

  public async protectionClaimNft(offer_id: string) {
    return await this.wallet.call(this.contractId, "protection_claim_nft", {
      offer_id,
    });
  }
}
