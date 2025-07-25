import React from 'react';
import { Phone, Clock, Shield, Heart, MapPin, Users, CheckCircle, Star, Menu, User } from 'lucide-react';
import { useNavigate } from "react-router-dom";


const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="bg-white shadow-lg border-b-2 border-blue-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">पीएमश्री एयर एम्बुलेंस</h1>
                <p className="text-sm text-blue-600 font-medium">मध्यप्रदेश शासन</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Home</a>
            <a href="#services" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Services</a>
            <a href="#booking" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Book Now</a>
            <a href="#contact" className="text-gray-700 hover:text-red-600 font-medium transition-colors">Contact</a>
          </nav>

          {/* Sign In Button and Emergency Contact */}
          <div className="flex items-center space-x-4">
            <a href="tel:+919870560022" className="hidden sm:flex items-center bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors">
              <Phone size={16} className="mr-2" />
              <span className="text-sm font-medium">Emergency</span>
            </a>
            
          







    <button
      onClick={() => navigate("/sign-in")}
      className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
    >
      <User size={16} className="mr-2" />
      Sign In
    </button>




            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-gray-600 hover:text-red-600">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-center space-x-4 mb-6">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23ffffff' stroke='%23dc2626' stroke-width='4'/%3E%3Cpath d='M30 50h40M50 30v40' stroke='%23dc2626' stroke-width='6'/%3E%3C/svg%3E" alt="Medical Cross" className="w-12 h-12"/>
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  पीएमश्री एयर एम्बुलेंस सेवा
                </h1>
                <p className="text-xl lg:text-2xl text-red-100 mt-2">आपातकालीन स्थिति की सहायता</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <Heart className="mr-3 text-red-300" size={28} />
                Free Emergency Air Transport
              </h2>
              <p className="text-lg text-red-100 leading-relaxed">
                आयुष्मान कार्डधारकों के लिए राज्य के भीतर एवं बाहर के सरकारी व आयुष्मान सूची-बद्ध अस्पतालों में इलाज के लिए निःशुल्क हवाई परिवहन सुविधा।
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <a href="tel:+919870560022" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center">
                <Phone className="mr-2" size={20} />
                Emergency: 9870560022
              </a>
              <div className="bg-white/20 backdrop-blur-sm py-4 px-6 rounded-full flex items-center">
                <Clock className="mr-2 text-yellow-300" size={20} />
                24×7 Available
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f8fafc'/%3E%3Cpath d='M50 150 L200 100 L350 150 L200 200 Z' fill='%23dc2626' opacity='0.8'/%3E%3Ccircle cx='200' cy='150' r='30' fill='%23ffffff'/%3E%3Cpath d='M190 150h20M200 140v20' stroke='%23dc2626' stroke-width='3'/%3E%3Ctext x='200' y='250' text-anchor='middle' fill='%23374151' font-size='16' font-weight='bold'%3EAir Ambulance Service%3C/text%3E%3C/svg%3E" alt="Air Ambulance" className="w-full h-64 object-cover rounded-2xl"/>
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                <CheckCircle size={10} className="mr-1" />
                Operational
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "100% Free for Ayushman Cardholders",
      description: "Complete free air ambulance service for all Ayushman card holders across Madhya Pradesh"
    },
    {
      icon: <Clock className="w-8 h-8 text-green-600" />,
      title: "24/7 Emergency Response",
      description: "Round-the-clock availability with rapid response times for critical medical emergencies"
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Advanced Medical Equipment",
      description: "State-of-the-art life support systems and medical equipment in every aircraft"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Expert Medical Team",
      description: "Trained doctors with Fellowship in Aeromedical Sciences and skilled paramedics"
    },
    {
      icon: <MapPin className="w-8 h-8 text-orange-600" />,
      title: "Statewide Coverage",
      description: "Service available across all districts of Madhya Pradesh, including remote areas"
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-600" />,
      title: "Government Approved",
      description: "Official government scheme launched by CM Shri Mohan Yadav on May 29, 2024"
    }
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">सेवा की विशेषताएं</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced air ambulance services with comprehensive medical care and government support
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-red-200">
              <div className="flex items-center mb-4">
                {feature.icon}
                <h3 className="text-xl font-semibold text-gray-900 ml-3">{feature.title}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BookingSection = () => {
  const steps = [
    {
      step: "1",
      title: "Initial Contact",
      description: "Call +91 9870560022 or visit official website for immediate assistance"
    },
    {
      step: "2", 
      title: "Verification",
      description: "Provide Ayushman Card details and patient information for eligibility verification"
    },
    {
      step: "3",
      title: "Medical Assessment",
      description: "Share detailed patient medical condition for appropriate medical preparations"
    },
    {
      step: "4",
      title: "Dispatch & Transport",
      description: "Air ambulance dispatched to location with specialized medical team onboard"
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How to Book Air Ambulance</h2>
          <p className="text-xl text-gray-600">Simple 4-step process for emergency medical transport</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-6 mx-auto">
                {step.step}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-1/2 transform translate-x-6 w-full h-0.5 bg-red-200"></div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Emergency? Don't Wait!</h3>
          <p className="text-lg mb-6 text-red-100">
            In critical situations, every second counts. Contact us immediately for rapid response.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+919870560022" className="bg-white text-red-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors flex items-center">
              <Phone className="mr-2" size={20} />
              Call Now: 9870560022
            </a>
            <a href="tel:+919870500422" className="bg-red-800 text-white font-bold py-3 px-8 rounded-full hover:bg-red-900 transition-colors flex items-center">
              <Phone className="mr-2" size={20} />
              Alternate: 9870500422
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactSection = () => {
  return (
    <div className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-4xl font-bold mb-8">संपर्क जानकारी</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Phone className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Emergency Helpline</h3>
                  <p className="text-gray-300">+91 9870560022 (Primary)</p>
                  <p className="text-gray-300">+91 9870500422 (Secondary)</p>
                  <p className="text-gray-300">+91 9870001118 (Alternate)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <MapPin className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Service Area</h3>
                  <p className="text-gray-300">All districts of Madhya Pradesh</p>
                  <p className="text-gray-300">Base: Bhopal, Madhya Pradesh</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Clock className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Availability</h3>
                  <p className="text-gray-300">24 hours, 7 days a week</p>
                  <p className="text-gray-300">365 days emergency support</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-red-600/20 rounded-xl border border-red-500/30">
              <h3 className="text-lg font-semibold mb-3 text-red-300">Important Notice</h3>
              <p className="text-sm text-gray-300">
                For non-Ayushman cardholders, subsidized services are available. 
                Contact directly for more information about costs and procedures.
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-semibold mb-6">Service Statistics</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">8+</div>
                <div className="text-sm text-gray-300">Critical Patients Transferred</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">24/7</div>
                <div className="text-sm text-gray-300">Emergency Response</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">2</div>
                <div className="text-sm text-gray-300">Aircraft Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">100%</div>
                <div className="text-sm text-gray-300">Success Rate</div>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">Fleet Information</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span>Fixed-wing Aircraft</span>
                  <span className="text-green-400">Available</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span>Helicopter</span>
                  <span className="text-green-400">Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <BookingSection />
      <ContactSection />
    </div>
  );
};

export default HomePage;