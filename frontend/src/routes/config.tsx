import React from "react";
import { RouteObject } from "react-router-dom";

import Claim from "../pages/Claim/Claim";
import IDO from "../pages/IDO/IDO";
import IDOList from "../pages/IDOList/IDOList";
import Offers from "../pages/Offers/Offers";

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
    path: "/offers",
    element: <Offers />,
  },
  {
    path: "/claim",
    element: <Claim />,
  },
];
