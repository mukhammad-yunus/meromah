"use client";

import { Provider } from "react-redux";
import { store } from "../src/app/store.js";
import ThemeEffect from "./ThemeEffect";

const Providers = ({ children }) => {
  return (
    <Provider store={store}>
      <ThemeEffect />
      {children}
    </Provider>
  );
};

export default Providers;
