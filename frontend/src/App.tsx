import React, { FC } from "react";
import { BrowserRouter } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import { ReduxProvider } from "./providers/ReduxProvider";
import RenderRoutes from "./routes/RenderRoutes";

const App: FC = () => {
  return (
    <ReduxProvider>
      <BrowserRouter>
        <Navbar />
        <RenderRoutes />
      </BrowserRouter>
    </ReduxProvider>
  );
};

export default App;
