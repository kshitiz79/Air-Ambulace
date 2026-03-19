import React from 'react';
import { Phone, Clock, Shield, Heart, MapPin, Users, CheckCircle, Star, User ,  ExternalLink  } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import WhatsAppChatbot from '../components/WhatsAppChatbot';
import { FaClock, FaPhoneAlt } from 'react-icons/fa';



import { useLanguage } from '../contexts/LanguageContext';

const Header1 = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  
  return (

<>


    <div className='py-1 w-full bg-gradient-to-r from-orange-600 via-white to-[#2A9300]' >  </div>
    <header className="bg-white shadow-sm border-b-2  sticky top-0 z-50">
      <div className="mx-auto px-3 sm:px-6 md:px-16 py-2 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
            {/* FLYOLA Logo */}
            {/* <div className="flex items-center">
              <img 
                src="./log.png" 
                alt="FLYOLA Logo" 
                className="h-8 sm:h-10 md:h-12 w-auto object-contain"
              />
            </div> */}

            {/* MP Government Logo */}
            <div className="flex items-center">
              <img 
                src="./download.png" 
                alt="MP Government Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 object-contain"
              />
            </div>

            {/* Title Text */}
            <div>
              <h1 className="text-xs sm:text-sm md:text-xl font-bold text-gray-900">
                  {t.pmShriAirAmbulance || 'PM Shri Air Ambulance'}
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-[#16306A] font-medium">
                  {t.governmentOfMP || 'Government of Madhya Pradesh'}
                </p>
            </div>
          </div>


          {/* Right Section: Language Switcher, Emergency Contact, Sign In */}
            <div className="flex items-center space-x-2 sm:space-x-5">
              
              {/* Language Switcher */}
              <div className="flex items-center rounded-lg border px-2 py-1 bg-slate-50 border-slate-200">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                    language === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    language === 'hi'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  हि
                </button>
              </div>

              <div className="hidden md:flex items-center space-x-2">
                <FaPhoneAlt className="text-blue-900 text-lg sm:text-2xl"/>
                <p className="text-[10px] sm:text-sm text-blue-900 leading-tight">{t.tollFree || 'TOLLFREE'} <br/> <span className="text-blue-900 text-xs sm:text-xl font-bold"> 18002332004</span></p>
              </div>

              <button
                onClick={() => navigate("/sign-in")}
                className="flex items-center border border-blue-900 text-blue-900 px-4 sm:px-10 py-1 sm:py-2 text-[10px] sm:text-sm rounded-md hover:bg-blue-900 hover:text-white transition-colors font-medium"
              >
                <span>{t.signIn || 'Sign In'}</span>
              </button>
            </div>









        </div>
      </div>
    </header>



    </>
  );
};
































const HeroSection = () => {
  const { t } = useLanguage();
  return (
    <div className="relative bg-[#011537] text-white overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">




          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* Logo Section */}
        

            <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">

              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[6rem] font-bold leading-tight">
                  {t.pmShriAirAmbulance || 'PM Shri Air Ambulance Service'}
                </h1>
                <p className="text-sm sm:text-lg md:text-xl lg:text-4xl text-red-100 mt-1 sm:mt-2">{t.emergencySituationHelp || 'Emergency Situation Help ...'}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#4D6500] to-[#F19100] z-10 rounded-xl absolute w-[700px] sm:rounded-2xl p-4 sm:p-6 border border-white/20 relative flex flex-col md:flex-row items-center gap-4 overflow-hidden">
              <div className="flex-1 relative z-10">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-4 flex items-center">
                  <Heart className="mr-2 sm:mr-3 text-red-300" size={20} />
                  <span className="text-sm sm:text-base md:text-xl">{t.freeEmergencyAirTransport || 'Free Emergency Air Transport'}</span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-red-100 leading-relaxed">
                  {t.ayushmanCardDesc || 'Free air transport facility for treatment in government and Ayushman listed hospitals within and outside the state for Ayushman card holders.'}
                </p>
              </div>
              <div className="w-1/2 md:w-4/12 flex justify-end right-0 -mb-16">
                <img className="w-full h-auto object-contain" src="./Ayushman.png" alt="Ayushman Card" />
              </div>
            </div>

          
          </div>

<div className="bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden rounded-lg relative">

  <div
    className="h-[70vh] bg-top bg-cover"
    style={{ backgroundImage: "url('/bg-image.png')" }}
  ></div>

  <div className="absolute top-4 right-4 animate-pulse">
    
    <p className="text-white text-md bg-green-500 px-3 py-1 rounded flex items-center gap-2">
       <FaClock/>  
 {t.support247 || '24×7 SUPPORT'}
    </p>
  </div>

  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-xl flex items-center gap-5 animate-pulse">
    <FaPhoneAlt className="text-orange-600 text-2xl"/>

    <p className="text-sm text-orange-600">
      {t.tollFree || 'TOLLFREE'} <br/>
      <span className="text-blue-900 text-2xl font-bold">
        18002332004
      </span>
    </p>
  </div>

</div>

        </div>
      </div>
    </div>
  );
};









