import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useDashboard } from './DashboardContext';
import {
  generateAnalysis,
  processQuery,
  type AIAnalysis,
  type AIInsight,
} from '../services/aiInsightsEngine';

// ---- Types ----

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  relatedInsights?: AIInsight[];
  followUp?: string;
  timestamp: string;
}

interface AIInsightsContextType {
  analysis: AIAnalysis;
  chat: ChatMessage[];
  sendMessage: (message: string) => void;
  clearChat: () => void;
}

// ---- Context ----

const AIInsightsContext = createContext<AIInsightsContextType | undefined>(undefined);

let messageCounter = 0;

// ---- Provider ----

export function AIInsightsProvider({ children }: { children: ReactNode }) {
  const { registros } = useDashboard();
  const [chat, setChat] = useState<ChatMessage[]>([]);

  // Recompute analysis whenever registros change
  const analysis = useMemo(() => generateAnalysis(registros), [registros]);

  const sendMessage = (message: string) => {
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}_${++messageCounter}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    const response = processQuery(message, registros, analysis);

    const assistantMsg: ChatMessage = {
      id: `assistant_${Date.now()}_${++messageCounter}`,
      role: 'assistant',
      content: response.answer,
      relatedInsights: response.relatedInsights,
      followUp: response.followUp,
      timestamp: new Date().toISOString(),
    };

    setChat(prev => [...prev, userMsg, assistantMsg]);
  };

  const clearChat = () => setChat([]);

  return (
    <AIInsightsContext.Provider value={{ analysis, chat, sendMessage, clearChat }}>
      {children}
    </AIInsightsContext.Provider>
  );
}

// ---- Hook ----

export function useAIInsights() {
  const context = useContext(AIInsightsContext);
  if (context === undefined) {
    throw new Error('useAIInsights must be used within an AIInsightsProvider');
  }
  return context;
}

// ---- Re-export types ----
export type { ChatMessage, AIInsightsContextType };
