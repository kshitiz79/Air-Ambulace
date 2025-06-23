import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import React  from 'react';
const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Madhya Pradesh Air Ambulance Services</h1>
          <nav>
            <a href="#about" className="px-4 hover:underline">About</a>
            <a href="#services" className="px-4 hover:underline">Services</a>
            <a href="#contact" className="px-4 hover:underline">Contact</a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-blue-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Lifesaving Air Ambulance Services
            </h2>
            <p className="text-lg md:text-xl mb-8">
              Swift, reliable, and accessible medical transport under Ayushman Bharat.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              Get Started
            </button>
          </div>
        </section>

        <section id="about" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-3xl font-semibold text-center mb-8">About Us</h3>
            <p className="text-gray-600 text-center max-w-3xl mx-auto">
              The Madhya Pradesh Air Ambulance Services, supported by the Ayushman Bharat scheme, provide rapid medical transport for critical patients across the state. Our mission is to ensure timely access to advanced healthcare facilities.
            </p>
          </div>
        </section>

        <section id="services" className="py-16 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-3xl font-semibold text-center mb-8">Our Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <Icon icon="mdi:ambulance" className="w-12 h-12 text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Air Ambulance Transport</h4>
                <p className="text-gray-600">
                  State-of-the-art air ambulances equipped for emergency medical care.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <Icon icon="mdi:doctor" className="w-12 h-12 text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">Medical Support</h4>
                <p className="text-gray-600">
                  Onboard medical professionals to ensure patient stability during transport.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <Icon icon="mdi:phone" className="w-12 h-12 text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold mb-2">24/7 Assistance</h4>
                <p className="text-gray-600">
                  Round-the-clock support for emergencies and enquiry tracking.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="text-3xl font-semibold mb-8">Contact Us</h3>
            <p className="text-gray-600 mb-4">For emergencies, call our 24/7 helpline.</p>
            <p className="text-blue-600 font-semibold text-lg">Helpline: 1800-123-4567</p>
            <p className="text-gray-600">Email: support@mpairambulance.gov.in</p>
          </div>
        </section>
      </main>

      <footer className="bg-blue-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2025 Madhya Pradesh Air Ambulance Services. All rights reserved.</p>
          <p className="mt-2">Powered by Ayushman Bharat</p>
        </div>
      </footer>
    </div>
  );
};


export default HomePage;