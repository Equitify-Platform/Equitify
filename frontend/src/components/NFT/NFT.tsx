import React, { FC } from "react";
import { NavLink } from "react-router-dom";

import styles from "./style.module.scss";

interface NFTProps {
  idoAddress: string;
  claimableAmount: string;
  nftID: string;
}

const NFT: FC<NFTProps> = ({ idoAddress, claimableAmount, nftID }) => {
  return (
    <div className={styles.nftContainer}>
      <p>Amount to claim - {claimableAmount}</p>
      <p>NFT ID: {nftID}</p>
      <div className={styles.buttonsWrapper}>
        <NavLink to={`/ido/${idoAddress}`}>
          <button>Go to IDO</button>
        </NavLink>
        <button>Claim</button>
      </div>
    </div>
  );
};

export default NFT;
