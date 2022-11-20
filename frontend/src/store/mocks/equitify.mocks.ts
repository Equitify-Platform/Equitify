import {
  Offer,
  Protection,
  OfferCreatorType,
} from "../../contracts/equitifyPlatform";

export const getOffersMock = (): Promise<Offer[]> =>
  Promise.resolve([
    {
      offerCreatorId: "polcraz.testnet",
      offerCreatorType: OfferCreatorType.GUARANTEE_PROVIDER,
      nftId: "1",
      nftContractId: "nft-test.testnet",
      nearFeeAmount: "1000",
      nearGuaranteeAmount: "3000",
      protectionDuration: "3600",
      isActive: true,
      isCancelled: false,
    },
  ]);

export const getProtectionsMock = (): Promise<Protection[]> =>
  Promise.resolve([
    {
      offerId: "1",
      nftProviderId: "polcraz.testnet",
      guaranteeProviderId: "polcraz.testnet",
      isGuaranteeClaimed: false,
      isNftClaimed: false,
    },
  ]);
