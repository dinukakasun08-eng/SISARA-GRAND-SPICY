import React, { useState, useEffect } from 'react';
import { ShoppingBag, Navigation, CheckCircle2, X, ChevronRight } from 'lucide-react';

export default function TutorialModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenSisaraTutorial');
    if (!hasSeenTutorial) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenSisaraTutorial', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to Sisara Grand Spicy!",
      description: "Let us show you how easy it is to order your favorite food.",
      icon: <ShoppingBag className="w-12 h-12 text-amber-500 mb-4" />
    },
    {
      title: "1. Add to Cart",
      description: "Browse our delicious menu and tap 'Add to Cart' on the items you love.",
      icon: <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4"><ShoppingBag className="w-6 h-6 text-amber-600" /></div>
    },
    {
      title: "2. Checkout & Location",
      description: "Open your cart, enter your details, and provide your location so we can deliver it right to you.",
      icon: <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4"><Navigation className="w-6 h-6 text-blue-600" /></div>
    },
    {
      title: "3. Track Your Order",
      description: "Go to 'My Orders' in the top menu to check the status of your food. We'll update it when it's cooking and on the way!",
      icon: <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="w-6 h-6 text-emerald-600" /></div>
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all duration-300 scale-100 opacity-100">
        <div className="p-6 text-center relative">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex justify-center mt-2">
            {currentStep.icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{currentStep.title}</h3>
          <p className="text-sm text-gray-500 mb-8 min-h-[60px]">{currentStep.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-amber-600' : 'w-1.5 bg-gray-200'}`}
                />
              ))}
            </div>
            
            <button
              onClick={() => {
                if (step < steps.length - 1) {
                  setStep(s => s + 1);
                } else {
                  handleClose();
                }
              }}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              {step < steps.length - 1 ? (
                <>Next <ChevronRight className="w-4 h-4" /></>
              ) : (
                'Got it!'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