const FeaturesSection = () => {
  const { t } = useLanguage();
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: t.feature1Title || "100% Free for Ayushman Cardholders",
      description: t.feature1Desc || "Complete free air ambulance service for all Ayushman card holders across Madhya Pradesh"
    },
    {
      icon: <Clock className="w-8 h-8 text-green-600" />,
      title: t.feature2Title || "24/7 Emergency Response",
      description: t.feature2Desc || "Round-the-clock availability with rapid response times for critical medical emergencies"
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: t.feature3Title || "Advanced Medical Equipment",
      description: t.feature3Desc || "State-of-the-art life support systems and medical equipment in every aircraft"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: t.feature4Title || "Expert Medical Team",
      description: t.feature4Desc || "Trained doctors with Fellowship in Aeromedical Sciences and skilled paramedics"
    },
    {
      icon: <MapPin className="w-8 h-8 text-orange-600" />,
      title: t.feature5Title || "Statewide Coverage",
      description: t.feature5Desc || "Service available across all districts of Madhya Pradesh, including remote areas"
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-600" />,
      title: t.feature6Title || "Government Approved",
      description: t.feature6Desc || "Official government scheme launched by CM Shri Mohan Yadav on May 29, 2024"
    }
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.serviceFeatures || 'Service Features'}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.serviceFeaturesDesc || 'Advanced air ambulance services with comprehensive medical care and government support'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-sm transition-all duration-300 border border-gray-100 hover:border-red-200">
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
  const { t } = useLanguage();
  const steps = [
    {
      step: "1",
      title: t.step1Title || "Initial Contact",
      description: t.step1Desc || "Call 18002332004 or visit official website for immediate assistance"
    },
    {
      step: "2",
      title: t.step2Title || "Verification",
      description: t.step2Desc || "Provide Ayushman Card details and patient information for eligibility verification"
    },
    {
      step: "3",
      title: t.step3Title || "Medical Assessment",
      description: t.step3Desc || "Share detailed patient medical condition for appropriate medical preparations"
    },
    {
      step: "4",
      title: t.step4Title || "Dispatch & Transport",
      description: t.step4Desc || "Air ambulance dispatched to location with specialized medical team onboard"
    }
  ];

  return (
    <div className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">{t.howToBook || 'How to Book Air Ambulance'}</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">{t.howToBookDesc || 'Simple 4-step process for emergency medical transport'}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-red-600 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-bold mb-4 sm:mb-6 mx-auto">
                {step.step}
              </div>
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">{step.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-1/2 transform translate-x-6 w-full h-0.5 bg-red-200"></div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-12 md:mt-16 bg-gradient-to-r from-red-600 to-red-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{t.emergencyDontWait || "Emergency? Don't Wait!"}</h3>
          <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 text-red-100">
            {t.emergencyDontWaitDesc || 'In critical situations, every second counts. Contact us immediately for rapid response.'}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
            <a href="tel:18002332004" className="bg-white text-red-600 font-bold py-3 px-6 sm:px-8 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center text-sm sm:text-base">
              <Phone className="mr-2" size={18} />
              {t.callNow || 'Call Now'}: 18002332004
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};



const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-6">


        {/* Bottom Section */}
        <div className="border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 pt-6">
            <div className="text-gray-400 text-sm">
              © 2025 {t.pmShriAirAmbulance || 'PM Shri Air Ambulance'}. {t.allRightsReserved || 'All rights reserved.'}
            </div>
            
            {/* Powered by RBSH */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">{t.poweredBy || 'Powered by'}</span>
              <a 
                href="https://rbshstudio.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span className="font-semibold">RBSH Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};


const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header1 />

      <HeroSection />
      <FeaturesSection />
      <BookingSection />
      <Footer />
      <WhatsAppChatbot />
    </div>
  );
};

export default HomePage;