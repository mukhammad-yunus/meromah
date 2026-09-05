import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import UserPage from "./routes/user/UserPage";
import AdminPage from "./routes/system/AdminPage";
import AboutUs from "./routes/main/AboutUs";
import Contact from "./routes/main/Contact";
import Login from "./routes/main/Login";
import Register from "./routes/main/Register";
import FAQ from "./routes/main/FAQ.jsx";
import Profile from "./routes/user/Profile";
import EditProfile from "./routes/user/EditProfile";
import Feeds from "./routes/user/Feeds";
import Post from "./routes/user/Post";
import CreateAction from "./routes/user/CreateAction";
import BoardPage from "./routes/user/BoardPage";
import ExploreBoards from "./routes/user/components/ExploreBoards";
import ExploreDescs from "./routes/user/components/ExploreDescs";
import EditBoard from "./routes/user/EditBoard";
import BoardMembers from "./routes/user/BoardMembers";
import DescMembers from "./routes/user/DescMembers";
import DescPage from "./routes/user/DescPage";
import TestDrafts from "./routes/user/TestDrafts";
import Playground from "./routes/user/Playground";
import SearchPage from "./routes/user/SearchPage";
import { TestPage } from "./routes/user/test/TestPage";
import AsidePanel from "./components/AsidePanel";
import Terms from "./routes/user/Terms";
import ResetPassword from "./routes/main/ResetPassword";
import EditDesc from "./routes/user/EditDesc";
import CreateTestAsAdmin from "./routes/system/CreateTestAsAdmin";
import { useSelector } from "react-redux";
import ReportsPage from "./routes/system/ReportsPage.jsx";

const App = () => {
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

  return (
    <Routes>
      <Route path="/about" element={<AboutUs />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<Register />} />
      <Route element={<UserPage />}>
        <Route path="profile" element={<Profile isMyProfile={true} />} />
        <Route path="profile/edit" element={<EditProfile />} />
        <Route
          path="u/:username"
          element={<Profile isMyProfile={false} />}
        />
        <Route path="/" element={<Feeds />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route
          path="b/:community/post/:itemId"
          element={<Post itemType={"post"} />}
        />
        <Route
          path="d/:community/test/:itemId"
          element={<Post itemType={"test"} />}
        />
        <Route path="create/:action" element={<CreateAction />} />
        <Route path="b/all" element={<ExploreBoards />} />
        <Route path="d/all" element={<ExploreDescs />} />
        <Route path="test/drafts" element={<TestDrafts />} />
        <Route path="b/:boardId" element={<BoardPage />} />
        <Route path="b/:boardId/members" element={<BoardMembers />} />
        <Route path="d/:descId/members" element={<DescMembers />} />
        <Route path="b/:boardId/edit" element={<EditBoard />} />
        <Route path="d/:descId/edit" element={<EditDesc />} />
        <Route path="d/:descId" element={<DescPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/explore" element={<AsidePanel />} />
        <Route path="/faq" element={<FAQ />} />
      </Route>
      <Route path="/terms" element={<Terms />} />
      <Route path="d/:descId/tests/:testId/start" element={<TestPage />} />
      <Route path="/system" element={<AdminPage />}>
        <Route index element={<div className="p-6"><h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Admin Dashboard</h1></div>} />
        <Route path="create/test" element={<CreateTestAsAdmin />} />
        <Route path="reports" element={<ReportsPage />} />

      </Route>
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/playground" element={<Playground />} />
    </Routes>
  );
};

export default App;
