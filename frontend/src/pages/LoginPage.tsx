import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useLanguage } from "@/contexts/LanguageContext";
import toast from "react-hot-toast";
import logoSKP from "@/assets/images/logo-skp.webp";
import landingImage from "@/assets/images/landing-image.webp";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { t } = useLanguage();
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  // Load saved credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ email, password });

      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      toast.success(t("auth.loginSuccess"));
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("auth.loginFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-500 p-4">
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Landing Image */}
        <div className="hidden lg:block lg:w-4/5">
          <img
            src={landingImage}
            alt="SKP Stock System"
            className="w-full h-full object-cover rounded-2xl shadow-2xl"
          />
        </div>

        {/* Login Form */}
        <div className="card w-full lg:w-2/5 p-6 sm:p-8 lg:p-10">
          <div className="text-center mb-6 sm:mb-8">
            <div className="mb-3">
              <img
                src={logoSKP}
                alt="SKP Logo"
                className="h-16 sm:h-20 mx-auto"
              />
            </div>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              {t("auth.signInToAccount")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("auth.email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input text-base"
                placeholder="admin@skp.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("auth.password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input text-base pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                {t("auth.rememberMe") || "Remember me"}
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary text-base py-3 font-semibold"
            >
              {isLoading
                ? `⏳ ${t("common.loading")}...`
                : `🔐 ${t("auth.signIn")}`}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-700 font-semibold mb-3">
              🎯 {t("auth.quickLogin")}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => quickLogin("admin@skp.com", "admin123")}
                className="w-full text-left px-3 py-2 bg-white rounded border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <p className="text-xs sm:text-sm font-medium text-gray-900">
                  👨‍💼 {t("users.admin")}
                </p>
                <p className="text-xs text-gray-600">admin@skp.com</p>
              </button>
              <button
                onClick={() => quickLogin("manager@skp.com", "manager123")}
                className="w-full text-left px-3 py-2 bg-white rounded border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <p className="text-xs sm:text-sm font-medium text-gray-900">
                  👔 {t("users.manager")}
                </p>
                <p className="text-xs text-gray-600">manager@skp.com</p>
              </button>
              <button
                onClick={() => quickLogin("staff@skp.com", "staff123")}
                className="w-full text-left px-3 py-2 bg-white rounded border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <p className="text-xs sm:text-sm font-medium text-gray-900">
                  👤 {t("users.staff")}
                </p>
                <p className="text-xs text-gray-600">staff@skp.com</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
