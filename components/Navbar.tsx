"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProfileDropdown from "@/components/ProfileDropdown";
import MobileLogoutButton from "@/components/MobileLogoutButton";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const allNavLinks = [
    { href: "/", label: "Home" },
    { href: "/earrings", label: "Earrings" },
    { href: "/cap", label: "Cap" },
    { href: "/glooves", label: "Glooves" },
    { href: "/keyring", label: "Keyring" },
    { href: "/my-purchases", label: "My Purchases" },
  ];

  // Show only Home when not logged in, show all links when logged in
  const navLinks = user 
    ? allNavLinks 
    : allNavLinks.filter(link => link.href === "/");

  return (
    <nav className="sticky top-0 z-50 bg-beige/95 backdrop-blur-sm border-b border-brown/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-brown">LYKKE</span>
                <span className="text-2xl font-bold text-brown">LOOP</span>
              </div>
              {/* Curved smile */}
              <svg
                className="absolute -bottom-1 left-0 w-20 h-3 text-brown"
                viewBox="0 0 80 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M5 8 Q40 2 75 8" />
              </svg>
              {/* Hanging earring hoop */}
              <div className="absolute -bottom-3 right-6 w-4 h-4 border-2 border-brown rounded-full group-hover:scale-110 transition-transform">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 border border-brown rounded-full"></div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-brown hover:text-rose transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center space-x-4 ml-4">
              {loading ? (
                <div className="w-20 h-8 bg-beige rounded animate-pulse"></div>
              ) : user ? (
                <ProfileDropdown />
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 border-2 border-brown rounded-full text-brown hover:bg-brown hover:text-beige transition-colors font-medium"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-brown"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 animate-in slide-in-from-top">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block text-brown hover:text-rose transition-colors font-medium py-2"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col space-y-2 pt-4 border-t border-brown/10">
              {loading ? (
                <div className="h-10 bg-beige rounded animate-pulse"></div>
              ) : user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 border-2 border-brown rounded-full text-brown hover:bg-brown hover:text-beige transition-colors font-medium text-center"
                  >
                    Profile
                  </Link>
                  <MobileLogoutButton onClose={() => setIsMenuOpen(false)} />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 border-2 border-brown rounded-full text-brown hover:bg-brown hover:text-beige transition-colors font-medium text-center"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium text-center"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

