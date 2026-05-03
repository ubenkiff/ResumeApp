import React from 'react';

function WhatsAppButton() {
  const phoneNumber = '254716747291'; // Replace with your WhatsApp number
  const message = encodeURIComponent(
    "Hi Uddi! I saw your ResumeApp and I'm interested in learning more about how it can better my job prospects. Let's talk."
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center group no-print"
      aria-label="Chat on WhatsApp"
    >
      <i className="fab fa-whatsapp text-2xl"></i>
      <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Chat with us
      </span>
    </a>
  );
}

export default WhatsAppButton;