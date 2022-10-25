import React, { FC } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import "./style.scss";

type LoaderProps = {
  children: JSX.Element;
  isLoading: boolean;
};

export const Loader: FC<LoaderProps> = ({ children, isLoading }) => (
  <>
    <div className={isLoading ? "loader-wrapper" : ""}>
      <ClipLoader size={55} color="#ffffff" loading={isLoading} />
    </div>
    {children}
  </>
);
