import React, { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { SwiperSlide } from "swiper/react";

import styles from "./style.module.scss";

import ArrowIconBlue from "../../assets/icons/arrowRightBlue.svg";
import IdoLogoExample from "../../assets/images/idoImgExample.png";
import { ClaimSide } from "../../components/ClaimSide/ClaimSide";
import { SwiperWithPaginator } from "../../components/common/SwiperWithPaginator/SwiperWithPaginator";
import { ExchangeSide } from "../../components/ExchangeSide/ExchangeSide";
import { Loader } from "../../components/Loader";
import Presale from "../../components/Presale";
import useMatchBreakpoints from "../../hooks/useMatchBreakpoints";
import { getLaunchpads } from "../../store/actions/launchpads.actions";
import { getBalance } from "../../store/actions/wallet.actions";
import { useAppDispatch, useLaunchpad, useWallet } from "../../store/hooks";
import { IdoStage } from "../../types/IdoStage";

function IDO() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { address } = useParams<{ address: string }>();
  const launchpad = useLaunchpad(address ?? "");
  const { isMobile } = useMatchBreakpoints();
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
      <div className="page-wrapper">
        <div className="content-wrapper">
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
            <>
              {!isMobile && (
                <div className={styles.topWrapper}>
                  <div className={styles.projectInfo}>
                    <img
                      className={styles.projectImg}
                      src={IdoLogoExample}
                      alt=""
                    />
                    <h4>{launchpad?.projectStruct.projectName ?? ""}</h4>
                    <p>{launchpad?.projectStruct.projectDescription ?? ""}</p>
                  </div>
                  <ExchangeSide
                    ftAddress={launchpad?.token.address ?? ""}
                    setIsLoading={setIsLoading}
                    idoStage={idoStage}
                    symbol={launchpad?.token.symbol ?? ""}
                    balance={parseFloat(balance).toFixed(2)}
                    projectName={launchpad?.projectStruct.projectName ?? ""}
                  />
                  <ClaimSide
                    idoStage={idoStage}
                    setIdoStage={setIdoStage}
                    date={date}
                    totalRaised={
                      launchpad ? parseFloat(launchpad.totalRaised) : 0
                    }
                    hardCap={
                      launchpad
                        ? parseFloat(launchpad.projectStruct.hardCap)
                        : 0
                    }
                    softCap={
                      launchpad
                        ? parseFloat(launchpad.projectStruct.softCap)
                        : 0
                    }
                    price={
                      launchpad ? parseFloat(launchpad.projectStruct.price) : 0
                    }
                    symbol={launchpad ? launchpad.token.symbol : ""}
                  />
                </div>
              )}
              {isMobile && (
                <SwiperWithPaginator
                  paginatorType="dot"
                  posLength={2}
                  pageSize={1}
                >
                  <SwiperSlide>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <ExchangeSide
                        ftAddress={launchpad?.token.address ?? ""}
                        setIsLoading={setIsLoading}
                        idoStage={idoStage}
                        symbol={launchpad?.token.symbol ?? ""}
                        balance={parseFloat(balance).toFixed(2)}
                        projectName={launchpad?.projectStruct.projectName ?? ""}
                      />
                      <ClaimSide
                        idoStage={idoStage}
                        setIdoStage={setIdoStage}
                        date={date}
                        totalRaised={
                          launchpad ? parseFloat(launchpad.totalRaised) : 0
                        }
                        hardCap={
                          launchpad
                            ? parseFloat(launchpad.projectStruct.hardCap)
                            : 0
                        }
                        softCap={
                          launchpad
                            ? parseFloat(launchpad.projectStruct.softCap)
                            : 0
                        }
                        price={
                          launchpad
                            ? parseFloat(launchpad.projectStruct.price)
                            : 0
                        }
                        symbol={launchpad ? launchpad.token.symbol : ""}
                      />
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className={styles.projectInfo}>
                      <img
                        className={styles.projectImg}
                        src={IdoLogoExample}
                        alt=""
                      />
                      <h4>{launchpad?.projectStruct.projectName ?? ""}</h4>
                      <p>{launchpad?.projectStruct.projectDescription ?? ""}</p>
                    </div>
                  </SwiperSlide>
                </SwiperWithPaginator>
              )}
            </>
          ) : (
            <Presale idoStage={idoStage} date={date} />
          )}
        </div>
      </div>
    </Loader>
  );
}

export default IDO;
