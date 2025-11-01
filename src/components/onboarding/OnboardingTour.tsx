import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Close as CloseIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const steps: TourStep[] = [
    {
      target: '.cycle-selector',
      title: 'Welcome to Cashback Tracker! 👋',
      content: 'Choose your billing cycle here. You can switch between statement cycle, calendar month, or custom dates.',
      position: 'bottom',
    },
    {
      target: '.add-transaction-button',
      title: 'Add Transactions',
      content: 'Click here to add a new transaction. You can also use Cmd+N shortcut!',
      position: 'bottom',
    },
    {
      target: '[href="/analytics"]',
      title: 'View Analytics',
      content: 'View detailed analytics and insights about your spending patterns here.',
      position: 'right',
    },
  ];

  useEffect(() => {
    if (!isActive) return;

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      const step = steps[currentStep];
      const element = document.querySelector(step.target) as HTMLElement;
      
      if (element) {
        setTargetElement(element);
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Calculate tooltip position
        const rect = element.getBoundingClientRect();
        const position = step.position || 'bottom';
        
        let top = 0;
        let left = 0;
        
        switch (position) {
          case 'top':
            top = rect.top - 20;
            left = rect.left + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + 20;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - 20;
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + 20;
            break;
        }
        
        setTooltipPosition({ top, left });
        
        // Highlight element
        element.style.position = 'relative';
        element.style.zIndex = '9999';
        element.classList.add('tour-highlight');
      }
    }, 500);
    
    return () => {
      clearTimeout(timer);
      if (targetElement) {
        targetElement.style.zIndex = '';
        targetElement.classList.remove('tour-highlight');
      }
    };
  }, [currentStep, isActive]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    if (targetElement) {
      targetElement.style.zIndex = '';
      targetElement.classList.remove('tour-highlight');
    }
    setIsActive(false);
    onComplete();
  };

  if (!isActive) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Spotlight effect */}
      {targetElement && (
        <motion.div
          className="fixed z-[9999] pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            top: targetElement.getBoundingClientRect().top - 10,
            left: targetElement.getBoundingClientRect().left - 10,
            width: targetElement.getBoundingClientRect().width + 20,
            height: targetElement.getBoundingClientRect().height + 20,
            border: '3px solid #9C27B0',
            borderRadius: '12px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      {/* Tooltip */}
      <motion.div
        className="fixed z-[10000] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: 'translate(-50%, 0)',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {step.title}
            </h3>
            <div className="flex gap-1 mt-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-purple-500'
                      : index < currentStep
                      ? 'w-4 bg-purple-300'
                      : 'w-4 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <IconButton onClick={handleSkip} size="small">
            <CloseIcon />
          </IconButton>
        </div>

        {/* Content */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {step.content}
        </p>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </div>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <BackIcon fontSize="small" />
                Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
            >
              {isLastStep ? (
                <>
                  <CheckIcon fontSize="small" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <NextIcon fontSize="small" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingTour;