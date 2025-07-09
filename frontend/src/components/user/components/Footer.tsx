import type React from "react"
import { Facebook, Twitter, Instagram, Linkedin, Github, MapPin, Phone, Mail } from "lucide-react"

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold text-xl inline-block mb-4">
              InternPortal
            </div>
            <p className="text-gray-300 mb-4">
              Empowering the next generation of professionals through meaningful remote internship experiences.
            </p>
            <div className="flex space-x-4">
              <Facebook className="hover:text-blue-500 cursor-pointer transition-colors" size={24} />
              <Twitter className="hover:text-blue-400 cursor-pointer transition-colors" size={24} />
              <Instagram className="hover:text-pink-500 cursor-pointer transition-colors" size={24} />
              <Linkedin className="hover:text-blue-600 cursor-pointer transition-colors" size={24} />
              <Github className="hover:text-gray-400 cursor-pointer transition-colors" size={24} />
            </div>
          </div>
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-blue-400" />
                <span className="text-gray-300">123 Tech Street, Digital City</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-blue-400" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-blue-400" />
                <span className="text-gray-300">info@internportal.com</span>
              </div>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Internships
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  For Companies
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">&copy; 2025 InternPortal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
