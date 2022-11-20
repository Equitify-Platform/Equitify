import { timeout } from "../../utils/promise";
import { ProjectType } from "../actions/launchpads.actions";

export const getLaunchpadsMock = (): Promise<ProjectType[]> =>
  Promise.resolve([
    {
      address: "test_address",
      nft: {
        address: "test_nft_address",
        nfts: [
          {
            balance: "100",
            claimed: false,
            claimable: "0",
            initialized: true,
            released: "0",
            revoked: false,
            tokenId: "1",
            tokenUri: "",
          },
        ],
      },
      projectStruct: {
        hardCap: "100",
        price: "10",
        projectDescription: "The best project",
        projectName: "TEST1",
        projectSignatures: "T1",
        saleEndTime: "1666732500",
        saleStartTime: "1666732380",
        softCap: "0.1",
        projectPreviewImageBase64: "",
      },
      stakingContract: "test_staking_address",
      token: {
        address: "test_token_address",
        name: "test_token_name",
        symbol: "TTS",
        decimals: 24,
      },
      totalRaised: "1",
    },
  ]);

export const purchaseTokensMock = (): Promise<void> =>
  timeout(1000).then(() => console.log("Purchased"));

export const claimTokensMock = (): Promise<void> =>
  timeout(1000).then(() => console.log("Claimed"));
