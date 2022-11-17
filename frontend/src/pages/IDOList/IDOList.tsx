import React, { useEffect } from "react";

import styles from "./style.module.scss";

import RobotHand from "../../assets/bg/robot-hand.png";
import IDOImg from "../../assets/images/idoImgExample.png";
import IDOCard from "../../components/IDOCard/IDOCard";
import IDONavigation from "../../components/IDONavigation";
import { getLaunchpads } from "../../store/actions/launchpads.actions";
import { useAppDispatch, useLaunchpads, useWallet } from "../../store/hooks";

function IDOList() {
  const dispatch = useAppDispatch();
  const launchpads = useLaunchpads();
  const { wallet } = useWallet();

  useEffect(() => {
    dispatch(getLaunchpads(wallet));
  }, [dispatch, wallet]);

  return (
    <div className="page-wrapper">
      <div className={styles.topSection}>
        <div className={styles.topSectionText}>
          <h1>Lorem ipsum dolor sit amet</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
        </div>
        <img src={RobotHand} alt="" />
      </div>
      <h3 className={styles.idoSectionTitle}>Projects</h3>
      <div className={styles.idoSection}>
        {launchpads.projects.map((p) => (
          <IDOCard
            imageURI={IDOImg}
            address={p.address}
            key={p.address}
            tokenName={p.token.name}
            {...p.projectStruct}
          />
        ))}
      </div>
      <div className={styles.idoNavigation}>
        <IDONavigation />
      </div>
    </div>
  );
}

export default IDOList;
