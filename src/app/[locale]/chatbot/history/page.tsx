// src/app/[locale]/chatbot/history/page.tsx
import ConversationHistoryPage from '@/src/app/[locale]/chatbot/history/ConversationHistoryPage';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations({locale, namespace: 'Chatbot'}); 
  return {
    title: t('Chat_History_Full'),
  };
}

export default function ChatHistoryRoutePage() {
  return <ConversationHistoryPage />;
}