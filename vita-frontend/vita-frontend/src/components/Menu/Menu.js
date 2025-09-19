"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";
import MenuLogo from "../MenuLogo/MenuLogo";

const Menu = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  // Menü ögeleri
  const menuItems = [
    {
      name: "Ana Sayfa",
      path: "/home",
      icon: "home",
    },
    {
      name: "Görevler",
      path: "/tasks",
      icon: "checklist",
    },
    {
      name: "Takvim",
      path: "/calendar",
      icon: "calendar_month",
    },
    {
      name: "Notlar",
      path: "/notes",
      icon: "format_list_bulleted",
    },
    {
      name: "Pomodoro",
      path: "/pomodoro",
      icon: "alarm_on",
    },
    {
      name: "Ayarlar",
      path: "/settings",
      icon: "settings",
    },
  ];

  // Çıkış işlemi
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/logout");
    } catch (error) {
      // Handle error silently in production
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#f3f3f3] dark:bg-[#36373a] pt-6 w-[240px]">
      <div className="mb-12 mr-6">
        <MenuLogo />
      </div>

      {/* Menü ögeleri */}
      <nav className="flex-1 w-full max-w-[200px]">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`
                  group flex items-center px-4 py-3 rounded-lg transition-colors text-sm
                  ${
                    pathname === item.path
                      ? "bg-white dark:bg-[#26282b] text-[#26282b] dark:text-white shadow-sm font-medium"
                      : "hover:bg-white/70 dark:hover:bg-[#26282b]/70 text-gray-700 dark:text-gray-300"
                  }
                `}
              >
                <span className="material-icons-round mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Çıkış butonu */}
      <div className="mt-auto w-full max-w-[200px] px-3 mb-4">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-3 rounded-lg transition-colors text-sm w-full hover:bg-white/70 dark:hover:bg-[#26282b]/70 text-gray-700 dark:text-gray-300"
        >
          <span className="material-icons-round mr-3">logout</span>
          <span>Çıkış Yap</span>
        </button>
      </div>

      {/* Alt bilgi */}
      <div className="py-4 w-full max-w-[200px] border-t border-gray-200 dark:border-gray-700 flex justify-center">
        <div className="text-xs text-gray-500 dark:text-gray-400 pr-8">
          © {new Date().getFullYear()} Vita
        </div>
      </div>
    </div>
  );
};

export default Menu;
