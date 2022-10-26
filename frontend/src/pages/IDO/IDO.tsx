import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import styles from "./style.module.scss";

import { ClaimSide } from "../../components/ClaimSide/ClaimSide";
import { ExchangeSide } from "../../components/ExchangeSide/ExchangeSide";
import { Loader } from "../../components/Loader";
import { Option } from "../../components/NftSelect";
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
  const [nftId, setNftId] = useState<string>("0");
  const options = useMemo<Option[]>(() => {
    if (!launchpad) {
      return [];
    }

    return launchpad.nft.nfts
      .filter((n) => !n.claimed)
      .map((n) => ({
        claimed: parseFloat(n.released).toFixed(2),
        locked: parseFloat(n.balance).toFixed(2),
        id: n.tokenId,
        imageUrl: n.tokenUri,
      }));
  }, [launchpad]);

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
      <div className="page-wrapper">
        <div className={styles.topWrapper}>
          <ExchangeSide
            launchpadAddress={address ?? ""}
            setIsLoading={setIsLoading}
            idoStage={idoStage}
            options={options}
            id={nftId}
            onChange={(id) => setNftId(id)}
            symbol={launchpad?.token.symbol ?? ""}
            balance={parseFloat(balance).toFixed(2)}
            price={launchpad ? launchpad.projectStruct.price : "0"}
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
        <div className={styles.bottomWrapper}>
          <p>{launchpad?.projectStruct.projectDescription}</p>
        </div>
      </div>
    </Loader>
  );
}

export default IDO;
