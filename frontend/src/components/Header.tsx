import { FC, useState, useEffect } from "react";
import {
  FaBars,
  FaMoon,
  FaSun,
  FaSignOutAlt,
  FaUserShield,
} from "react-icons/fa";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

type Props = {
  toggleSidebar: () => void;
};

const Header: FC<Props> = ({ toggleSidebar }) => {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  return (
    <header className="flex justify-between items-center p-4 bg-card border-b border-border shadow-sm sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar}>
          <FaBars size={20} className="text-muted-foreground" />
        </button>
        <Link href="/">
          <h1 className="text-lg font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity">
            TrustLens
          </h1>
        </Link>
        <Link
          href="/complaints"
          className="hidden md:block text-sm font-medium text-muted-foreground hover:text-primary transition-colors ml-4"
        >
          Browse Complaints
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {isAdmin && (
          <Link href="/admin">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-semibold">
              <FaUserShield size={16} />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </Link>
        )}

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          {theme === "dark" ? (
            <FaSun size={20} className="text-yellow-400" />
          ) : (
            <FaMoon size={20} className="text-gray-600" />
          )}
        </button>

        {session && (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
            title="Sign Out"
          >
            <FaSignOutAlt size={20} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
