import React, { Dispatch, FC, SetStateAction, useState } from "react";
import { NavLink } from "react-router-dom";

import styles from "./style.module.scss";

import { Wallet } from "../../near-wallet";
import {
  claimTokens,
  transferNft,
} from "../../store/actions/launchpads.actions";
import { useAppDispatch } from "../../store/hooks";

interface NFTProps {
  idoAddress: string;
  claimableAmount: string;
  nftID: string;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  nftAddress: string;
  wallet: Wallet;
}

const NFT: FC<NFTProps> = ({
  idoAddress,
  claimableAmount,
  nftID,
  setIsLoading,
  nftAddress,
  wallet,
}) => {
  const dispatch = useAppDispatch();
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [receiverId, setReceiverId] = useState<string>("");

  const onClaim = async () => {
    setIsLoading(true);
    try {
      await dispatch(claimTokens({ tokenId: nftID, nftAddress, wallet }));
    } catch (e) {
      console.error("Error while claiming:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => setIsOpened((prev) => !prev);

  const handleTransfer = async () => {
    setIsLoading(true);
    try {
      await dispatch(
        transferNft({ tokenId: nftID, nftAddress, receiverId, wallet })
      );
    } catch (e) {
      console.error("Error while transfering NFT:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.nftContainer}>
      <div className={styles.firstLine}>
        <p>Amount to claim - {parseFloat(claimableAmount).toFixed(4)}</p>
        <p>NFT ID: {nftID}</p>
        <div className={styles.buttonsWrapper}>
          <NavLink to={`/ido/${idoAddress}`}>
            <button>Go to IDO</button>
          </NavLink>
          <button onClick={onClaim}>Claim</button>
          <button onClick={handleOpen}>{isOpened ? "Hide" : "Transfer"}</button>
        </div>
      </div>
      {isOpened && (
        <div className={styles.secondLine}>
          <input
            type="text"
            placeholder="address.testnet"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
          />
          <button onClick={handleTransfer}>Transfer</button>
        </div>
      )}
    </div>
  );
};

export default NFT;
