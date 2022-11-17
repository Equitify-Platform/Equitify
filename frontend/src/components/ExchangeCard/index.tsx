import React, { Dispatch, FC, SetStateAction, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import styles from "./style.module.scss";

import {
  claimTokens,
  purchaseTokens,
} from "../../store/actions/launchpads.actions";
import { useAppDispatch, useLaunchpad, useWallet } from "../../store/hooks";
import { IdoStage } from "../../types/IdoStage";
import { BuyInput } from "../BuyInput";
import { NftSelect, Option } from "../NftSelect";
import SecondaryButton from "../SecondaryButton";

interface ExchangeCardProps {
  idoStage: IdoStage;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  balance: string;
  symbol: string;
  projectName: string;
}

const ExchangeCard: FC<ExchangeCardProps> = ({
  idoStage,
  setIsLoading,
  balance,
  symbol,
  projectName,
}) => {
  const { address } = useParams<{ address: string }>();
  const launchpad = useLaunchpad(address ?? "");
  const { wallet } = useWallet();
  const dispatch = useAppDispatch();

  const [nftId, setNftId] = useState<string>("0");
  const [nativeAmount, setNativeAmount] = useState<number>(0);
  const [tokenAmount, setTokenAmount] = useState<number>(0);

  const buttonText: Record<IdoStage, string> = {
    [IdoStage.PRESALE]: "Purchase",
    [IdoStage.SALE]: "Purchase",
    [IdoStage.CLAIM]: "Claim",
  };

  const launchpadAddress = address ?? "";
  const price = launchpad?.projectStruct.price ?? "0";
  const nftAddress = launchpad?.nft.address ?? "";

  const handleNativeChange = (native: number) => {
    setTokenAmount(native * parseFloat(price));
  };

  const handleTokenChange = (token: number) => {
    setNativeAmount(token / parseFloat(price));
  };

  const options = useMemo<Option[]>(() => {
    if (!launchpad) return [];

    return launchpad.nft.nfts
      .filter((n) => !n.claimed)
      .map((n) => ({
        claimed: parseFloat(n.released).toFixed(2),
        locked: parseFloat(n.balance).toFixed(2),
        id: n.tokenId,
        imageUrl: n.tokenUri,
      }));
  }, [launchpad]);

  const option = useMemo(
    () => options.find((o) => o.id === nftId),
    [options, nftId]
  );

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
        claimTokens({ tokenId: option?.id || "0", nftAddress, wallet })
      );
    } catch (e) {
      console.error("Error while claiming tokens:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.exchangeCard}>
      <h4>Exchange</h4>
      <NftSelect
        className={styles.nftSelect}
        options={options}
        idoStage={idoStage}
        onChange={(id) => setNftId(id)}
        projectName={projectName}
      />
      <div className={styles.purchasedInfo}>
        <p>
          <span>Purchased:</span> 0
        </p>
        <p>
          <span>Locked:</span> 0
        </p>
      </div>
      {idoStage === IdoStage.CLAIM && (
        <p className={styles.totalBalance}>
          <span>Total balance:</span>
          {balance} NEAR
        </p>
      )}
      <div className={styles.dots}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
      {idoStage === IdoStage.SALE ? (
        <div className={styles.inputsWrapper}>
          <BuyInput
            value={nativeAmount}
            setValue={setNativeAmount}
            symbol="NEAR"
            label={`Balance: ${parseFloat(balance).toFixed(2)}`}
            onChange={handleNativeChange}
          />
          <BuyInput
            value={tokenAmount}
            setValue={setTokenAmount}
            symbol={symbol}
            label={`Vested: ${
              option ? parseFloat(option.locked).toFixed(2) : "0.00"
            }`}
            onChange={handleTokenChange}
          />
        </div>
      ) : (
        <div className={styles.vestingData}>
          <p>
            <span>Available tokens:</span>
            00.00
          </p>
          <p>
            <span>Total claimed:</span>
            00.00
          </p>
          <p>
            <span>Locked balance:</span>
            00.00
          </p>
        </div>
      )}
      <div className={styles.buttonWrapper}>
        <SecondaryButton
          onClick={
            idoStage === IdoStage.SALE ? () => purchase() : () => claim()
          }
          text={buttonText[idoStage]}
          isBlue={true}
        />
      </div>
    </div>
  );
};

export default ExchangeCard;
