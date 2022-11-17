import React, { Dispatch, FC, SetStateAction, useMemo, useState } from "react";

import styles from "./style.module.scss";

import IdoLogoExample from "../../assets/images/idoImgExample.png";
import { Wallet } from "../../near-wallet";
import {
  claimTokens,
  purchaseTokens,
} from "../../store/actions/launchpads.actions";
import { useAppDispatch } from "../../store/hooks";
import { IdoStage } from "../../types/IdoStage";
import { BuyInput } from "../BuyInput";
import ExchangeCard from "../ExchangeCard";
import { NftSelect, Option } from "../NftSelect";

interface ExchangeSideProps {
  idoStage: IdoStage;
  symbol: string;
  balance: string;
  price: string;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  projectName: string;
  projectDescription: string;
}

export const ExchangeSide: FC<ExchangeSideProps> = ({
  idoStage,
  symbol,
  balance,
  price,
  setIsLoading,
  projectName,
  projectDescription,
}) => {
  return (
    <div className={styles.exchangeSide}>
      <div className={styles.projectInfo}>
        <img className={styles.projectImg} src={IdoLogoExample} alt="" />
        <h4>{projectName}</h4>
        <p>{projectDescription}</p>
      </div>
      <ExchangeCard
        idoStage={idoStage}
        setIsLoading={setIsLoading}
        balance={balance}
        symbol={symbol}
        projectName={projectName}
      />
    </div>
  );
};

/* <div className={styles.exchangeSide}>
      <h2>Exchange side</h2>
      {idoStage !== IdoStage.PRESALE && (
        <NftSelect options={options} idoStage={idoStage} onChange={onChange} />
      )}
      {idoStage === IdoStage.SALE ? (
        <>
          <div>
            <BuyInput
              value={nativeAmount}
              setValue={setNativeAmount}
              leftLabel="NEAR"
              rightLabel={`Balance: ${parseFloat(balance).toFixed(2)}`}
              onChange={handleNativeChange}
            />
            <BuyInput
              value={tokenAmount}
              setValue={setTokenAmount}
              leftLabel={symbol}
              rightLabel={`Vested balance: ${
                option ? parseFloat(option.locked).toFixed(2) : "0.00"
              }`}
              onChange={handleTokenChange}
            />
          </div>
          <button style={{ marginTop: "1rem" }} onClick={purchase}>
            Purchase
          </button>
        </>
      ) : idoStage === IdoStage.CLAIM ? (
        <>
          <div className={styles.balances}>
            <div
              className={styles.totalBalance}
              style={{ marginBottom: "12px", marginTop: "20px" }}
            >
              <div>Total balance</div>
              <div className={styles.flex}>
                <div>
                  {option
                    ? (
                        parseFloat(option.locked) + parseFloat(option.claimed)
                      ).toFixed(2)
                    : "0.00"}
                </div>
              </div>
            </div>
            <div className={styles.tokens}>
              <div className={styles.space}>
                <div>Available Tokens:</div>
                <div>
                  {option ? parseFloat(option.locked).toFixed(2) : "0.00"}
                </div>
              </div>
              <div className={styles.space}>
                <div>Total Claimed:</div>
                <div>
                  {option ? parseFloat(option.claimed).toFixed(2) : "0.00"}
                </div>
              </div>
              <div className={styles.space}>
                <div>Locked Balance:</div>
                <div>
                  {option ? parseFloat(option.locked).toFixed(2) : "0.00"}
                </div>
              </div>
            </div>
          </div>
          <button onClick={claim}>Claim</button>
        </>
      ) : null}
    </div> */
