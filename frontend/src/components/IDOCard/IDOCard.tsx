import React from "react";
import { NavLink } from "react-router-dom";

import styles from "./style.module.scss";

interface IDOCardProps {
  projectName: string;
  address: string;
}

function IDOCard({ projectName, address }: IDOCardProps) {
  return (
    <div className={styles.idoCard}>
      <NavLink to={`/ido/${address}`}>
        <h2>{projectName}</h2>
      </NavLink>
    </div>
  );
}

export default IDOCard;
