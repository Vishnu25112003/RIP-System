import type React from "react"
import { CheckCircle } from "lucide-react"

const AboutUs: React.FC = () => {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Why Choose Us */}
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Us?</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Quality Partnerships</h3>
                  <p className="text-gray-600">
                    We partner with leading companies to provide meaningful internship experiences.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Remote Flexibility</h3>
                  <p className="text-gray-600">Work from anywhere while gaining valuable professional experience.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Career Growth</h3>
                  <p className="text-gray-600">Build your skills and network with industry professionals.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Certification</h3>
                  <p className="text-gray-600">Earn recognized certificates to boost your resume.</p>
                </div>
              </div>
            </div>
          </div>
          {/* About Me */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About Me</h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Hello! I'm passionate about connecting talented individuals with meaningful opportunities. With over 8
                years of experience in the tech industry, I've seen firsthand how remote internships can transform
                careers and open doors to incredible possibilities.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our mission is to democratize access to quality internship experiences, regardless of geographic
                location. We believe that talent is everywhere, but opportunity isn't – and we're here to change that.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Through InternPortal, we've helped thousands of students and recent graduates kickstart their careers
                while enabling companies to discover fresh talent from around the globe.
              </p>
              <div className="mt-6">
                <p className="text-lg font-semibold text-blue-600">Let's build the future of work together!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUs
