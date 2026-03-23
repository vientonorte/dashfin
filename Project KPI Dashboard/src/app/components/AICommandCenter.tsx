import { useState, useRef, useEffect } from 'react';
import {
  Brain,
  Send,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  Target,
  Sparkles,
  ChevronRight,
  Info,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useAIInsights } from '../contexts/AIInsightsContext';
import type { AIInsight, InsightSeverity } from '../services/aiInsightsEngine';

// ---- Severity styling ----

const SEVERITY_STYLES: Record<InsightSeverity, { bg: string; text: string; border: string; icon: string }> = {
  positive: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'text-emerald-500' },
  info:     { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    icon: 'text-blue-500' },
  warning:  { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   icon: 'text-amber-500' },
  critical: { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     icon: 'text-red-500' },
};

function TrendIcon({ trend }: { trend?: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5" />;
  if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
}

// ---- Insight Card ----

function InsightCard({ insight, compact = false }: { insight: AIInsight; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const style = SEVERITY_STYLES[insight.severity];

  return (
    <div
      className={`rounded-lg border p-3 ${style.bg} ${style.border} transition-all cursor-pointer hover:shadow-sm`}
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && setExpanded(!expanded)}
    >
      <div className="flex items-start gap-2">
        <div className={`mt-0.5 ${style.icon}`}>
          {insight.category === 'anomaly' ? <AlertTriangle className="h-4 w-4" /> :
           insight.category === 'action' ? <Target className="h-4 w-4" /> :
           insight.category === 'weekly' ? <Lightbulb className="h-4 w-4" /> :
           <Sparkles className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium ${style.text}`}>{insight.title}</span>
            {insight.trend && (
              <span className={`${style.icon}`}><TrendIcon trend={insight.trend} /></span>
            )}
            {insight.value && !compact && (
              <Badge variant="outline" className="text-xs">{insight.value}</Badge>
            )}
          </div>
          {!compact && (
            <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
          )}

          {/* Explainability - shown on expand */}
          {expanded && (
            <div className="mt-2 space-y-2">
              <div className="flex items-start gap-1.5 bg-white/60 rounded p-2">
                <ShieldCheck className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">{insight.explanation}</p>
              </div>
              {insight.action && (
                <div className="bg-white/80 rounded p-2 space-y-1">
                  <p className="text-xs font-medium flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" />
                    {insight.action.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{insight.action.rationale}</p>
                  <p className="text-xs font-medium text-emerald-600">{insight.action.impact}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Chat Message ----

function ChatBubble({ role, content, relatedInsights, followUp }: {
  role: 'user' | 'assistant';
  content: string;
  relatedInsights?: AIInsight[];
  followUp?: string;
}) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
        role === 'user'
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted'
      }`}>
        <p className="whitespace-pre-line">{content}</p>

        {relatedInsights && relatedInsights.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {relatedInsights.slice(0, 2).map(insight => (
              <InsightCard key={insight.id} insight={insight} compact />
            ))}
          </div>
        )}

        {followUp && (
          <p className="mt-2 text-xs opacity-70 italic">{followUp}</p>
        )}
      </div>
    </div>
  );
}

// ---- Suggested Questions ----

const SUGGESTED_QUESTIONS = [
  '¿Cómo van las ventas?',
  '¿Cuál es mi margen actual?',
  '¿Hay alguna anomalía?',
  '¿Qué debería hacer?',
  '¿Cómo va el ROI?',
  '¿Comparar líneas de negocio?',
];

// ---- Main Component ----

export function AICommandCenter() {
  const { analysis, chat, sendMessage, clearChat } = useAIInsights();
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'actions'>('insights');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput('');
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Centro de Inteligencia</h2>
          <Badge variant="secondary" className="text-xs">
            {analysis.confidence}% confianza · {analysis.dataPoints} períodos
          </Badge>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <div>
              <p className="text-sm">{analysis.summary}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Los insights se generan analizando tendencias, desviaciones estadísticas y reglas de negocio sobre tus datos reales.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        {([
          { key: 'insights' as const, label: 'Insights', count: analysis.dailyInsights.length + analysis.weeklyDecisions.length },
          { key: 'actions' as const, label: 'Acciones', count: analysis.nextBestActions.length },
          { key: 'chat' as const, label: 'Asistente', count: analysis.anomalies.length },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-sm py-1.5 px-3 rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-background shadow-sm font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          {/* Daily */}
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Insights del Período
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-4">
              {analysis.dailyInsights.map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </CardContent>
          </Card>

          {/* Weekly Decisions */}
          {analysis.weeklyDecisions.length > 0 && (
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Decisiones Clave
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-4">
                {analysis.weeklyDecisions.map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Anomalies */}
          {analysis.anomalies.length > 0 && (
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-medium flex items-center gap-1.5 text-amber-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Anomalías Detectadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-4">
                {analysis.anomalies.map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Actions Tab */}
      {activeTab === 'actions' && (
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                Próximas Mejores Acciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-4">
              {analysis.nextBestActions.map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Cada recomendación incluye explicación y lógica detrás de la sugerencia. Haz clic para ver detalles.
          </p>
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <Card className="flex flex-col min-h-[400px]">
          <CardHeader className="pb-2 pt-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5" />
              Asistente de Análisis
            </CardTitle>
            {chat.length > 0 && (
              <button
                onClick={clearChat}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Limpiar
              </button>
            )}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pb-3">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-3 max-h-[350px]">
              {chat.length === 0 && (
                <div className="text-center py-6">
                  <Brain className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Pregúntame sobre tu negocio
                  </p>
                  <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                    {SUGGESTED_QUESTIONS.map(q => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="text-xs px-2.5 py-1 rounded-full border bg-background hover:bg-muted transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chat.map(msg => (
                <ChatBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  relatedInsights={msg.relatedInsights}
                  followUp={msg.followUp}
                />
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ej: ¿Cómo van las ventas?"
                className="flex-1 text-sm rounded-lg border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="rounded-lg bg-primary text-primary-foreground px-3 py-2 hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
