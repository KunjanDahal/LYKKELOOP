"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const isLoginPage = pathname === "/admin/login";

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (response.ok) {
        showToast("Logged out successfully", "success");
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      showToast("Failed to logout", "error");
    }
  };

  return (
    <div className="min-h-screen bg-beige">
      {/* Admin Header */}
      <header className="bg-white border-b border-brown/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
              {!isLoginPage ? (
                <Link
                  href="/admin"
                  className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <span className="text-lg sm:text-xl font-bold text-brown">LYKKE</span>
                  <span className="text-lg sm:text-xl font-bold text-brown">LOOP</span>
                  <span className="text-brown/60 ml-2 text-sm sm:text-base">Admin</span>
                </Link>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-lg sm:text-xl font-bold text-brown">LYKKE</span>
                  <span className="text-lg sm:text-xl font-bold text-brown">LOOP</span>
                  <span className="text-brown/60 ml-2 text-sm sm:text-base">Admin</span>
                </div>
              )}
              {!isLoginPage && (
                <nav className="flex items-center space-x-2 sm:space-x-4 flex-wrap">
                  <Link
                    href="/admin/products"
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-sm sm:text-base transition-colors ${
                      pathname === "/admin/products"
                        ? "bg-rose text-white"
                        : "text-brown hover:bg-brown/10"
                    }`}
                  >
                    Products
                  </Link>
                  <Link
                    href="/admin/users"
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-sm sm:text-base transition-colors ${
                      pathname === "/admin/users"
                        ? "bg-rose text-white"
                        : "text-brown hover:bg-brown/10"
                    }`}
                  >
                    Users
                  </Link>
                  <Link
                    href="/admin/messages"
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-sm sm:text-base transition-colors relative ${
                      pathname === "/admin/messages"
                        ? "bg-rose text-white"
                        : "text-brown hover:bg-brown/10"
                    }`}
                  >
                    Messages
                  </Link>
                </nav>
              )}
            </div>
            {!isLoginPage && (
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium text-sm sm:text-base self-start sm:self-auto"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto px-3 sm:px-4 py-3 sm:py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}


