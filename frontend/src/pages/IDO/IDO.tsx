import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import styles from "./style.module.scss";

import { ClaimSide } from "../../components/ClaimSide/ClaimSide";
import { ExchangeSide } from "../../components/ExchangeSide/ExchangeSide";
import { getLaunchpads } from "../../store/actions/launchpads.actions";
import { useAppDispatch, useLaunchpad, useWallet } from "../../store/hooks";

function IDO() {
  const { address } = useParams<{ address: string }>();
  const launchpad = useLaunchpad(address ?? "");
  const { wallet } = useWallet();
  const dispatch = useAppDispatch();
  const [isClaim, setIsClaim] = useState<boolean>(false);
  const [timestamp, setTimestamp] = useState<number>(0);

  useEffect(() => {
    dispatch(getLaunchpads());
  }, [dispatch]);

  useEffect(() => {
    if (launchpad) {
      const now = new Date().toUTCString();
      console.log(now);
      // setTimestamp()
    }
  }, [launchpad]);

  return (
    <div className="page-wrapper">
      <div className={styles.topWrapper}>
        <ExchangeSide />
        <ClaimSide
          timestamp={launchpad ? +launchpad.projectStruct.saleStartTime : 0}
          totalRaised={launchpad ? +launchpad.totalRaised : 0}
          hardcap={launchpad ? +launchpad.projectStruct.hardCap : 0}
          price={launchpad ? +launchpad.projectStruct.price : 0}
          symbol={launchpad ? launchpad.token.symbol : ""}
          isClaim={isClaim}
          setIsClaim={setIsClaim}
        />
      </div>
      <div className={styles.bottomWrapper}>
        <p>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industries standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum
        </p>
      </div>
    </div>
  );
}

export default IDO;
