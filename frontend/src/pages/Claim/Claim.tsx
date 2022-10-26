import React, { useEffect } from "react";

import "./style.module.scss";

import NFT from "../../components/NFT/NFT";
import { getLaunchpads } from "../../store/actions/launchpads.actions";
import { useAppDispatch, useLaunchpads, useWallet } from "../../store/hooks";

function Claim() {
  const launchpads = useLaunchpads();
  const dispatch = useAppDispatch();
  const { wallet } = useWallet();

  useEffect(() => {
    dispatch(getLaunchpads(wallet));
  }, [dispatch, wallet]);

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
