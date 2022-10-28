import React, { useEffect, useState } from "react";

import "./style.module.scss";

import { Loader } from "../../components/Loader";
import NFT from "../../components/NFT/NFT";
import { getLaunchpads } from "../../store/actions/launchpads.actions";
import { useAppDispatch, useLaunchpads, useWallet } from "../../store/hooks";

function Claim() {
  const launchpads = useLaunchpads();
  const dispatch = useAppDispatch();
  const { wallet } = useWallet();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    dispatch(getLaunchpads());
  }, [dispatch, wallet]);

  return (
    <Loader isLoading={isLoading}>
      <div>
        {launchpads.projects.map((project) => {
          return project.nft.nfts.map((nft) => {
            return (
              !nft.claimed && (
                <NFT
                  nftAddress={project.nft.address}
                  key={nft.tokenId}
                  nftID={nft.tokenId}
                  idoAddress={project.address}
                  claimableAmount={nft.balance}
                  setIsLoading={setIsLoading}
                />
              )
            );
          });
        })}
      </div>
    </Loader>
  );
}

export default Claim;
