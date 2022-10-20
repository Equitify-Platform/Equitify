import {StakingInfo, StakingPersonal} from "../actions/staking.actions";

export const getStakingInfoMock = (): Promise<StakingInfo> => Promise.resolve({
    APY: "Soon",
    numberOfStakers: "0",
    symbol: "SLT",
    totalStaked: "23435241.42",
});

export const getStakingPersonalMock = (): Promise<StakingPersonal> => Promise.resolve({
   rewards: "32.0000",
   spw: "32.0000",
   staked: "32.0000",
});