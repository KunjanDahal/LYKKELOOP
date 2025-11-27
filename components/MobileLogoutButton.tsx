"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function MobileLogoutButton({ onClose }: { onClose: () => void }) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    onClose();
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium w-full"
    >
      Logout
    </button>
  );
}



