// Olive Baby Web - AI Chat Button Component
// Botão flutuante para iniciar conversa com a assistente AI

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Sparkles, X, Send, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useBabyStore } from '../../stores/babyStore';
import { aiService } from '../../services/api';
import { useToast } from '../ui/Toast';
import type { AiChatSession, AiChatMessage } from '../../types';

interface AIChatButtonProps {
  onOpenChat?: () => void;
}

export function AIChatButton({ onOpenChat }: AIChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [session, setSession] = useState<AiChatSession | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const { selectedBaby } = useBabyStore();
  const { success, error: showError } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasCreatedSessionRef = useRef(false);

  // Scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Criar sessão quando abrir o chat
  useEffect(() => {
    if (isOpen && !session && selectedBaby && !isCreatingSession && !hasCreatedSessionRef.current) {
      hasCreatedSessionRef.current = true;
      createSession();
    }
    if (!isOpen) {
      hasCreatedSessionRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedBaby?.id]);

  const createSession = async () => {
    if (!selectedBaby) return;
    
    setIsCreatingSession(true);
    try {
      const response = await aiService.createSession(selectedBaby.id);
      if (response.success && response.data) {
        setSession(response.data);
        // Carregar mensagens se houver
        if (response.data.messages) {
          setMessages(response.data.messages);
        }
      }
    } catch (err) {
      showError('Erro', 'Não foi possível iniciar a conversa com a assistente');
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !session || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Adicionar mensagem do usuário imediatamente
    const tempUserMessage: AiChatMessage = {
      id: Date.now(),
      sessionId: session.id,
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      const response = await aiService.sendMessage(session.id, userMessage);
      if (response.success) {
        // Adicionar mensagem do assistente
        if (response.data.assistantMessage) {
          setMessages(prev => [...prev, response.data.assistantMessage]);
        }
      }
    } catch (err) {
      showError('Erro', 'Não foi possível enviar a mensagem');
      // Remover mensagem do usuário em caso de erro
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    onOpenChat?.();
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  if (!selectedBaby) return null;

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-32 right-6 z-[60] w-96 bg-white rounded-2xl shadow-2xl border border-gray-200',
            'flex flex-col transition-all duration-300',
            isMinimized ? 'h-16' : 'h-[600px] max-h-[calc(100vh-8rem)]'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Olive Assistente</h3>
                <p className="text-xs text-gray-500">Como posso ajudar?</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <span className="text-xs">{isMinimized ? '□' : '—'}</span>
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isCreatingSession ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Olá! 👋</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Eu sou a Olive, sua assistente virtual. Estou aqui para ajudar com dúvidas sobre cuidados com o bebê.
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => setInputMessage('Como está o padrão de sono do bebê?')}
                        className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                      >
                        💤 Como está o padrão de sono?
                      </button>
                      <button
                        onClick={() => setInputMessage('Quantas alimentações o bebê fez hoje?')}
                        className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                      >
                        🍼 Quantas alimentações hoje?
                      </button>
                      <button
                        onClick={() => setInputMessage('Preciso de dicas de amamentação')}
                        className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                      >
                        🤱 Dicas de amamentação
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex',
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[80%] rounded-2xl px-4 py-2.5',
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-olive-500 to-olive-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                        <span className="text-sm text-gray-500">Olive está pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isLoading || isCreatingSession}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading || isCreatingSession}
                    className={cn(
                      'p-2.5 rounded-xl transition-colors',
                      inputMessage.trim() && !isLoading
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={handleOpen}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-200',
          'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
          'relative group'
        )}
        title="Conversar com a Olive Assistente"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-purple-500 opacity-75 animate-ping" />
        <span className="absolute inset-0 rounded-full bg-purple-500 opacity-50 animate-pulse" />
      </button>
    </>
  );
}
