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
        <p>Price: {price} NEAR</p>
        <p>Token: $ {tokenName}</p>
        <p>{projectDescription}</p>
        <p>Starts in: {saleStartTime}</p>
      </NavLink>
    </div>
  );
};

export default IDOCard;
