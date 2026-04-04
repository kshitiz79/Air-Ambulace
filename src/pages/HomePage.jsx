import React from 'react';
import { Phone, Clock, Shield, Heart, MapPin, Users, CheckCircle, Star, User ,  ExternalLink  } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import WhatsAppChatbot from '../components/WhatsAppChatbot';
import { FaClock, FaPhoneAlt } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

// Blinking yellow→red phone number component
const BlinkNumber = ({ children, className = '' }) => (
  <span
    className={`inline-block font-black animate-blink-yr ${className}`}
    style={{ animationDuration: '0.9s' }}
  >
    {children}
  </span>
);

// Inject keyframes once
const blinkStyle = `
  @keyframes blinkYR {
    0%, 100% { color: #FACC15; }   /* yellow-400 */
    50%       { color: #DC2626; }   /* red-600    */
  }
  .animate-blink-yr { animation: blinkYR 0.9s step-start infinite; }
`;

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

              {/* Toll Free - Hidden on Mobile */}
              <div className="hidden lg:flex items-center space-x-2 border-r pr-4 border-slate-200">
                <FaPhoneAlt className="text-blue-900 text-sm"/>
                <div className="leading-tight">
                  <p className="text-[10px] text-blue-900 font-medium uppercase">{t.tollFree || 'TOLL FREE'}</p>
                  <p className="text-sm text-blue-900 font-bold">
                    <a href="tel:18002332004"><BlinkNumber>1800 233 2004</BlinkNumber></a>
                    {' / '}
                    <a href="tel:919319208927"><BlinkNumber>93192 08927</BlinkNumber></a>
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/sign-in")}
                className="flex items-center bg-blue-900 text-white px-3 sm:px-6 py-1.5 sm:py-2 text-[11px] sm:text-sm rounded-lg hover:bg-blue-800 transition-all font-bold shadow-md shadow-blue-100"
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
<div className="relative min-h-[75vh] bg-[#011537] text-white overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-stretch">





<div className="space-y-10 relative z-10  flex flex-col justify-center ">

{/* Leaders Section */}
<div className="relative flex items-end gap-8 justify-end  bg-gradient-to-r from-orange-500 via-orange-300 to-white/90 border border-white/20 rounded-xl">

  {/* Background Accent */}
<div className="absolute -inset-4 bg-gradient-to-r from-orange-400/10 via-transparent to-green-500/30 rounded-xl blur-2xl opacity-70"></div>

  {/* PM (Primary Focus) */}



  <div className="relative z-10 group">
    <div className="relative">
      <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition duration-300"></div>
      <img
        src="/pm.png"
        alt="PM Narendra Modi"
        className="relative h-36 sm:h-44 md:h-72 w-auto object-contain rounded-xl shadow-xl "
      />
    </div>
  </div>


    <div className="relative z-10 group -ml-4 md:-ml-6">
    <div className="relative">
      <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 group-hover:opacity-40 transition duration-300"></div>
      <img
        src="/cmmp.png"
        alt="CM Mohan Yadav"
        className="relative h-32 sm:h-40 md:h-64 w-auto object-contain rounded-xl shadow-lg  "
      />
    </div>
  </div>
  
  {/* CM (Secondary) */}


</div>
  {/* Promo Card */}
  <div className="relative overflow-hidden rounded-2xl p-6  bg-gradient-to-r from-[#4D6500] to-[#F19100] border border-white/20 shadow-xl group transition">

    {/* Glow Effect */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-white/10"></div>

    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">

      {/* Text Content */}
      <div className="flex-1 text-white">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 flex items-center">

          {t.freeEmergencyAirTransport || "Free Air Transport"}
        </h2>

        <p className="text-sm sm:text-base text-white/90 leading-relaxed">
          {t.ayushmanCardDesc ||
            "Free air transport facility for treatment in Ayushman listed hospitals for eligible card holders."}
        </p>
      </div>

      {/* Image */}
      <div className="w-1/2 sm:w-1/3 md:w-36 lg:w-44 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
        <img
          src="./Ayushman.png"
          alt="Ayushman Card"
          className="w-full h-auto object-contain drop-shadow-lg"
        />
      </div>

    </div>
  </div>

</div>

          {/* Right Column: Visual Component */}
      {/* Right Column: Visual Component */}
<div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-3xl h-full">
  <div
    className="h-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[500px] bg-center bg-cover"
    style={{ backgroundImage: "url('/bg-image2.png')" }}
  >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>

            {/* Support Badge */}
            <div className="absolute top-4 right-4">
              <div className="bg-green-600/90 backdrop-blur-md text-white text-xs sm:text-sm px-4 py-2 rounded-full flex items-center gap-2 font-bold shadow-lg border border-green-400/30">
                <FaClock className="animate-pulse" />
                {t.support247 || '24×7 SUPPORT'}
              </div>
            </div>

            {/* Phone Badge */}
            <div className="absolute bottom-6 left-1/2 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 bg-white/95 backdrop-blur-md shadow-2xl px-6 py-4 rounded-3xl flex items-center gap-4 border border-blue-50/50">
              <div className="bg-blue-900 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
                <FaPhoneAlt className="text-lg"/>
              </div>
              <div className="leading-tight">
                <p className="text-[10px] tracking-widest text-blue-600 font-black uppercase mb-1">
                  {t.tollFree || 'TOLL FREE'}
                </p>
                <p className="text-base sm:text-lg font-black text-blue-950">
                  <a href="tel:18002332004"><BlinkNumber>1800 233 2004</BlinkNumber></a>
                </p>
                <p className="text-xs text-slate-500 font-bold">
                  <a href="tel:919319208927"><BlinkNumber>+91 93192 08927</BlinkNumber></a>
                </p>
              </div>
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
      description: t.step1Desc || <span>Call <BlinkNumber>18002332004</BlinkNumber> or email airambulance@flyolaindia.com for immediate assistance</span>
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

<div className="mt-10 sm:mt-14 md:mt-16 bg-gradient-to-r from-red-600 via-red-600 to-red-700 rounded-2xl p-6 sm:p-8 text-white text-center shadow-xl relative overflow-hidden">

  {/* Glow Effect */}
  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>

  <h3 className="relative text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 tracking-wide">
    {t.emergencyDontWait || "Emergency? Don't Wait!"}
  </h3>

  <p className="relative text-sm sm:text-base md:text-lg mb-5 sm:mb-7 text-red-100 max-w-2xl mx-auto">
    {t.emergencyDontWaitDesc || 
      'In critical situations, every second counts. Contact us immediately for rapid response.'}
  </p>

  <div className="relative flex flex-col sm:flex-row flex-wrap justify-center gap-4">

    {/* 📞 Call Button */}
    <a
      href="tel:18002332004"
      className="bg-white text-red-600 font-semibold py-3 px-6 sm:px-8 rounded-full hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base shadow-md hover:scale-105"
    >
      <Phone size={18} />
      {t.callNow || 'Call Now'}
    </a>

    {/* 💬 WhatsApp Button */}
    <a
      href="https://wa.me/919319208927?text=Hello%20I%20need%20air%20ambulance%20assistance"
      target="_blank"
      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 sm:px-8 rounded-full transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base shadow-md hover:scale-105"
    >
      💬 WhatsApp Now
    </a>

  </div>

  {/* 📢 Extra Trust Line */}
  <p className="relative mt-5 text-xs sm:text-sm text-red-200">
    24/7 Emergency Support • Fast Response • Trusted Service
  </p>

</div>
        
      </div>
    </div>
  );
};



