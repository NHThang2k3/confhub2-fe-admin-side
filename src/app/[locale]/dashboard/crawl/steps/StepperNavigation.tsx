import React from 'react';
import { FaCheck } from 'react-icons/fa';

interface Step {
  id: number;
  name: string;
}

interface StepperNavigationProps {
  steps: Step[];
  currentStepId: number;
}

const StepperNavigation: React.FC<StepperNavigationProps> = ({ steps, currentStepId }) => {
  return (
    <nav aria-label="Progress" className="mb-6"> {/* Reduced margin-bottom */}
      <ol role="list" className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 md:space-x-10 lg:space-x-14"> {/* Reduced spacing */}
        {steps.map((step, stepIdx) => (
          <React.Fragment key={step.name}>
            {stepIdx > 0 && (
              <div className="hidden sm:flex items-center">
                <svg
                  className={`h-4 w-4 md:h-5 md:w-5 ${ // Reduced icon size
                    currentStepId > step.id ? 'text-blue-600' : 'text-gray-300'
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            <li className="relative flex items-center w-full sm:w-auto">
              <div className="flex items-center w-full sm:w-auto">
                <span
                  className={`flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ease-in-out ${ // Reduced size
                    currentStepId === step.id
                      ? 'border-blue-600 bg-blue-50'
                      : currentStepId > step.id
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {currentStepId > step.id ? (
                    <FaCheck className="h-5 w-5 text-white" aria-hidden="true" /> // Reduced icon size
                  ) : (
                    <span className={`text-base sm:text-lg font-semibold ${currentStepId === step.id ? 'text-blue-600' : 'text-gray-500'}`}> {/* Reduced text size */}
                      {step.id}
                    </span>
                  )}
                </span>
                <span 
                  className={`ml-3 text-sm sm:text-base font-medium ${ // Reduced margin, text size
                    currentStepId === step.id 
                      ? 'text-blue-600' 
                      : currentStepId > step.id 
                        ? 'text-gray-900' 
                        : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </span>
              </div>
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default StepperNavigation;