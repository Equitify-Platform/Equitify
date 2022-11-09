import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";

import styles from "./style.module.scss";

import NavLogo from "../../assets/icons/NavLogo.svg";
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
      <img src={NavLogo} alt="" />
      <div className={styles.navLinks}>
        <NavLink
          className={({ isActive }) => (isActive ? styles.activePage : "")}
          to="/"
          end
        >
          Home
        </NavLink>
        <NavLink
          className={({ isActive }) => (isActive ? styles.activePage : "")}
          to="/claim"
        >
          Claim
        </NavLink>
        <NavLink
          className={({ isActive }) => (isActive ? styles.activePage : "")}
          to="/staking"
        >
          3rd page
        </NavLink>
      </div>
      <button className={styles.walletButton} onClick={handleClick}>
        {wallet.isSignedIn
          ? `Sign out ${wallet.wallet.accountId}`
          : "Connect wallet"}
      </button>
    </div>
  );
}

export default Navbar;