const Footer = () => {
  const { t, language } = useLanguage();
  
  const bannerImg = language === 'hi' ? '/AIRhindi.jpg' : '/AIR_English))).jpg';

  return (
    <footer className="bg-white text-gray-800">
      {/* Top Banner Image Section */}
      <div className="w-full border-t-4 border-blue-600">
        <img 
          src={bannerImg} 
          alt="PM Shri Air Ambulance Banner" 
          className="w-full h-auto object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8 pb-8 border-b border-gray-200">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-4 mb-6">
              <img 
                src="/download.png" 
                alt="MP Government Logo" 
                className="h-16 w-16 object-contain"
              />
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-blue-900 leading-tight">
                  {t.pmShriAirAmbulance}
                </h3>
                <h4 className="text-lg font-semibold text-blue-800">
                  {t.governmentOfMP}
                </h4>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t.footerDesc}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">{t.quickLinks}</h3>
            <ul className="space-y-4 text-gray-600 text-sm">
              <li>
                <a href="#about" className="hover:text-blue-600 transition-colors border-b border-transparent hover:border-blue-600 pb-0.5">
                  {t.aboutTheScheme}
                </a>
              </li>
              <li>
                <a href="#eligibility" className="hover:text-blue-600 transition-colors border-b border-transparent hover:border-blue-600 pb-0.5">
                  {t.eligibilityCriteria}
                </a>
              </li>
              <li>
                <a href="#steps" className="hover:text-blue-600 transition-colors border-b border-transparent hover:border-blue-600 pb-0.5">
                  {t.howItWorks}
                </a>
              </li>
            </ul>
          </div>

          {/* Government Portals */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">{t.governmentPortals}</h3>
            <ul className="space-y-4 text-gray-600 text-sm">
              <li>
                <a href="https://mp.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors border-b border-transparent hover:border-blue-600 pb-0.5">
                  {t.mpGovernment}
                </a>
              </li>
              <li>
                <a href="https://health.mp.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors border-b border-transparent hover:border-blue-600 pb-0.5">
                  {t.mpHealthDept}
                </a>
              </li>
              <li>
                <a href="https://pmjay.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors border-b border-transparent hover:border-blue-600 pb-0.5">
                  {t.ayushmanBharat}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">{t.contactUs}</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500 mb-2 font-medium">{t.tollFreeEmergency}</p>
                <div className="inline-block bg-red-600 text-white px-6 py-2.5 rounded-full font-bold text-lg shadow-md">
                  <a href="tel:18002332004" className="hover:text-red-50">1800 233 2004</a>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-gray-500 mb-1 font-medium">{t.email}</p>
                <a href="mailto:airambulance@flyolaindia.com" className="text-blue-600 hover:text-blue-800 font-medium break-all border-b border-blue-600/30 hover:border-blue-600 transition-all">
                  airambulance@flyolaindia.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4">
          <div className="text-gray-500 text-xs text-center md:text-left leading-relaxed">
            <p className="mb-1 italic">
              © 2025 {t.pmShriAirAmbulance}. {t.allRightsReserved}
            </p>
            <p>{t.operatedBy}</p>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
            <span className="text-gray-500 text-xs font-medium">{t.poweredBy}</span>
            <a 
              href="https://rbshstudio.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-800 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              <span className="font-bold text-sm tracking-tight text-gray-700">RBSH <span className="text-blue-600">Studio</span></span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};


const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <style>{blinkStyle}</style>
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