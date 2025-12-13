// Olive Baby Web - Assistant Chat Component
import { useEffect, useRef, useState } from 'react';
import { Send, Loader2, Bot, User, AlertCircle, Sparkles, RotateCcw } from 'lucide-react';
import { useAiStore } from '../../stores/aiStore';
import { useBabyStore } from '../../stores/babyStore';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import type { AiChatMessage } from '../../types';

interface AssistantChatProps {
  onCitationsClick?: () => void;
  className?: string;
}

export function AssistantChat({ onCitationsClick, className }: AssistantChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { selectedBaby } = useBabyStore();
  const {
    currentSession,
    messages,
    isSending,
    error,
    lastCitations,
    createSession,
    sendMessage,
  } = useAiStore();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isSending) return;

    // Create session if none exists
    if (!currentSession && selectedBaby) {
      const session = await createSession(selectedBaby.id);
      if (!session) return;
    }

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleNewChat = async () => {
    if (selectedBaby) {
      await createSession(selectedBaby.id);
    }
  };

  if (!selectedBaby) {
    return (
      <div className={cn('flex flex-col items-center justify-center h-full text-gray-500', className)}>
        <Bot className="h-12 w-12 mb-4 opacity-50" />
        <p>Selecione um bebê para iniciar a conversa</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full bg-white rounded-lg shadow-sm', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-full">
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Olive Assistant</h2>
            <p className="text-xs text-gray-500">
              Assistente para {selectedBaby.name}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNewChat}
          className="text-gray-500 hover:text-emerald-600"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Nova conversa
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 bg-emerald-50 rounded-full mb-4">
              <Bot className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Olá! Sou a Olive 🌿
            </h3>
            <p className="text-gray-500 max-w-md mb-6">
              Estou aqui para ajudar com dúvidas sobre sono, amamentação, rotinas e desenvolvimento de {selectedBaby.name}.
            </p>
            <div className="grid gap-2 w-full max-w-sm">
              <SuggestedQuestion
                question="Como estabelecer uma rotina de sono?"
                onClick={() => setInput('Como estabelecer uma rotina de sono para bebê?')}
              />
              <SuggestedQuestion
                question="Quantas fraldas por dia é normal?"
                onClick={() => setInput('Quantas fraldas por dia é normal para um bebê?')}
              />
              <SuggestedQuestion
                question="Como saber se o bebê está mamando bem?"
                onClick={() => setInput('Como saber se o bebê está mamando o suficiente?')}
              />
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isSending && (
          <div className="flex items-center gap-3 text-gray-500">
            <div className="p-2 bg-emerald-50 rounded-full">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
            </div>
            <span className="text-sm">Olive está pensando...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Citations indicator */}
      {lastCitations.length > 0 && (
        <button
          onClick={onCitationsClick}
          className="mx-4 mb-2 flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-700"
        >
          <Sparkles className="h-3 w-3" />
          {lastCitations.length} fonte(s) consultada(s) - clique para ver
        </button>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua dúvida..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            disabled={isSending}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isSending}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-3"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          ⚠️ A Olive não substitui o pediatra. Em caso de emergência, procure atendimento médico.
        </p>
      </form>
    </div>
  );
}

// Chat Message Component
function ChatMessage({ message }: { message: AiChatMessage }) {
  const isUser = message.role === 'user';
  const isTool = message.role === 'tool';

  if (isTool) return null; // Don't show tool messages

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex-shrink-0 p-2 rounded-full h-8 w-8 flex items-center justify-center',
          isUser ? 'bg-emerald-100' : 'bg-gray-100'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-emerald-600" />
        ) : (
          <Bot className="h-4 w-4 text-gray-600" />
        )}
      </div>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-emerald-500 text-white rounded-tr-sm'
            : 'bg-gray-100 text-gray-900 rounded-tl-sm'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MarkdownContent content={message.content} />
        )}
      </div>
    </div>
  );
}

// Markdown Content Renderer (simple)
function MarkdownContent({ content }: { content: string }) {
  // Very simple markdown parsing for common patterns
  const lines = content.split('\n');
  
  return (
    <div className="prose prose-sm max-w-none prose-emerald">
      {lines.map((line, i) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={i} className="font-semibold mt-3 mb-1">{line.slice(3)}</h3>;
        }
        if (line.startsWith('# ')) {
          return <h2 key={i} className="font-bold mt-3 mb-1">{line.slice(2)}</h2>;
        }
        
        // Lists
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="text-emerald-500">•</span>
              <span>{formatInlineMarkdown(line.slice(2))}</span>
            </div>
          );
        }
        
        // Numbered lists
        const numberedMatch = line.match(/^(\d+)\.\s/);
        if (numberedMatch) {
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="text-emerald-500 font-medium">{numberedMatch[1]}.</span>
              <span>{formatInlineMarkdown(line.slice(numberedMatch[0].length))}</span>
            </div>
          );
        }
        
        // Empty lines
        if (line.trim() === '') {
          return <div key={i} className="h-2" />;
        }
        
        // Regular paragraphs
        return <p key={i} className="my-1">{formatInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

// Format inline markdown (bold, italic, code)
function formatInlineMarkdown(text: string): React.ReactNode {
  // Split by bold markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    // Also handle single asterisks for italic
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

// Suggested Question Button
function SuggestedQuestion({ question, onClick }: { question: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-sm text-gray-700"
    >
      {question}
    </button>
  );
}
