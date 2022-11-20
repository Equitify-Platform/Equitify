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
            <h1>Lorem ipsum dolor sit amet</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
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
                      imageURI={IDOImg}
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
