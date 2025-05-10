// src/app/[locale]/chatbot/chat/ChatHistory.tsx
import React from 'react';
import ChatMessageDisplay from './ChatMessageDisplay'; // Ensure correct import path
import { ChatMessageType } from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Adjust path if needed

interface ChatHistoryProps {
    messages: ChatMessageType[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
    return (
        <div className="space-y-4"> {/* Adds space between message rows */}
            {messages.map((msg) => (
                // Use message ID as key for better React performance/stability
                <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start text-left'}`}>
                    {/* Pass all necessary props, including the optional location */}
                    <ChatMessageDisplay
                        id={msg.id} // Pass id
                        message={msg.message}
                        isUser={msg.isUser}
                        type={msg.type}
                        thoughts={msg.thoughts}
                        location={msg.location} // <<< PASS location prop
                    />
                </div>
            ))}
        </div>
    );
};

export default ChatHistory;