import { Mail, Phone } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-r from-[#1e3c72] to-[#2a5298] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">The Back Chair</h3>
            <p className="text-gray-200">
              Revolutionizing comfort with advanced ergonomic technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-200 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-200 hover:text-white transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="text-gray-200 hover:text-white transition-colors">
                  Warranty
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <a 
                href="mailto:thebackchairapp@gmail.com" 
                className="flex items-center gap-2 text-gray-200 hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5" />
                thebackchairapp@gmail.com
              </a>
              <a 
                href="tel:+1-555-123-4567" 
                className="flex items-center gap-2 text-gray-200 hover:text-white transition-colors"
              >
                <Phone className="h-5 w-5" />
                (555) 123-4567
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} The Back Chair. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
