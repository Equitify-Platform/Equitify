import { formatUnits, parseUnits } from "@ethersproject/units";
import BN from "bn.js";

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
      console.log('data',data);

      const ft = new FungibleToken(data.idoToken, wallet);
      const nft = new NonFungibleToken(data.nftContract, wallet);
      const { idoData, project } = data;
      console.log(idoData);

      const [metadata, nfts] = await Promise.all([
        ft.metadata(),
        wallet.accountId
          ? nft.nftTokensDetailedForOwner(wallet.accountId)
          : Promise.resolve([]),
      ]);
      console.log(idoData);
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
          hardCap: formatUnits(project.hardCap, NATIVE_DECIMALS),
          softCap: formatUnits(project.softCap, NATIVE_DECIMALS),
          price: new BN(project.price)
            .mul(new BN(10).pow(new BN(NATIVE_DECIMALS - metadata.decimals)))
            .toString(),
          projectDescription: project.projectDescription,
          projectName: project.projectName,
          projectSignatures: project.projectSignatures,
          saleEndTime: new BN(project.saleEndTime)
            .div(new BN(1_000_000_000))
            .toString(),
          saleStartTime: new BN(project.saleStartTime)
            .div(new BN(1_000_000_000))
            .toString(),
        },
        stakingContract: "",
        token: {
          address: data.idoToken,
          name: metadata.name,
          symbol: metadata.symbol,
          decimals: metadata.decimals,
        },
        totalRaised: formatUnits(idoData.totalNearAmount, NATIVE_DECIMALS),
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

export const transferNftNear = async (
  wallet: Wallet,
  nftAddress: string,
  receiverId: string,
  tokenId: string
): Promise<void> => {
  const nft = new NonFungibleToken(nftAddress, wallet);
  await nft.transferNft(receiverId, tokenId);
};
