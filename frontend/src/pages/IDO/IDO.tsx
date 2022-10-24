import React, { useState } from "react";

import styles from "./style.module.scss";

import ClaimSide from "../../components/ClaimSide/ClaimSide";
import ExachangeSide from "../../components/ExchangeSide/ExachangeSide";

function IDO() {
  const [isClaim, setIsClaim] = useState<boolean>(false);

  return (
    <div className="page-wrapper">
      <div className={styles.topWrapper}>
        <ExachangeSide
          name={"Name"}
          symbol={"TST"}
          balance={"123"}
          address={"0x12121..."}
          account={"0x14141..."}
          id={"0"}
          isClaim={false}
          price={0}
        />
        <ClaimSide
          timestamp={0}
          totalRaised={0}
          hardcap={0}
          price={0}
          symbol={""}
          isClaim={isClaim}
          setIsClaim={setIsClaim}
        />
      </div>
      <div className={styles.bottomWrapper}>
        <p>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industries standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum
        </p>
      </div>
    </div>
  );
}

export default IDO;
