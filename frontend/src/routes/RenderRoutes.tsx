import React from "react";
import { useRoutes } from "react-router-dom";

import { ROUTES_CONFIG } from "./config";

const RenderRoutes = () => {
  const routes = useRoutes(ROUTES_CONFIG);
  return <>{routes}</>;
};

export default RenderRoutes;
