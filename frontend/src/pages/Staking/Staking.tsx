import React, { useState } from "react";

import styles from "./style.module.scss";

import { Loader } from "../../components/Loader";

function Staking() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <Loader isLoading={isLoading}>
      <div className="page-wrapper">
        <div className="content-wrapper">
          <div className={styles.topSection}>
            <h3>Offers</h3>
          </div>
          <div className={styles.navbar}>
            <div className={styles.nav}>
              <div>Offers</div>
              <div>Protections</div>
              <div>Cancelled</div>
            </div>
            <div>Refresh</div>
          </div>
        </div>
      </div>
    </Loader>
  );
}

export default Staking;
