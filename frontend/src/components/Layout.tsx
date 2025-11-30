import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { Role } from "@/types";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuthStore();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    {
      to: "/",
      label: t("nav.dashboard"),
      icon: "📊",
      roles: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    },
    {
      to: "/products",
      label: t("nav.products"),
      icon: "📦",
      roles: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    },
    {
      to: "/inventory",
      label: t("nav.inventory"),
      icon: "📋",
      roles: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    },
    {
      to: "/scanner",
      label: t("nav.scanner"),
      icon: "📷",
      roles: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    },
    {
      to: "/production-orders",
      label: t("nav.productionOrders") || "Production Orders",
      icon: "🏭",
      roles: [Role.ADMIN, Role.MANAGER],
    },
    {
      to: "/transactions",
      label: t("nav.transactions"),
      icon: "📝",
      roles: [Role.ADMIN, Role.MANAGER, Role.STAFF],
    },
    { to: "/users", label: t("nav.users"), icon: "👥", roles: [Role.ADMIN] },
    {
      to: "/reports",
      label: t("nav.reports"),
      icon: "📊",
      roles: [Role.ADMIN],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <img
                src="/src/assets/images/logo-skp.webp"
                alt="SKP Logo"
                className="h-12"
              />
            </div>

            {/* User Info, Language Switcher & Logout */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded">
                  {user?.role}
                </span>
              </div>

              {/* Language Switcher */}
              <button
                onClick={() => {
                  const newLang = language === "th" ? "en" : "th";
                  setLanguage(newLang);
                }}
                className="btn btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1"
                title={
                  language === "th" ? "Switch to English" : "เปลี่ยนเป็นไทย"
                }
              >
                <span className="text-sm">
                  {language === "en" ? "🇬🇧" : "🇹🇭"}
                </span>
                <span className="hidden sm:inline">
                  {language === "en" ? "EN" : "TH"}
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="btn btn-secondary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
              >
                {t("auth.logout")}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-4 space-y-1">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}

              {/* Mobile User Info */}
              <div className="sm:hidden pt-4 mt-4 border-t border-gray-200">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                  <span className="inline-block mt-2 text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
                    {user?.role}
                  </span>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 bg-gradient-to-b from-[#219C4A]/10 via-white to-white shadow-lg fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-gray-100">
          {/* User Profile Card */}
          <div className="p-6 bg-gradient-to-br from-[#219C4A] to-[#1a7d3a] text-white mx-4 mt-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-bold border-2 border-white/30">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-white/80 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5 mt-2">
            {filteredNavItems.map((item, index) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#219C4A] to-[#1a7d3a] text-white shadow-lg shadow-green-500/30 scale-[1.02]"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:scale-[1.01] hover:shadow-sm"
                  }`
                }
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
                {/* Active Indicator */}
                <span className={`ml-auto w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  ({ isActive }: { isActive: boolean }) => isActive ? 'bg-white scale-100' : 'bg-transparent scale-0'
                }`} />
              </NavLink>
            ))}
          </nav>

          {/* Footer Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 to-transparent">
            <div className="text-center text-xs text-gray-500">
              <p className="font-medium">SKP Stock System</p>
              <p className="text-[10px] mt-1">v2.0.0 © 2024</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-72">{children}</main>
      </div>
    </div>
  );
};
