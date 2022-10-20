import React from "react";

import styles from "./style.module.scss";

function NFT() {
  return (
    <div className={styles.nftContainer}>
      <p>Amount to claim - 0.000</p>
      <div className={styles.buttonsWrapper}>
        <button>Go to IDO</button>
        <button>Claim</button>
      </div>
    </div>
  );
}

export default NFT;
