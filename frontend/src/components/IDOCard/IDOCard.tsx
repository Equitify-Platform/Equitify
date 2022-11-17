import React, { FC, useState } from "react";
import { NavLink } from "react-router-dom";

import styles from "./style.module.scss";

import ArrowIconBlue from "../../assets/icons/arrowRightBlue.svg";
import ArrowIconWhite from "../../assets/icons/arrowRightWhite.svg";
import SecondaryButton from "../SecondaryButton";

interface IDOCardProps {
  projectName: string;
  saleStartTime: string;
  price: string;
  tokenName: string;
  address: string;
  imageURI: string;
}

export const IDOCard: FC<IDOCardProps> = ({
  projectName,
  tokenName,
  price,
  saleStartTime,
  address,
  imageURI,
}) => {
  const [arrowIcon, setArrowIcon] = useState(ArrowIconBlue);

  return (
    <div className={styles.idoCard}>
      <img className={styles.projectImg} src={imageURI} alt="" />
      <h4>{projectName}</h4>
      <div className={styles.fieldsWrapper}>
        <div className={styles.fieldTitlesWrapper}>
          <p>Price:</p>
          <p>Token:</p>
          <p>Starts in:</p>
        </div>
        <div className={styles.fieldDataWrapper}>
          <p>{price} NEAR</p>
          <p>${tokenName}</p>
          <p>{saleStartTime}</p>
        </div>
      </div>
      <NavLink to={`/ido/${address}`} style={{ textDecoration: "none" }}>
        <SecondaryButton
          isBlue={false}
          text="Purchase"
          onMouseEnter={() => setArrowIcon(ArrowIconWhite)}
          onMouseLeave={() => setArrowIcon(ArrowIconBlue)}
        >
          <img src={arrowIcon} alt="" />
        </SecondaryButton>
      </NavLink>
    </div>
  );
};

export default IDOCard;
