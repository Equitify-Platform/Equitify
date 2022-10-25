import React, { FC } from "react";
import { NavLink } from "react-router-dom";

import styles from "./style.module.scss";

interface IDOCardProps {
  projectSignatures: string;
  saleStartTime: string;
  projectDescription: string;
  price: string;
  tokenName: string;
  address: string;
}

export const IDOCard: FC<IDOCardProps> = ({
  tokenName,
  price,
  projectDescription,
  projectSignatures,
  saleStartTime,
  address,
}) => {
  return (
    <div className={styles.idoCard}>
      <NavLink to={`/ido/${address}`}>
        <h2>{projectSignatures}</h2>
        <div>Price: {price} NEAR</div>
        <div>Token: $ {tokenName}</div>
        <div>{projectDescription}</div>
        <div>Starts in: {saleStartTime}</div>
      </NavLink>
    </div>
  );
};

export default IDOCard;
