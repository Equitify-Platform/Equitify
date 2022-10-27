import React, { FC, useEffect, useMemo, useState } from "react";
import Select, { SingleValue } from "react-select";

import styles from "./style.module.scss";

import { useWindowSize } from "../../hooks/useWindowSize";
import { IdoStage } from "../../types/IdoStage";

export interface Option {
  imageUrl: string;
  locked: string;
  claimed: string;
  id: string;
}

interface NftSelectProps {
  options: Option[];
  onChange: (id: string) => void | Promise<void>;
  idoStage: IdoStage;
}

interface SelectElement {
  value: string;
  label: JSX.Element;
}

export const NftSelect: FC<NftSelectProps> = (props) => {
  const [defaultValue, setDefaultValue] = useState<SelectElement>();
  const [width] = useWindowSize();

  const handleNftChange = (option: SingleValue<SelectElement>) =>
    option && props.onChange(option.value);

  const options = useMemo((): SelectElement[] => {
    const res = props.options
      ? props.options.map((option) => {
          return {
            value: option.id,
            label: (
              <div className={styles.optionWrapper}>
                <div>
                  <img
                    src={option.imageUrl}
                    alt=""
                    width="60px"
                    height="60px"
                  />
                </div>
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div className={styles.title}>TITLE</div>
                    <div>{option.id}</div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      marginTop: "5px",
                    }}
                  >
                    <div className={styles.secondary}>Locked Balance:</div>
                    <div className={styles.secondary}>{option.locked}</div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "4px",
                    }}
                  >
                    <div className={styles.secondary}>Claimed Balance:</div>
                    <div className={styles.secondary}>{option.claimed}</div>
                  </div>
                </div>
              </div>
            ),
          };
        })
      : [];

    if (props.idoStage !== IdoStage.CLAIM) {
      res.push({ value: "0", label: <div>Mint new NFT</div> });
    }

    return res.sort((a, b) => parseInt(a.value) - parseInt(b.value));
  }, [props.options, props.idoStage]);

  const colourStyles = useMemo(
    () => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      control: (provided: any) => ({
        ...provided,
        caretColor: "transparent",
        width: width <= 540 ? "289px" : width <= 760 ? "330px" : "auto",
        height: width <= 540 ? "66px" : width <= 760 ? "80px" : "82px",
        background: "rgba(255, 255, 255, 0.1)",
        border: "1px solid #FF7100",
        outline: 0,
        boxShadow: 0,
        margin: "1rem",
        ":hover": {
          border: "1px solid #FF7100",
          outline: 0,
          boxShadow: 0,
        },
        [`.${styles.secondary}`]: {
          display: "none",
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      placeholder: (provided: any) => ({
        ...provided,
        paddingLeft: "21px",
        fontFamily: "Jura, sans-serif",
        fontStyle: "normal",
        fontWeight: "700",
        fontSize: "16px",
        lineHeight: "19px",
        color: "#F3CFB3",
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dropdownIndicator: (provided: any) => ({
        ...provided,
        visibility: "hidden",
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      indicatorSeparator: (provided: any) => ({
        ...provided,
        opacity: 0,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      indicatorsContainer: (provided: any) => ({
        ...provided,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        paddingRight: "9px",
        marginRight: "10px",
        border: "none",
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      option: (provided: any, state: any) => ({
        ...provided,
        background: state.isFocused ? "#262625" : "#262625",
        width: "100%",
        ":hover": {
          background: state.isFocused ? "#262625" : "#262625",
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      menu: (provided: any) => ({
        ...provided,
        background: "#262625",
        width: "100%",
        padding: "10px 0",
        margin: 0,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      menuList: (provided: any) => ({
        ...provided,
        background: "#262625",
        marginRight: "10px",
        marginLeft: "10px",

        "::-webkit-scrollbar": {
          width: "4px",
          background: "#FF7100",
        },
      }),
    }),
    [width]
  );

  useEffect(() => {
    setDefaultValue({
      value: "0",
      label: (
        <div>
          {props.idoStage === IdoStage.CLAIM ? "Choose" : "Mint new"} NFT
        </div>
      ),
    });
  }, [props.idoStage]);

  return (
    <Select
      styles={colourStyles}
      isSearchable={false}
      placeholder="Choose NFT"
      onChange={handleNftChange}
      options={options}
      defaultValue={defaultValue}
    />
  );
};
