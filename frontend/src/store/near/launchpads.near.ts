import { formatUnits, parseUnits } from "@ethersproject/units";
import BN from "bn.js";

import { LAUNCHPAD_FACTORY_ADDRESS, NATIVE_DECIMALS } from "../../constants";
import { FungibleToken } from "../../contracts/ft";
import { Launchpad } from "../../contracts/launchpad";
import { LaunchpadFactory } from "../../contracts/launchpad-factory";
import { NonFungibleToken } from "../../contracts/nft";
import { Wallet } from "../../near-wallet";
import { NftType, ProjectType } from "../actions/launchpads.actions";

export const getLaunchpadsNear = async (
  wallet: Wallet
): Promise<ProjectType[]> => {
  const factory = new LaunchpadFactory(LAUNCHPAD_FACTORY_ADDRESS, wallet);
  const addresses = await factory.getLaunchpads();
  return Promise.all(
    addresses.map<Promise<ProjectType>>(async (address) => {
      const launchpad = new Launchpad(address, wallet);
      const data = await launchpad.getIdoInfo();
      console.log("data", data);

      const ft = new FungibleToken(data.idoToken, wallet);
      const nft = new NonFungibleToken(data.nftContract, wallet);
      const { idoData, project } = data;

      const [metadata, nfts] = await Promise.all([
        ft.metadata(),
        wallet.accountId
          ? nft.nftTokensDetailedForOwner(wallet.accountId)
          : Promise.resolve([]),
      ]);

      console.log(nfts);

      return {
        address,
        nft: {
          address: data.nftContract,
          nfts: await Promise.all(
            nfts
              .filter((t) => !!t.token_data)
              .map<Promise<NftType>>(async (t) => ({
                balance: formatUnits(
                  t.token_data?.totalVested ?? "0",
                  metadata.decimals
                ),
                claimable: formatUnits(
                  await nft.calcClaimableAmount(t.token_data?.tokenId ?? "0"),
                  metadata.decimals
                ),
                claimed:
                  t.token_data?.totalVested === t.token_data?.totalReleased,
                released: formatUnits(
                  t.token_data?.totalReleased ?? "0",
                  metadata.decimals
                ),
                revoked: t.token_data?.revoked ?? false,
                tokenId: t.token_data?.tokenId ?? "1",
                tokenUri: t.token_data?.tokenURI ?? "",
              }))
          ),
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
          projectPreviewImageBase64: project.projectPreviewImageBase64,
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
  ftAddress: string,
  nftAddress: string,
  tokenId: string
): Promise<void> => {
  const nft = new NonFungibleToken(nftAddress, wallet);
  await nft.claimVestedTokens(ftAddress, tokenId);
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
