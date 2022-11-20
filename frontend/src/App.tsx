import React, { FC } from "react";
import { BrowserRouter } from "react-router-dom";

import Footer from "./components/Footer";
import Navbar from "./components/Navbar/Navbar";
import { ReduxProvider } from "./providers/ReduxProvider";
import RenderRoutes from "./routes/RenderRoutes";

const App: FC = () => {
  return (
    <ReduxProvider>
      <BrowserRouter>
        <Navbar />
        <RenderRoutes />
        <Footer />
      </BrowserRouter>
    </ReduxProvider>
  );
};

export default App;
