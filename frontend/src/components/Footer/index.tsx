import React, { FC } from "react";

import styles from "./style.module.scss";

import NavLogo from "../../assets/icons/NavLogo.svg";

const Footer: FC = () => {
  return (
    <footer className={styles.footer}>
      <img src={NavLogo} alt="" />
      <a href="https://redduck.io/" target="_blank" rel="noreferrer">
        redduck.io
      </a>
      <p>©All rights reserved</p>
    </footer>
  );
};

export default Footer;
