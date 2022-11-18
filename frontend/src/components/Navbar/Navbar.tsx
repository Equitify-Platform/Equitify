import React, { FC, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import styles from "./style.module.scss";

import BurgerIcon from "../../assets/icons/BurgerIcon.svg";
import Cross from "../../assets/icons/Cross.svg";
import NavLogo from "../../assets/icons/NavLogo.svg";
import { useWindowSize } from "../../hooks/useWindowSize";
import { startUpWallet } from "../../store/actions/wallet.actions";
import { useAppDispatch, useWallet } from "../../store/hooks";

const Navbar: FC = () => {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const [width] = useWindowSize();
  const [isOpened, setIsOpened] = useState<boolean>(false);

  useEffect(() => {
    dispatch(startUpWallet());
  }, [dispatch]);

  const handleClick = () => {
    if (wallet.isSignedIn) {
      return wallet.wallet.signOut();
    }

    return wallet.wallet.signIn();
  };

  const handleOpen = () => {
    setIsOpened((prevState) => !prevState);
  };

  return (
    <>
      <div className={styles.nav}>
        {width > 576 || isOpened ? (
          <img className={styles.navLogo} src={NavLogo} alt="" />
        ) : (
          !isOpened && (
            <img
              onClick={() => handleOpen()}
              src={BurgerIcon}
              className={styles.burgerIcon}
              alt=""
            />
          )
        )}
        {width > 576 && (
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
        )}
        <div className={styles.buttonsWrapper}>
          <button className={styles.walletButton} onClick={handleClick}>
            {wallet.isSignedIn
              ? `${wallet.wallet.accountId}`
              : "Connect wallet"}
          </button>
          {isOpened && <img src={Cross} onClick={() => handleOpen()} alt="" />}
        </div>
      </div>
      {isOpened && (
        <div className={styles.openedMenu}>
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
        </div>
      )}
    </>
  );
};

export default Navbar;
