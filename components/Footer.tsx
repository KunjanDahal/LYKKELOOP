import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-brown/5 border-t border-brown/10 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 max-w-4xl mx-auto">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-brown">LYKKE</span>
              <span className="text-xl font-bold text-brown">LOOP</span>
            </div>
            <p className="text-sm text-brown/70">
              Affordable, trendy earrings and accessories for everyday wear in Denmark.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col md:items-end space-y-2">
            <Link href="#faq" className="text-sm text-brown/70 hover:text-rose transition-colors">
              FAQ
            </Link>
            <Link href="#contact" className="text-sm text-brown/70 hover:text-rose transition-colors">
              Contact
            </Link>
            <Link href="#privacy" className="text-sm text-brown/70 hover:text-rose transition-colors">
              Privacy
            </Link>
          </div>
        </div>

        <div className="border-t border-brown/10 pt-8 text-center">
          <p className="text-sm text-brown/70">
            © LykkeLoop, All rights reserved. Made with hygge in Denmark.
          </p>
        </div>
      </div>
    </footer>
  );
}

