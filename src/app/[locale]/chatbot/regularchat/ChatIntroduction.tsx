// src/app/[locale]/chatbot/chat/ChatIntroduction.tsx
import React from 'react'
// Import Language instead of Language
import { Language } from '@/src/app/[locale]/chatbot/lib/live-chat.types'

interface IntroductionContent {
  greeting: string
  description: string
  suggestions: string[]
}

// Use Language as the key type for introductions
const introductions: Record<Language, IntroductionContent> = {
  en: {
    greeting: 'Hello!',
    description:
      "I'm a chatbot assistant for finding conference information. Ask a question or choose a suggestion below to get started:",
    suggestions: [
      'List some AI conferences in Asia.',
      'Find Big Data conferences this year.',
      'I want to know about blockchain conferences in Europe.'
    ]
  },
  vi: {
    greeting: 'Xin chào!',
    description:
      'Tôi là chatbot hỗ trợ tìm kiếm thông tin về các hội nghị. Hãy đặt câu hỏi hoặc chọn một trong số các câu hỏi gợi ý sau để bắt đầu:',
    suggestions: [
      'Liệt kê cho tôi một vài hội nghị về lĩnh vực AI tổ chức tại châu Á.',
      'Tìm các hội nghị về Big Data trong năm nay.',
      'Tôi muốn biết về các hội nghị blockchain tại châu Âu.'
    ]
  },
  zh: {
    greeting: '你好!',
    description:
      '我是会议信息查询聊天机器人助手。您可以提问或选择下面的建议开始：',
    suggestions: [
      '列出亚洲的一些人工智能会议。',
      '查找今年的大数据会议。',
      '我想了解欧洲的区块链会议。'
    ]
  }
}

interface ChatIntroductionProps {
  onSuggestionClick: (suggestion: string) => void
  language: Language // The prop type is Language
}

const ChatIntroductionDisplay: React.FC<ChatIntroductionProps> = ({
  onSuggestionClick,
  language
}) => {
  // Select content based on the Language, fallback to 'en'
  const content = introductions[language] || introductions['en']

  return (
    <div className='bg-gray-5 0 mb-4 rounded-lg border border-blue-100 p-6 text-center'>
      <h2 className='mb-2 text-xl  font-semibold'>{content.greeting}</h2>
      <p className='mb-4  text-sm'>{content.description}</p>
      <div className='flex flex-wrap justify-center gap-2'>
        {content.suggestions.map((text, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(text)}
            className='bg-white-pure rounded-full border border-gray-300 px-3 py-1 text-sm transition-colors  duration-150 hover:border-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 '
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ChatIntroductionDisplay