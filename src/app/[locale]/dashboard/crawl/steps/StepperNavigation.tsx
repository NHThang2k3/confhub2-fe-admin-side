// src/appp/[locale]/dashboard/logAnalysis/steps/StepperNavigation.tsx
import React from 'react';

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
    <nav aria-label="Progress" className="mb-4 md:mb-8">
      <ol role="list" className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-8 lg:space-x-16">
        {steps.map((step, stepIdx) => (
          <React.Fragment key={step.name}>
            {stepIdx > 0 && (
              <div className="hidden sm:flex items-center">
                <svg
                  className={`h-4 w-4 md:h-5 md:w-5 ${
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
                  className={`flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    currentStepId === step.id
                      ? 'border-blue-600 bg-blue-50'
                      : currentStepId > step.id
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {currentStepId > step.id ? (
                    <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className={`text-sm sm:text-base ${currentStepId === step.id ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.id}
                    </span>
                  )}
                </span>
                <span 
                  className={`ml-3 text-xs sm:text-sm font-medium ${
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