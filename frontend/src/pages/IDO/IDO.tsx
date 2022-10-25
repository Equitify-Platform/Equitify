import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import styles from "./style.module.scss";

import { ClaimSide } from "../../components/ClaimSide/ClaimSide";
import { ExchangeSide } from "../../components/ExchangeSide/ExchangeSide";
import { getLaunchpads } from "../../store/actions/launchpads.actions";
import { useAppDispatch, useLaunchpad, useWallet } from "../../store/hooks";
import { IdoStage } from "../../types/IdoStage";

function IDO() {
  const { address } = useParams<{ address: string }>();
  const launchpad = useLaunchpad(address ?? "");
  const { wallet } = useWallet();
  const dispatch = useAppDispatch();
  const [date, setDate] = useState<Date>(new Date(0));
  const [idoStage, setIdoStage] = useState<IdoStage>(IdoStage.PRESALE);

  useEffect(() => {
    dispatch(getLaunchpads());
  }, [dispatch]);

  useEffect(() => {
    if (launchpad) {
      const now = new Date();
      const [saleStartTime, saleEndTime] = [
        launchpad.projectStruct.saleStartTime,
        launchpad.projectStruct.saleEndTime,
      ];
      const saleStartDate = new Date(parseInt(saleStartTime, 10) * 1000);
      const saleEndDate = new Date(parseInt(saleEndTime, 10) * 1000);
      setIdoStage(
        now < saleStartDate
          ? IdoStage.PRESALE
          : now < saleEndDate
          ? IdoStage.SALE
          : IdoStage.CLAIM
      );
      setDate(now > saleStartDate ? saleEndDate : saleStartDate);
    }
  }, [launchpad]);

  return (
    <div className="page-wrapper">
      <div className={styles.topWrapper}>
        <ExchangeSide idoStage={idoStage} />
        <ClaimSide
          idoStage={idoStage}
          setIdoStage={setIdoStage}
          date={date}
          totalRaised={launchpad ? parseFloat(launchpad.totalRaised) : 0}
          hardCap={launchpad ? parseFloat(launchpad.projectStruct.hardCap) : 0}
          softCap={launchpad ? parseFloat(launchpad.projectStruct.softCap) : 0}
          price={launchpad ? parseFloat(launchpad.projectStruct.price) : 0}
          symbol={launchpad ? launchpad.token.symbol : ""}
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
