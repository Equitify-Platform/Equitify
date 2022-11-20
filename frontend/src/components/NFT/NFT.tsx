import React, { Dispatch, FC, SetStateAction, useState } from "react";
import { NavLink } from "react-router-dom";

import styles from "./style.module.scss";

import { Wallet } from "../../near-wallet";
import {
  claimTokens,
  NftContractType,
  transferNft,
} from "../../store/actions/launchpads.actions";
import { useAppDispatch } from "../../store/hooks";
import ModalWindow from "../ModalWindow";

interface NFTProps {
  nftContract: NftContractType;
  projectName: string;
  tokenSymbol: string;
  idoAddress: string;
  ftAddress: string;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  wallet: Wallet;
}

const NFT: FC<NFTProps> = ({
  projectName,
  tokenSymbol,
  nftContract,
  idoAddress,
  ftAddress,
  setIsLoading,
  wallet,
}) => {
  const dispatch = useAppDispatch();
  const [receiverId, setReceiverId] = useState<string>("");
  const [isModalShown, setIsModalShown] = useState<boolean>(false);

  const { address: nftAddress, nfts } = nftContract;

  const onClaim = async (nftID: string) => {
    setIsLoading(true);
    try {
      await dispatch(
        claimTokens({ tokenId: nftID, nftAddress, wallet, ftAddress })
      );
    } catch (e) {
      console.error("Error while claiming:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleOpen = () => setIsModalShown(true);

  const handleTransfer = async (nftID: string) => {
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
      <h4>{projectName}</h4>
      {nfts.map((nft) => {
        return (
          <div key={nft.tokenId} className={styles.wrapper}>
            <div className={styles.nftDataContainer}>
              <p>
                <span>Amount to claim:</span>
                {parseFloat(nft.claimable).toFixed(4) + tokenSymbol}
              </p>
              <p>
                <span>NFT Address:</span>
                {nftContract.address}
              </p>
              <p>
                <span>NFT ID:</span>
                {nft.tokenId}
              </p>
            </div>
            <div className={styles.buttonsContainer}>
              <NavLink to={`/ido/${idoAddress}`}>
                <button className={styles.toIdoBtn}>Go to IDO</button>
              </NavLink>
              <button
                className={styles.claimBtn}
                onClick={() => onClaim(nft.tokenId)}
              >
                Claim
              </button>
            </div>
            {isModalShown && (
              <ModalWindow>
                <h4>Transfer to</h4>
                <input
                  type={"text"}
                  className={styles.transferInput}
                  placeholder="Enter the address"
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                />
                <div className={styles.modalButtonsContainer}>
                  <button onClick={() => setIsModalShown(false)}>Cancel</button>
                  <button onClick={() => handleTransfer(nft.tokenId)}>
                    Confirm
                  </button>
                </div>
              </ModalWindow>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NFT;
