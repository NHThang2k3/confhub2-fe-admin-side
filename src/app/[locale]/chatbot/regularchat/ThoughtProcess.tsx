// src/app/[locale]/chatbot/chat/ThoughtProcess.tsx
import React, { useState } from 'react';
import { ThoughtStep, AgentId } from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Adjust path if needed
import {
  FiDownloadCloud, FiCpu, FiSettings, FiSearch, FiDatabase, FiEdit,
  FiAlertTriangle, FiMapPin, FiLink, FiUserCheck, FiCheckCircle, FiXCircle,
  FiHelpCircle, FiShare2, FiInfo, FiThumbsUp, FiThumbsDown, FiRepeat, FiZap, FiPlayCircle
} from 'react-icons/fi';
import { MdOutlineAltRoute, MdSupervisorAccount } from 'react-icons/md'; // Thêm MdSupervisorAccount cho Sub Agent

// --- Enhanced Step Icon Mapping ---
const stepIcons: { [key: string]: React.ElementType } = {
  // General Flow
  processing_input: FiDownloadCloud,
  thinking: FiCpu,
  generating_response: FiEdit,

  // Function Calling Core
  function_call: FiSettings,
  function_call_received: FiSettings, // Thêm từ backend
  function_result_processed: FiDatabase, // Thêm từ backend
  validating_function_args: FiInfo,
  processing_function_result: FiDatabase,
  function_error: FiAlertTriangle,
  unknown_function: FiHelpCircle,

  // Data Retrieval / Searching
  retrieving_info: FiSearch,
  finding_item_id: FiSearch,
  item_id_found: FiCheckCircle,
  item_id_not_found: FiXCircle,
  data_found: FiCheckCircle,
  processing_request: FiPlayCircle,
  data_not_found: FiXCircle,
  parsing_api_response: FiDatabase,

  // Specific Actions & Validations
  checking_authentication: FiUserCheck,
  checking_status: FiUserCheck,
  follow_status_checked: FiCheckCircle,

  determining_follow_action: FiRepeat,
  follow_action_determined: FiCheckCircle,
  preparing_follow_api_call: FiShare2,
  executing_follow_api_call: FiShare2,
  follow_update_success: FiThumbsUp,
  follow_update_failed: FiAlertTriangle,

  validating_navigation_url: FiInfo,
  navigation_action_prepared: FiLink,

  validating_map_location: FiInfo,
  map_action_prepared: FiMapPin,

  action_prepared: FiZap,

  // Generic Success/Failure/Warning
  update_success: FiCheckCircle,
  update_failed: FiXCircle,
  api_call_failed: FiAlertTriangle,
  function_warning: FiAlertTriangle,

  // Backend/System Steps
  max_turns_exceeded: FiAlertTriangle,
  unknown_handler_error: FiAlertTriangle,

  // Routing and Sub-agent specific
  routing_task: MdOutlineAltRoute, // Đã có, sửa lại key 'routng_task' -> 'routing_task'
  sub_agent_thinking: MdSupervisorAccount, // Icon cho Sub Agent thinking
  sub_agent_function_call_initiated: MdSupervisorAccount, // Icon cho Sub Agent gọi hàm
  sub_agent_text_response_generated: MdSupervisorAccount,
  sub_agent_llm_error: FiAlertTriangle,
  sub_agent_critical_error: FiAlertTriangle,
  sub_agent_processing_complete: FiCheckCircle,


  // --- Fallback ---
  default: FiHelpCircle,
};

const getIcon = (stepKey: string): React.ElementType => {
  const mapping: { [key: string]: string } = {
    checking_follow_status: 'checking_status',
    executing_backend_call: 'preparing_api_call',
    // Các bước từ backend có thể khác một chút
    'function_call_received': 'function_call', // Map biến thể
    'function_result_processed': 'processing_function_result',
  };
  const mappedKey = mapping[stepKey] || stepKey;
  return stepIcons[mappedKey] || stepIcons.default;
};

interface ThoughtProcessProps {
  thoughts: ThoughtStep[];
}

const ThoughtProcess: React.FC<ThoughtProcessProps> = ({ thoughts }) => {
  const [isOpen, setIsOpen] = useState(false); // Mặc định đóng

  if (!thoughts || thoughts.length === 0) {
    return null;
  }

  const toggleOpen = () => setIsOpen(!isOpen);

  const renderDetails = (details: any) => {
    if (!details || Object.keys(details).length === 0) {
      return null;
    }
    return (
      <pre className='ml-5 mt-1 whitespace-pre-wrap break-words border-l border-gray-300 pl-2 text-[10px] dark:border-gray-600 dark:text-gray-400'> {/* Giữ lại border-l nếu muốn */}
        {JSON.stringify(details, null, 2)}
      </pre>
    );
  };
  return (
    <div className='bg-gray-5 mb-2  rounded border border-gray-200 text-sm shadow-sm  dark:border-gray-700'>
      <button
        onClick={toggleOpen}
        className='flex w-full items-center justify-between rounded-t px-3 py-1.5 text-left font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'
        aria-expanded={isOpen}
        aria-controls='thought-details'
      >
        <span className='text-xs font-semibold'>
          {isOpen ? 'Hide' : 'Show'} Thought Process ({thoughts.length} steps)
        </span>
        <svg
          className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'></path>
        </svg>
      </button>

      {isOpen && (
        <ul
          id='thought-details'
          className='pretty-scrollbar max-h-72 space-y-2 overflow-y-auto border-t border-gray-200 dark:border-gray-700 p-3'        >
          {thoughts.map((thought, index) => {
            const IconComponent = getIcon(thought.step);
            const isSubAgentStep = thought.agentId && thought.agentId !== 'HostAgent';

            return (
              <li key={index} className={`text-xs ${isSubAgentStep ? 'pl-3 border-l-2 border-indigo-300 dark:border-indigo-700 py-1' : ''}`}>
                <div className='flex items-start space-x-2'>
                  <span
                    className={`flex-shrink-0 pt-0.5 ${isSubAgentStep ? 'text-indigo-500 dark:text-indigo-400' : 'text-blue-500 dark:text-blue-400'}`}
                    title={`${thought.step}${isSubAgentStep ? ` (${thought.agentId})` : ''}`}
                    aria-label={`${thought.step.replace(/_/g, ' ')}${isSubAgentStep ? ` by ${thought.agentId}` : ''}`}
                  >
                    <IconComponent className='h-3.5 w-3.5' />
                  </span>
                  <div className='flex-grow'>
                    <span className={`${isSubAgentStep ? 'font-medium text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-200'}`}>
                      {isSubAgentStep && thought.agentId ? `[${thought.agentId}] ` : ''}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{thought.message}</span>
                    {renderDetails(thought.details)}
                  </div>
                  <span className='flex-shrink-0 whitespace-nowrap pl-2 text-[10px] text-gray-500 dark:text-gray-400'>
                    {new Date(thought.timestamp).toLocaleTimeString([], {
                      hour: '2-digit', minute: '2-digit', second: '2-digit'
                    })}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {/* Scrollbar styles */}
      {/* <style jsx>{`
                .pretty-scrollbar::-webkit-scrollbar { width: 6px; }
                .pretty-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .pretty-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(156, 163, 175, 0.4);
                    border-radius: 3px;
                }
                .dark .pretty-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(107, 114, 128, 0.5);
                }
            `}</style> */}
    </div>
  );
};

export default ThoughtProcess;