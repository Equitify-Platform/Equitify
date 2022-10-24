import React, { useEffect } from "react";

import styles from "./style.module.scss";

import {
  getStakingInfo,
  getStakingPersonal,
} from "../../store/actions/staking.actions";
import { useAppDispatch, useStaking } from "../../store/hooks";

function Staking() {
  const dispatch = useAppDispatch();
  const staking = useStaking();

  useEffect(() => {
    dispatch(getStakingInfo());
    dispatch(getStakingPersonal(""));
  }, [dispatch]);

  return (
    <div className={styles.stakingPage}>
      <h2>Stake your tokens</h2>
      <div className={styles.wrapperTop}>
        <div className={styles.stakingDataWrapper}>
          <p>Number of stakers - {staking.info.numberOfStakers}</p>
          <p>Total - {staking.info.totalStaked}</p>
          <p>APY - {staking.info.APY}</p>
        </div>
        <div className={styles.stakingDataWrapper}>
          <div>
            <p>Staked</p>
            <p>{staking.personal.staked}</p>
          </div>
          <div>
            <p>Rewards</p>
            <p>{staking.personal.rewards}</p>
          </div>
        </div>
      </div>
      <div className={styles.buttonsWrapper}>
        <button>Stake</button>
        <button>Withdraw</button>
      </div>
    </div>
  );
}

export default Staking;
