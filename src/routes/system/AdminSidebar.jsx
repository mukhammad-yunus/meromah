import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  Bug,
  ChevronRight,
  FileEdit,
  Menu,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import { logoDark } from "../../assets/index.js";

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

const AdminSidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const sidebarMobileRef = useRef(null);

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

  const adminMenuItems = [
    { label: "Create Test", path: "/system/create/test", icon: FileEdit },
    { label: "Reports", path: "/system/reports", icon: Bug },
  ];

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
                <img src={logo} alt="UnimeSpace logo" className="dark:hidden"/>
                <img src={logoDark} alt="UnimeSpace logo" className="hidden dark:inline" />
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
                <img src={logo} alt="UnimeSpace logo" className="dark:hidden"/>
                <img src={logoDark} alt="UnimeSpace logo" className="hidden dark:inline" />
              </div>
              <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 select-none">
                UnimeSpace
              </span>
            </div>
          </Link>
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
            <div className="space-y-1">
              <div className="mb-3">
                <h2 className="px-3 py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                  Admin Actions
                </h2>
              </div>
              <div className="space-y-0.5">
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <MenuLink
                      icon={Icon}
                      label={item.label}
                      onClick={closeMobileMenu}
                      to={item.path}
                      key={item.path}
                    />
                  );
                })}
              </div>
              <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-2" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;

