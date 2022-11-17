import React, { FC, useEffect, useMemo, useState } from "react";
import Select, { SingleValue } from "react-select";

import styles from "./style.module.scss";

import NearIcon from "../../assets/icons/NearIcon.svg";
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
  className: string;
  projectName: string;
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
                <img
                  src={option.imageUrl ? option.imageUrl : NearIcon}
                  alt=""
                />
                <p className={styles.nftName}>
                  {props.projectName} NFT #{option.id}
                </p>
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
        width: "100%",
        height: "45px",
        background: "rgba(255, 255, 255, 0.1)",
        border: "1px solid #D0D7DE",
        borderRadius: "4px",
        outline: 0,
        boxShadow: 0,

        ":hover": {
          border: "1px solid #2F5FBB",
          cursor: "pointer",
          outline: 0,
          boxShadow: 0,
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      placeholder: (provided: any) => ({
        ...provided,
        marginLeft: "12px",
        fontStyle: "normal",
        fontWeight: "400",
        fontSize: "16px",
        lineHeight: "21px",
        color: "#6C6E78",
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dropdownIndicator: (provided: any) => ({
        ...provided,
        color: "#0F1138",
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      indicatorSeparator: (provided: any) => ({
        ...provided,
        opacity: 0,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      indicatorsContainer: (provided: any) => ({
        ...provided,
        marginRight: "10px",
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      option: (provided: any) => ({
        ...provided,
        width: "100%",
        height: "37px",
        padding: 0,
        marginBottom: "12px",
        backgroundColor: "#fff",

        ":hover": {
          backgroundColor: "rgba(47, 95, 187, 0.12)",
        },

        ":last-child": {
          marginBottom: 0,
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      menu: (provided: any) => ({
        ...provided,
        background: "#FFFFFF",
        border: "1px solid #2F5FBB",
        boxShadow: "0px 4px 13px 1px rgba(0, 0, 0, 0.08)",
        borderRadius: "4px",
        width: "100%",
        maxHeight: "212px",
        padding: "16px 0",
        marginTop: "3px",
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      menuList: (provided: any) => ({
        ...provided,

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
    <div className={props.className}>
      <Select
        styles={colourStyles}
        isSearchable={false}
        placeholder="Choose NFT"
        onChange={handleNftChange}
        options={options}
        defaultValue={defaultValue}
      />
    </div>
  );
};
