import React, { useEffect } from "react";

import styles from "./style.module.scss";

import NFT from "../../components/NFT/NFT";
import { getLaunchpads } from "../../store/actions/launchpads.actions";
import { useAppDispatch, useLaunchpads } from "../../store/hooks";

function Claim() {
  const launchpads = useLaunchpads();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getLaunchpads());
  }, [dispatch]);

  return (
    <div>
      {launchpads.projects.map((project) => {
        return project.nft.nfts.map((nft) => {
          return (
            !nft.claimed && (
              <NFT
                key={nft.tokenId}
                nftID={nft.tokenId}
                idoAddress={project.address}
                claimableAmount={nft.balance}
              />
            )
          );
        });
      })}
    </div>
  );
}

export default Claim;
