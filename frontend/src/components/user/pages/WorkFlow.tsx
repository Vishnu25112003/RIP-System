import type React from "react"
import { Users, CheckCircle, Clock, Award } from "lucide-react"

const WorkFlow: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: "Register & Choose Your Domain",
      description:
        "Sign up and select from our wide range of internship domains that match your interests and career goals.",
      icon: <Users className="w-8 h-8" />,
    },
    {
      number: 2,
      title: "Get Verified by Admin",
      description: "Our admin team reviews your profile and verifies your credentials to ensure quality placements.",
      icon: <CheckCircle className="w-8 h-8" />,
    },
    {
      number: 3,
      title: "Start Internship with Daily Tasks",
      description:
        "Begin your internship journey with structured daily tasks and real-world projects to build your skills.",
      icon: <Clock className="w-8 h-8" />,
    },
    {
      number: 4,
      title: "Earn Completion Certificate",
      description: "Successfully complete your internship and receive a certificate to showcase your achievements.",
      icon: <Award className="w-8 h-8" />,
    },
  ]

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600">Simple steps to kickstart your internship journey</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-lg shadow-lg p-6 h-full hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full mb-4 mx-auto">
                  {step.icon}
                </div>
                <div className="text-center">
                  <div className="text-sm text-blue-600 font-semibold mb-2">STEP {step.number}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
              {/* Connecting Arrow */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                  <div className="w-0 h-0 border-l-4 border-l-purple-400 border-t-2 border-t-transparent border-b-2 border-b-transparent absolute right-0 top-1/2 transform -translate-y-1/2"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WorkFlow
