import React from "react";
import { NavLink } from "react-router-dom";

import styles from "./style.module.scss";

function Navbar() {
  return (
    <div className={styles.nav}>
      <NavLink to="/">Home</NavLink>
      <NavLink to="/staking">Staking</NavLink>
      <NavLink to="/claim">Claim</NavLink>
      <button>Connect wallet</button> {/* @note no functionality for now */}
    </div>
  );
}

export default Navbar;
