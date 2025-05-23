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
    <nav aria-label="Progress" className="mb-8">
      {/* Tăng space-x để tăng khoảng cách giữa các step */}
      <ol role="list" className="flex items-center justify-center space-x-16"> {/* Thay đổi từ space-x-4 thành space-x-16 hoặc lớn hơn */}
        {steps.map((step, stepIdx) => (
          <React.Fragment key={step.name}> {/* Sử dụng React.Fragment để bọc mũi tên và step */}
            {stepIdx > 0 && (
              // Biểu tượng mũi tên nằm giữa các step và tạo khoảng trống
              <div className="flex items-center">
                <svg
                  className={`h-5 w-5 ${
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
            <li className="relative flex items-center"> {/* Thêm flex items-center cho li */}
              <span
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                  currentStepId === step.id
                    ? 'border-blue-600 bg-blue-50'
                    : currentStepId > step.id
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {currentStepId > step.id ? (
                  <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className={currentStepId === step.id ? 'text-blue-600' : 'text-gray-500'}>{step.id}</span>
                )}
              </span>
              <span className={`ml-3 text-sm font-medium whitespace-nowrap ${currentStepId === step.id ? 'text-blue-600' : currentStepId > step.id ? 'text-gray-900' : 'text-gray-500'}`}>
                {step.name}
              </span>
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default StepperNavigation;