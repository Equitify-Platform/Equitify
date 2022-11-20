import React, { useEffect, useMemo, useState } from "react";
import { SwiperSlide } from "swiper/react";

import styles from "./style.module.scss";

import { SWIPER_ITEMS_LIMIT } from "../../components/common/SwiperWithPaginator/constants";
import { SwiperWithPaginator } from "../../components/common/SwiperWithPaginator/SwiperWithPaginator";
import { Loader } from "../../components/Loader";
import NFT from "../../components/NFT/NFT";
import { useSeparatedDataArray } from "../../hooks/useSeparatedDataArray";
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

  const projectsWithUnmintedNFTs = useMemo(() => {
    return launchpads.projects.filter((project) => {
      const unclaimedNfts = getUnclaimedNfts(project);
      return unclaimedNfts.length > 0;
    });
  }, [launchpads.projects]);

  const separatedProjectsWithUnmintedNFTs = useSeparatedDataArray<ProjectType>(
    projectsWithUnmintedNFTs,
    SWIPER_ITEMS_LIMIT
  );

  useEffect(() => {
    dispatch(getLaunchpads(wallet));
  }, [dispatch, wallet]);

  return (
    <Loader isLoading={isLoading}>
      <div className="page-wrapper">
        <div className="content-wrapper">
          <div className={styles.topSection}>
            <h3>Claim</h3>
            <p>Here you can find the list of all your purchases</p>
          </div>
          <div className={styles.nftWrapper}>
            <SwiperWithPaginator
              paginatorType="num"
              posLength={projectsWithUnmintedNFTs.length || 1}
            >
              {separatedProjectsWithUnmintedNFTs.map((projectsArray, index) => (
                <SwiperSlide key={index}>
                  <div className={styles.cardsContainer}>
                    {projectsArray.map((project) => (
                      <NFT
                        ftAddress={project.token.address}
                        key={project.nft.address}
                        nftContract={project.nft}
                        projectName={project.projectStruct.projectName}
                        tokenSymbol={project.token.symbol}
                        idoAddress={project.address}
                        setIsLoading={setIsLoading}
                        wallet={wallet}
                      />
                    ))}
                  </div>
                </SwiperSlide>
              ))}
            </SwiperWithPaginator>
          </div>
        </div>
      </div>
    </Loader>
  );
}

export default Claim;
