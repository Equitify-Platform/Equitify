import { ProjectType } from "../actions/launchpads.actions";

export const getLaunchpadsMock = (): Promise<ProjectType[]> =>
  Promise.resolve([
    {
      address: "test_address",
      nft: {
        address: "test_nft_address",
        nfts: [
          {
            balance: "100.00",
            claimed: false,
            initialized: true,
            released: "0.00",
            revoked: false,
            tokenId: "0",
            tokenUri: "",
          },
        ],
      },
      projectStruct: {
        hardCap: "100.00",
        price: "10",
        projectDescription: "The best project",
        projectName: "TEST1",
        projectSignatures: "T1",
        saleEndTime: "1668961747",
        saleStartTime: "1",
        softCap: "",
      },
      stakingContract: "test_staking_address",
      token: {
        address: "test_token_address",
        name: "test_token_name",
        symbol: "TTS",
        ownerAddress: "test_token_owner_address",
      },
    },
  ]);
