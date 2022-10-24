import React from "react";

import styles from "./style.module.scss";

function Staking() {
  return (
    <div className="page-wrapper">
      <h2>Stake your tokens</h2>
      <div className={styles.wrapperTop}>
        <div className={styles.stakingDataWrapper}>
          <p>Number of stakers - 0</p>
          <p>Total - 0.000</p>
          <p>APY - Soon</p>
        </div>
        <div className={styles.stakingDataWrapper}>
          <div>
            <p>Staked</p>
            <p>0.000</p>
          </div>
          <div>
            <p>Rewards</p>
            <p>0.000</p>
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
