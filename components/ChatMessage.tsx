import React from 'react';
import { Message, MessageOption, Sender } from '../types';

// --- Sub-component for options ---

interface MessageOptionsProps {
  options: MessageOption[];
  onSelect: (value: string, text: string) => void;
  disabled: boolean;
}

const MessageOptions: React.FC<MessageOptionsProps> = ({ options, onSelect, disabled }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-4 justify-start">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value, option.text)}
          disabled={disabled}
          className="bg-button-bg text-text-secondary font-medium px-4 py-2 rounded-full border border-bubble-border shadow-md hover:text-white hover:border-accent-cyan/50 hover:bg-gradient-to-r hover:from-accent-blue hover:to-accent-cyan hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 transform hover:scale-105 transition-all duration-300 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:border-gray-600 disabled:hover:bg-gray-700 disabled:hover:from-gray-700"
        >
          {option.text}
        </button>
      ))}
    </div>
  );
};


// --- Main ChatMessage component ---

interface ChatMessageProps {
  message: Message;
  onOptionSelect: (value: string, text: string) => void;
  isLastMessage: boolean;
  disabled: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onOptionSelect, isLastMessage, disabled }) => {
  const isUser = message.sender === Sender.USER;

  const bubbleClasses = isUser
    ? 'bg-bubble-user text-text-primary self-end'
    : 'bg-bubble-bot text-text-primary self-start';
  
  const containerClasses = isUser ? 'flex flex-col items-end' : 'flex flex-col items-start';

  const isNewsSummary = message.sender === Sender.BOT && message.text.includes('Read on Google');

  return (
    <div className={`${containerClasses} animate-fade-in`}>
      <div
        className={`max-w-md md:max-w-lg rounded-xl px-5 py-3.5 shadow-md shadow-inner-soft border border-bubble-border ${bubbleClasses}`}
      >
        {isNewsSummary ? (
            <div 
              className="text-[15px] space-y-3"
              dangerouslySetInnerHTML={{ __html: message.text }} 
            />
        ) : (
            <p className="whitespace-pre-wrap text-[15px]">{message.text}</p>
        )}
      </div>
       {isLastMessage && message.options && message.sender === Sender.BOT && (
        <MessageOptions options={message.options} onSelect={onOptionSelect} disabled={disabled} />
      )}
    </div>
  );
};