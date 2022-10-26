import { formatUnits, parseUnits } from "@ethersproject/units";

import { LAUNCHPADS_ADDRESSES, NATIVE_DECIMALS } from "../../constants";
import { FungibleToken } from "../../contracts/ft";
import { Launchpad } from "../../contracts/launchpad";
import { NonFungibleToken } from "../../contracts/nft";
import { Wallet } from "../../near-wallet";
import { NftType, ProjectType } from "../actions/launchpads.actions";

export const getLaunchpadsNear = async (
  wallet: Wallet
): Promise<ProjectType[]> => {
  return Promise.all(
    LAUNCHPADS_ADDRESSES.map<Promise<ProjectType>>(async (address) => {
      const launchpad = new Launchpad(address, wallet);
      const data = await launchpad.getIdoInfo();
      const ft = new FungibleToken(data.idoToken, wallet);
      const nft = new NonFungibleToken(data.nftContract, wallet);
      const { idoData, project } = data;

      const [metadata, nfts] = await Promise.all([
        ft.metadata(),
        nft.nftTokensDetailedForOwner(wallet.accountId ?? ""),
      ]);

      return {
        address,
        nft: {
          address: data.nftContract,
          nfts: nfts
            .filter((t) => !!t.token_data)
            .map<NftType>((t) => ({
              balance: formatUnits(
                t.token_data?.balance ?? "0",
                metadata.decimals
              ),
              claimed: t.token_data?.claimed ?? false,
              initialized: t.token_data?.initialized ?? false,
              released: formatUnits(
                t.token_data?.released ?? "0",
                metadata.decimals
              ),
              revoked: t.token_data?.revoked ?? false,
              tokenId: t.token_data?.tokenId ?? "1",
              tokenUri: t.token_data?.tokenURI ?? "",
            })),
        },
        projectStruct: {
          hardCap: project.hardCap,
          softCap: project.softCap,
          price: project.price,
          projectDescription: "",
          projectName: "",
          projectSignatures: "",
          saleEndTime: project.saleEndTime,
          saleStartTime: project.saleStartTime,
        },
        stakingContract: "",
        token: {
          address: data.idoToken,
          name: metadata.name,
          symbol: metadata.symbol,
          decimals: metadata.decimals,
        },
        totalRaised: idoData.totalPurchased,
      };
    })
  );
};

export const purchaseTokensNear = async (
  wallet: Wallet,
  launchpadAddress: string,
  tokenId: string,
  amount: string
): Promise<void> => {
  const launchpad = new Launchpad(launchpadAddress, wallet);
  await launchpad.purchaseTokens(
    wallet.accountId ?? "",
    tokenId,
    parseUnits(amount, NATIVE_DECIMALS).toString()
  );
};

export const claimTokensNear = async (
  wallet: Wallet,
  launchpadAddress: string,
  tokenId: string
): Promise<void> => {
  const launchpad = new Launchpad(launchpadAddress, wallet);
  await launchpad.claimVestedTokens(wallet.accountId ?? "", tokenId);
};
