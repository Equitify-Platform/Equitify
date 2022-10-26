import React from "react";
import { RouteObject } from "react-router-dom";

import Claim from "../pages/Claim/Claim";
import IDO from "../pages/IDO/IDO";
import IDOList from "../pages/IDOList/IDOList";
import Staking from "../pages/Staking/Staking";

export const ROUTES_CONFIG: RouteObject[] = [
  {
    path: "/",
    element: <IDOList />,
  },
  {
    path: "/ido/:address",
    element: <IDO />,
  },
  {
    path: "/staking",
    element: <Staking />,
  },
  {
    path: "/claim",
    element: <Claim />,
  },
];
