"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";

const ThemeEffect = () => {
  const theme = useSelector((state) => state.ui.theme);

  useEffect(() => {
    // Apply theme class to document element
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  return null;
};

export default ThemeEffect;
