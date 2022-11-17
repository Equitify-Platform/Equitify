import React, { useEffect, useState } from "react";

import styles from "./style.module.scss";

import { Loader } from "../../components/Loader";
import NFT from "../../components/NFT/NFT";
import {
  getLaunchpads,
  NftType,
  ProjectType,
} from "../../store/actions/launchpads.actions";
import { useAppDispatch, useLaunchpads, useWallet } from "../../store/hooks";

function Claim() {
  const launchpads = useLaunchpads();
  const dispatch = useAppDispatch();
  const { wallet } = useWallet();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getUnclaimedNfts = (project: ProjectType): NftType[] => {
    return project.nft.nfts.filter((nft) => nft.claimed === false);
  };

  useEffect(() => {
    dispatch(getLaunchpads(wallet));
  }, [dispatch, wallet]);

  return (
    <Loader isLoading={isLoading}>
      <div className="page-wrapper with-padding">
        <div className={styles.topSection}>
          <h3>Claim</h3>
          <p>Here you can find the list of all your purchases</p>
        </div>
        <div className={styles.nftWrapper}>
          {launchpads.projects.map((project) => {
            const unclaimedNfts = getUnclaimedNfts(project);
            return (
              unclaimedNfts.length > 0 && (
                <NFT
                  key={project.address}
                  nftContract={project.nft}
                  projectName={project.projectStruct.projectName}
                  tokenSymbol={project.token.symbol}
                  idoAddress={project.address}
                  setIsLoading={setIsLoading}
                  wallet={wallet}
                />
              )
            );
            // eslint-disable-next-line no-lone-blocks
            {
              /*
           return project.nft.nfts.map((nft) => {
              return (
                !nft.claimed && (
                  <NFT
                    nftAddress={project.nft.address}
                    key={`${project.nft.address}${nft.tokenId}`}
                    nftID={nft.tokenId}
                    idoAddress={project.address}
                    claimableAmount={nft.claimable}
                    setIsLoading={setIsLoading}
                    wallet={wallet}
                  />
                )
              );
            });
          */
            }
          })}
        </div>
      </div>
    </Loader>
  );
}

export default Claim;
