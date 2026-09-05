import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useGetMeQuery } from "../../services/userApi";
import { useAmILoggedInQuery } from "../../services/authApi.js";
import { useDispatch, useSelector } from "react-redux";
import {
  setProfileData,
  setProfileError,
  setProfileLoading,
} from "../../app/myProfileSlice.js";
import { setIsAuthenticated } from "../../app/authSlice.js";
import Loading from "../../components/Loading";
import NotFound from "../../components/NotFound";

const AdminPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { data, error, isLoading } = useGetMeQuery(undefined, {
    skip: isAuthenticated !== true,
  });
  const { data: loginStatus } = useAmILoggedInQuery();

  // When query state changes, update Redux slice
  useEffect(() => {
    dispatch(setProfileLoading(isLoading));
    if (data) {
      dispatch(setProfileData(data.data));
    }

    if (error) {
      dispatch(setProfileError(error));
    }
  }, [isLoading, data, error, dispatch]);

  useEffect(() => {
    if (loginStatus === undefined) return;
    dispatch(setIsAuthenticated(loginStatus.isAuthenticated));
  }, [loginStatus, dispatch]);

  if (isLoading) return <Loading />;
  if (data?.data?.has_privileges === false) return <NotFound />;

  return (
    <div className="relative h-full md:min-h-screen grid grid-cols-12 dark:bg-neutral-950">
      {/* Left Sidebar */}
      <aside className="col-span-12 md:col-span-4 lg:col-span-3 xl:col-span-3 border-r border-neutral-200 dark:border-neutral-700 md:h-screen md:sticky md:top-0 overflow-y-scroll scrollbar-hide">
        <AdminSidebar />
      </aside>

      {/* Main Section */}
      <main className="col-span-12 md:col-span-8 lg:col-span-9 xl:col-span-9">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPage;
