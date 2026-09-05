import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Grid3x3 as Grid,
  Book,
  Layers,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ExpandableSection from "../routes/user/components/ExpandableSection";
import { useLogoutMutation } from "../services/authApi.js";
import { useGetMyDescSubscriptionsQuery } from "../services/descSubscriptionsApi.js";
import { useGetMyBoardSubscriptionsQuery } from "../services/boardSubscriptionsApi.js";
import UserAvatar from "./UserAvatar";
import { FileEdit } from "lucide-react";
import { Info } from "lucide-react";
import { Search } from "lucide-react";
import { setSidebarMobileHeight } from "../app/uiSlice.js";
import logo from "../assets/logo.png";
import DarkModeSwitch from "./DarkModeSwitch.jsx";
import { logoDark } from "../assets/index.js";
const MenuLink = ({ to, label, icon: Icon, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-all group"
    >
      {Icon && (
        <Icon className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
      )}
      <span className="flex-1 text-left">{label}</span>
      <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
};
const getResourcesSection = (profileData) => {
  const resourcesSection = {
    id: "resources",
    title: "Resources",
    path: "",
    icon: Info,
    items: [
      {
        id: "faq",
        name: "FAQ",
        path: "/faq",
      },
      {
        id: "playground",
        name: "Python Playground",
        path: "/playground",
      },
      {
        id: "about",
        name: "About Us",
        path: "/about",
      },
      {
        id: "contact",
        path: "/contact",
        name: "Contact Us",
      },
    ],
  };
  if (!profileData || !profileData?.has_privileges) return resourcesSection;
  resourcesSection.items.unshift({
    id: "system",
    path: "/system",
    name: "System",
  });
  return resourcesSection;
};
const exploreData = [
  {
    id: "all-boards",
    title: "All Boards",
    path: "b/all",
    icon: Grid,
  },
  {
    id: "all-descs",
    title: "All Descs",
    path: "d/all",
    icon: Book,
  },
];

const createActionArr = [
  { label: "Community", path: "/create/community", icon: Grid },
  { label: "Post", path: "/create/post", icon: FileText },
  { label: "Test", path: "/create/test", icon: FileEdit },
  { label: "Drafts", path: "/test/drafts", icon: Layers },
];

const UserSidebar = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const userMenuRef = useRef(null);
  const sidebarMobileRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  //Getting data from Redux state
  const { sidebarMobileHeight } = useSelector((state) => state.ui);
  const { profileData, isProfileDataLoading, profileDataError } = useSelector(
    (state) => state.myProfile
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { list: recentList } = useSelector((state) => state.recentCommunities);

  const [logout] = useLogoutMutation();
  const { data: myDescSubscriptions } = useGetMyDescSubscriptionsQuery();
  const { data: myBoardSubscriptions } = useGetMyBoardSubscriptionsQuery();
  const recentSection = useMemo(
    () => ({
      id: "recent",
      title: "Recent",
      path: "",
      icon: false,
      items: recentList,
    }),
    [recentList]
  );
  const subscribedBoards = useMemo(
    () => ({
      id: "boards",
      title: "Boards",
      path: "/b",
      icon: Grid,
      // NOTE: I might change items based on what myBoardSubscriptions gets from the db
      items: myBoardSubscriptions ? myBoardSubscriptions.data : [],
    }),
    [myBoardSubscriptions]
  );
  const subscribedDescs = useMemo(
    () => ({
      id: "descs",
      title: "Descs",
      path: "/d",
      icon: Book,
      // NOTE: I might change items based on what myDescSubscriptions gets from the db
      items: myDescSubscriptions ? myDescSubscriptions.data : [],
    }),
    [myDescSubscriptions]
  );
  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleSection = useCallback((id) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);
  const handleLogout = async () => {
    await logout();
  };
  useLayoutEffect(() => {
    if (!sidebarMobileRef.current) return;

    const ro = new ResizeObserver(([entry]) => {
      const newHeight = entry.contentRect.height;

      if (newHeight > 0 && sidebarMobileHeight !== newHeight) {
        dispatch(setSidebarMobileHeight({ height: newHeight }));
      }
    });

    ro.observe(sidebarMobileRef.current);
    return () => ro.disconnect();
  }, [dispatch]);

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/50 z-[95] lg:hidden animate-fade-in"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
      <div className="md:flex md:justify-between md:items-center">
        <div
          ref={sidebarMobileRef}
          className="md:hidden flex sticky top-0 justify-between items-center bg-white dark:bg-neutral-900 z-[90]"
        >
          {/* Logo Header - For Mobile devices */}
          <Link to="/home" className="flex-shrink-0 px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src={logo} alt="UnimeSpace logo" className="dark:hidden" />
                <img
                  src={logoDark}
                  alt="UnimeSpace logo"
                  className="hidden dark:inline"
                />
              </div>
              <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 select-none">
                UnimeSpace
              </span>
            </div>
          </Link>
          {/* Mobile Menu Toggle Button */}
          <button
            className="lg:hidden z-[100] p-2 rounded-lg hover:bg-primary-blue/10 dark:hover:bg-primary-blue/20 transition-colors duration-200 dark:text-neutral-100"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className="text-2xl text-neutral-900 dark:text-neutral-100" />
            ) : (
              <Menu className="text-2xl text-neutral-900 dark:text-neutral-100" />
            )}
          </button>
        </div>
        <div
          className={`fixed top-0 left-0 md:relative h-dvh w-72 md:w-full flex flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 z-[95] transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          {/* Logo Header */}
          <Link
            to="/home"
            className="flex-shrink-0 px-4 py-4 border-b border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src={logo} alt="UnimeSpace logo" className="dark:hidden" />
                <img
                  src={logoDark}
                  alt="UnimeSpace logo"
                  className="hidden dark:inline"
                />
              </div>
              <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 select-none">
                UnimeSpace
              </span>
            </div>
          </Link>
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
            {isAuthenticated && (
              <div className="space-y-1">
                {/* Create Button */}
                <div className="mb-3">
                  <button
                    onClick={() => setOpen(!open)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-all"
                  >
                    <span className="flex-1 text-left">Create new</span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-200 ease-out ${
                      open ? "max-h-48 opacity-100 mt-1" : "max-h-0 opacity-0"
                    } overflow-hidden`}
                  >
                    <div className="space-y-0.5 pl-2">
                      {createActionArr.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            to={item.path}
                            key={item.path}
                            onClick={closeMobileMenu}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg transition-all"
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {/* Divider */}
                <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-2" />
                {/* Section that displays user-followed boards, descs */}
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Joined Communities
                </p>
                <ExpandableSection
                  section={subscribedBoards}
                  isExpanded={expandedSections[subscribedBoards.id]}
                  toggleSection={toggleSection}
                  closeMobileMenu={closeMobileMenu}
                />
                <ExpandableSection
                  section={subscribedDescs}
                  isExpanded={expandedSections[subscribedDescs.id]}
                  toggleSection={toggleSection}
                  closeMobileMenu={closeMobileMenu}
                />
                <div className="h-px bg-neutral-200 dark:bg-neutral-700" />
              </div>
            )}
            {/* Recent communities */}
            <ExpandableSection
              section={recentSection}
              isExpanded={expandedSections["recent"]}
              toggleSection={toggleSection}
              closeMobileMenu={closeMobileMenu}
            />
            <div className="h-px bg-neutral-200 dark:bg-neutral-700" />
            <div className="py-1">
              <MenuLink
                icon={Search}
                label={"Explore"}
                onClick={toggleMobileMenu}
                to={"/explore/"}
                key={"explore"}
              />
              {exploreData.map((data) => (
                <MenuLink
                  icon={data.icon}
                  label={data.title}
                  onClick={toggleMobileMenu}
                  to={data.path}
                  key={data.id}
                />
              ))}
            </div>
            <div className="h-px bg-neutral-200 dark:bg-neutral-700" />
            <div>
              <ExpandableSection
                section={getResourcesSection(profileData)}
                isExpanded={expandedSections["resources"]}
                toggleSection={toggleSection}
                closeMobileMenu={closeMobileMenu}
              />
              {!isAuthenticated && <DarkModeSwitch />}
            </div>
          </div>
          {/* User Card at Bottom */}
          {isAuthenticated === undefined || isProfileDataLoading ? (
            <div className="flex-shrink-0 border-t border-neutral-200 dark:border-neutral-700 p-2">
              <div className="w-full flex items-center gap-3 px-2 py-3 rounded-lg">
                {/* Profile Image Skeleton */}
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse flex-shrink-0"></div>
                {/* Text Skeletons */}
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 animate-pulse"></div>
                </div>
                {/* Chevron Icon Skeleton */}
                <div className="w-4 h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse flex-shrink-0"></div>
              </div>
            </div>
          ) : isAuthenticated === true ? (
            <div
              className="flex-shrink-0 border-t border-neutral-200 dark:border-neutral-700 p-2 relative"
              ref={userMenuRef}
            >
              <button
                onClick={() =>
                  !isProfileDataLoading && setUserMenuOpen(!userMenuOpen)
                }
                className="w-full flex items-center gap-3 px-2 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-all group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                disabled={isProfileDataLoading}
              >
                {/* User Avatar */}
                <UserAvatar
                  hash={profileData?.avatar?.file_hash}
                  alt={profileData?.name || "User"}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {profileData?.name || "User"}
                  </p>
                  <Link
                    onClick={(e) => e.stopPropagation()}
                    to="profile"
                    className="text-xs text-neutral-500 dark:text-neutral-400 truncate cursor-pointer hover:underline"
                  >
                    u/{profileData?.username || "username"}
                  </Link>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 dark:text-neutral-500 flex-shrink-0 transition-transform duration-200 ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-2 right-2 mb-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg overflow-hidden z-[100]">
                  <div className="px-4 pt-3 pb-2 text-xs text-neutral-500 dark:text-neutral-400 truncate border-b border-neutral-200 dark:border-neutral-700">
                    {profileData?.email || "no email"}
                  </div>
                  <div className="p-1.5">
                    <Link
                      to="profile/edit"
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-neutral-700 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-all"
                    >
                      <button className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span>Edit profile</span>
                      </button>
                    </Link>
                    <DarkModeSwitch />
                  </div>
                  <div className="h-px bg-neutral-200 dark:bg-neutral-700 mx-1.5" />
                  <div className="p-1.5">
                    <button
                      className="w-full flex items-center px-3 py-2 text-sm text-neutral-700 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-all"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-2 px-4">
              <Link
                to="/login"
                className="block w-full py-2 px-4 rounded-lg bg-primary-blue text-white text-base font-medium text-center hover:bg-primary-blue/90 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 border border-primary-blue dark:border-neutral-100 transition-colors cursor-pointer"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserSidebar;
