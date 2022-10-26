import React, { Dispatch, FC, SetStateAction, useMemo, useState } from "react";

import styles from "./style.module.scss";

import {
  claimTokens,
  purchaseTokens,
} from "../../store/actions/launchpads.actions";
import { useAppDispatch, useWallet } from "../../store/hooks";
import { IdoStage } from "../../types/IdoStage";
import { BuyInput } from "../BuyInput";
import { NftSelect, Option } from "../NftSelect";

interface ExchangeSideProps {
  idoStage: IdoStage;
  options: Option[];
  id: string;
  onChange: (id: string) => void | Promise<void>;
  symbol: string;
  balance: string;
  price: string;
  launchpadAddress: string;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export const ExchangeSide: FC<ExchangeSideProps> = ({
  idoStage,
  options,
  onChange,
  id,
  symbol,
  balance,
  price,
  setIsLoading,
  launchpadAddress,
}) => {
  const dispatch = useAppDispatch();
  const { wallet } = useWallet();
  const [nativeAmount, setNativeAmount] = useState<number>(0);
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const option = useMemo(() => options.find((o) => o.id === id), [options, id]);

  const handleNativeChange = (native: number) => {
    setTokenAmount(native * parseFloat(price));
  };

  const handleTokenChange = (token: number) => {
    setNativeAmount(token / parseFloat(price));
  };

  const purchase = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await dispatch(
        purchaseTokens({
          amount: nativeAmount.toString(),
          tokenId: option?.id || "0",
          launchpadAddress,
          wallet,
        })
      );
    } catch (e) {
      console.error("Error while purchasing tokens:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const claim = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await dispatch(
        claimTokens({ tokenId: option?.id || "0", wallet, launchpadAddress })
      );
    } catch (e) {
      console.error("Error while claiming tokens:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.exchangeSide}>
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
    </div>
  );
};
