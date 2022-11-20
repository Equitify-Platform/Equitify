import React, { useEffect } from "react";
import { SwiperSlide } from "swiper/react";

import styles from "./style.module.scss";

import RobotHandSmall from "../../assets/bg/robot-hand-small.png";
import RobotHand from "../../assets/bg/robot-hand.png";
import IDOImg from "../../assets/images/idoImgExample.png";
import { SWIPER_ITEMS_LIMIT } from "../../components/common/SwiperWithPaginator/constants";
import { SwiperWithPaginator } from "../../components/common/SwiperWithPaginator/SwiperWithPaginator";
import IDOCard from "../../components/IDOCard/IDOCard";
import useMatchBreakpoints from "../../hooks/useMatchBreakpoints";
import { useSeparatedDataArray } from "../../hooks/useSeparatedDataArray";
import {
  getLaunchpads,
  ProjectType,
} from "../../store/actions/launchpads.actions";
import { useAppDispatch, useLaunchpads, useWallet } from "../../store/hooks";

function IDOList() {
  const dispatch = useAppDispatch();
  const launchpads = useLaunchpads();
  const { wallet } = useWallet();
  const { isMobile } = useMatchBreakpoints();

  useEffect(() => {
    dispatch(getLaunchpads(wallet));
  }, [dispatch, wallet]);

  const separatedPositions = useSeparatedDataArray<ProjectType>(
    launchpads.projects,
    isMobile ? 1 : SWIPER_ITEMS_LIMIT
  );

  return (
    <div className="page-wrapper" style={{ padding: 0 }}>
      <div className="content-wrapper">
        <div className={styles.topSection}>
          <div className={styles.topSectionText}>
            <h1>Equitify</h1>
            <p>
              We empower the Investors and provide an ease of liquidating their
              future investment position through NFT technology - by tokenizing
              a user’s participation in an IDO. Every time tokens are vested,
              the IDO smart contracts mint an NFT, and put the tokens inside of
              it, with a vesting rule applied to it (cliff duration, unlock
              formula (linear/graded/etc.).
            </p>
          </div>
        </div>
        <img
          src={isMobile ? RobotHandSmall : RobotHand}
          alt="hand"
          className={styles.handImage}
        />

        <div className={styles.idoSection}>
          <h3>Projects</h3>
          <SwiperWithPaginator
            paginatorType="dot"
            posLength={launchpads.projects.length || 1}
            pageSize={isMobile ? 1 : SWIPER_ITEMS_LIMIT}
          >
            {separatedPositions.map((projectsArray, index) => (
              <SwiperSlide key={index}>
                <div className={styles.cardsContainer}>
                  {projectsArray.map((p) => (
                    <IDOCard
                      imageURI={
                        p.projectStruct.projectPreviewImageBase64 || IDOImg
                      }
                      address={p.address}
                      key={p.address}
                      tokenName={p.token.name}
                      {...p.projectStruct}
                    />
                  ))}
                </div>
              </SwiperSlide>
            ))}
          </SwiperWithPaginator>
        </div>
      </div>
    </div>
  );
}

export default IDOList;
