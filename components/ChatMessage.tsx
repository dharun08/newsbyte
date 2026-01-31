import React from 'react';
import ReactMarkdown from 'react-markdown';
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

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onOptionSelect, 
  isLastMessage, 
  disabled 
}) => {
  const isUser = message.sender === Sender.USER;
  const bubbleClasses = isUser
    ? 'bg-bubble-user text-text-primary self-end'
    : 'bg-bubble-bot text-text-primary self-start';
  
  const containerClasses = isUser ? 'flex flex-col items-end' : 'flex flex-col items-start';
  const isNewsSummary = message.sender === Sender.BOT && message.text.includes('**LATEST NEWS:**');
  
  return (
    <div className={`${containerClasses} animate-fade-in`}>
      <div
        className={`max-w-md md:max-w-lg rounded-xl px-5 py-3.5 shadow-md shadow-inner-soft border border-bubble-border ${bubbleClasses}`}
      >
        {isNewsSummary ? (
          <div className="text-[15px] space-y-2">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                strong: ({ children }) => (
                  <strong className="font-bold text-accent-cyan block mb-1">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="text-text-secondary text-sm not-italic">{children}</em>
                ),
                a: ({ href, children }) => (
                  
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-blue hover:text-accent-cyan underline transition-colors inline-flex items-center gap-1 font-medium"
                  >
                    {children}
                    <svg 
                      className="w-3 h-3" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                      />
                    </svg>
                  </a>
                ),
                hr: () => (
                  <hr className="my-3 border-t border-bubble-border/30" />
                ),
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
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
