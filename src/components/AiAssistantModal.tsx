import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: '¡Hola! Soy tu asistente de IA para los módulos de pregrado de Ingeniería. Puedo ayudarte a resolver dudas sobre Electromagnetismo (circuitos RLC, ley de Ohm), Resistencia de Materiales (diagramas V, M, deflexión) y Métodos Numéricos (Bisección, Newton-Raphson, Gauss-Jordan, Simpson). ¿En qué tema trabajamos hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY || '';
      if (!apiKey) {
        // Fallback didáctico en caso de no contar con clave configurada
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              text: `En relación a "${userText}":\n\n- **Electromagnetismo**: Recuerda aplicar la Ley de Kirchhoff de voltajes ($\sum V = 0$) y la constante de tiempo $\tau = R \cdot C$.\n- **Resistencia de Materiales**: El esfuerzo normal máximo es $\sigma = \frac{M \cdot c}{I}$ y la flexión depende de la inercia $I$.\n- **Métodos Numéricos**: En bisección asegúrate de que $f(a) \cdot f(b) < 0$ para garantizar la existencia de la raíz por el Teorema del Valor Intermedio.`
            }
          ]);
          setLoading(false);
        }, 1000);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userText,
        config: {
          systemInstruction: 'Eres un tutor académico universitario experto en ingeniería (Electromagnetismo, Resistencia de Materiales y Métodos Numéricos). Responde con claridad matemática, ejemplos concisos y tono alentador en español.'
        }
      });

      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: response.text || 'No pude generar una respuesta en este momento.' }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'Ocurrió un error de consulta. Revisa los parámetros del problema o intenta nuevamente.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[550px] overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Tutor IA Académico de Pregrado</h3>
              <p className="text-[10px] text-slate-400">Resuelve dudas de física, cálculo de materiales y métodos numéricos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 font-sans text-xs">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className={`p-3.5 rounded-2xl max-w-[80%] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-cyan-600 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
              }`}>
                {m.text}
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
              <span>El tutor IA está razonando...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregunta sobre vigas, transitorios RC o bisección..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>Enviar</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
