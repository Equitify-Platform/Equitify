import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";

import styles from "./style.module.scss";

import { startUpWallet } from "../../store/actions/wallet.actions";
import { useAppDispatch, useWallet } from "../../store/hooks";

function Navbar() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();

  useEffect(() => {
    dispatch(startUpWallet());
  }, [dispatch]);

  const handleClick = () => {
    if (wallet.isSignedIn) {
      return wallet.wallet.signOut();
    }

    return wallet.wallet.signIn();
  };

  return (
    <div className={styles.nav}>
      <NavLink to="/">Home</NavLink>
      <NavLink to="/staking">Staking</NavLink>
      <NavLink to="/claim">Claim</NavLink>
      <button onClick={handleClick}>
        {wallet.isSignedIn
          ? `Sign out ${wallet.wallet.accountId}`
          : "Connect wallet"}
      </button>{" "}
      {/* @note no functionality for now */}
    </div>
  );
}

export default Navbar;
