import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useParams } from "react-router-dom";

import styles from "./style.module.scss";

import ArrowIconBlue from "../../assets/icons/arrowRightBlue.svg";
import { ClaimSide } from "../../components/ClaimSide/ClaimSide";
import { ExchangeSide } from "../../components/ExchangeSide/ExchangeSide";
import { Loader } from "../../components/Loader";
import { Option } from "../../components/NftSelect";
import Presale from "../../components/Presale";
import { getLaunchpads } from "../../store/actions/launchpads.actions";
import { getBalance } from "../../store/actions/wallet.actions";
import { useAppDispatch, useLaunchpad, useWallet } from "../../store/hooks";
import { IdoStage } from "../../types/IdoStage";

function IDO() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { address } = useParams<{ address: string }>();
  const launchpad = useLaunchpad(address ?? "");
  const {
    wallet,
    isSignedIn,
    balance: { available: balance },
  } = useWallet();
  const dispatch = useAppDispatch();
  const [date, setDate] = useState<Date>(new Date(0));
  const [idoStage, setIdoStage] = useState<IdoStage>(IdoStage.PRESALE);

  useEffect(() => {
    setIsLoading(true);
    Promise.allSettled([
      dispatch(getLaunchpads(wallet)),
      dispatch(getBalance(wallet)),
    ])
      .then(() => setIsLoading(false))
      .catch((e) => console.error("Error while loading IDO:", e));
  }, [dispatch, wallet, isSignedIn]);

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
    <Loader isLoading={isLoading}>
      <div className="page-wrapper with-padding">
        <NavLink
          className={styles.backLink}
          style={{ textDecoration: "none" }}
          to={"/"}
        >
          <img src={ArrowIconBlue} alt="" />
          <p>Back</p>
        </NavLink>
        <h3 className={styles.pageTitle}>Purchase NFT</h3>
        {idoStage !== IdoStage.PRESALE ? (
          <div className={styles.topWrapper}>
            <ExchangeSide
              setIsLoading={setIsLoading}
              idoStage={idoStage}
              symbol={launchpad?.token.symbol ?? ""}
              balance={parseFloat(balance).toFixed(2)}
              price={launchpad?.projectStruct.price ?? "0"}
              projectName={launchpad?.projectStruct.projectName ?? ""}
              projectDescription={
                launchpad?.projectStruct.projectDescription ?? ""
              }
            />
            <ClaimSide
              idoStage={idoStage}
              setIdoStage={setIdoStage}
              date={date}
              totalRaised={launchpad ? parseFloat(launchpad.totalRaised) : 0}
              hardCap={
                launchpad ? parseFloat(launchpad.projectStruct.hardCap) : 0
              }
              softCap={
                launchpad ? parseFloat(launchpad.projectStruct.softCap) : 0
              }
              price={launchpad ? parseFloat(launchpad.projectStruct.price) : 0}
              symbol={launchpad ? launchpad.token.symbol : ""}
            />
          </div>
        ) : (
          <Presale idoStage={idoStage} date={date} />
        )}
      </div>
    </Loader>
  );
}

export default IDO;
