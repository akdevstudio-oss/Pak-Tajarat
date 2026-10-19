import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bot, Send, X, Minimize2, Sparkles, MessageSquare, RefreshCw, ShoppingBag, Truck, ShieldCheck, HelpCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export const AiCustomerChatbot: React.FC = () => {
  const { products } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Assalam-o-Alaikum! 👋 Main Taj (تاج) hoon, Pak-Tajarat ka AI Shopping Assistant. Main aap ki kya madad kar sakta hoon?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, loading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setLoading(true);

    try {
      // Prepare lightweight catalog sample
      const now = Date.now();
      const activeProductsSample = products
        .filter(p => p.status !== 'draft' && (!p.scheduledPublishDate || new Date(p.scheduledPublishDate).getTime() <= now))
        .slice(0, 10)
        .map(p => ({
          name: p.name,
          price: `Rs. ${p.price}`,
          category: p.category,
          stock: p.stock > 0 ? 'In Stock' : 'Out of Stock'
        }));

      // Map chat history
      const history = messages.map(m => ({
        role: m.sender,
        text: m.text
      }));

      const res = await fetch('/api/customer-support-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history,
          catalogContext: activeProductsSample
        })
      });

      const data = await res.json();

      if (data.reply) {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err) {
      console.error('AI Chatbot error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Maaf kijiye, abhi server se rabta nahi ho pa raha. Aap Cash on Delivery, Fast TCS Delivery (2-4 Days) aur 7-Days Returns ke baaray me kisi bhi waqt pooch sakty hain!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    { label: '🚚 Delivery Time?', query: 'Pak-Tajarat pa order kitny din me deliver hota ha?' },
    { label: '💵 Cash on Delivery?', query: 'Kya Cash on Delivery (COD) available ha?' },
    { label: '🔥 Hot Products', query: 'Pak-Tajarat ke top popular products aur discounts dikhao.' },
    { label: '🛡️ Return Policy', query: 'Product return aur refund policy kya ha?' },
  ];

  return (
    <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-50 font-sans max-w-[calc(100vw-1.5rem)]">
      {/* FLOATING TRIGGER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="group relative bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-2xl hover:shadow-emerald-500/40 flex items-center space-x-2 transition-all transform hover:scale-105 cursor-pointer border-2 border-emerald-400/50"
          title="Talk with Taj AI Assistant"
        >
          <div className="relative">
            <Bot size={26} className="text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
            </span>
          </div>
          <span className="hidden md:inline font-bold text-xs pr-1">
            AI Customer Support
          </span>
          <span className="bg-amber-400 text-zinc-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider hidden md:inline">
            Live
          </span>
        </button>
      )}

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 w-[calc(100vw-1.5rem)] sm:w-[380px] ${
          isMinimized ? 'h-[64px]' : 'h-[520px] max-h-[calc(100dvh-5rem)]'
        }`}>
          {/* CHAT HEADER */}
          <div className="bg-gradient-to-r from-emerald-900 via-zinc-900 to-zinc-900 p-3.5 border-b border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 border border-emerald-400 flex items-center justify-center text-white shadow-inner">
                  <Bot size={20} />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-zinc-900 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-extrabold text-sm text-white">Taj (تاج)</h3>
                  <span className="bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold text-[9px] px-1.5 py-0.5 rounded-full flex items-center space-x-1">
                    <Sparkles size={10} className="text-amber-400" />
                    <span>Pak-Tajarat AI</span>
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400/90 font-medium flex items-center space-x-1">
                  <span>● Online | 24/7 Shopping Support</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-zinc-400">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="Close Chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* CHAT BODY (HIDDEN WHEN MINIMIZED) */}
          {!isMinimized && (
            <>
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-zinc-950/60 scrollbar-thin scrollbar-thumb-zinc-800">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-sm whitespace-pre-wrap'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-zinc-500 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}

                {/* TYPING INDICATOR */}
                {loading && (
                  <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs px-3.5 py-2.5 rounded-2xl rounded-bl-none w-max">
                    <Bot size={14} className="text-emerald-400 animate-spin" />
                    <span className="animate-pulse font-semibold text-[11px]">Taj is typing response...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* QUICK SUGGESTIONS CAROUSEL */}
              <div className="p-2 bg-zinc-900/90 border-t border-zinc-800/80 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q.query)}
                    disabled={loading}
                    className="shrink-0 bg-zinc-800/80 hover:bg-emerald-950 hover:border-emerald-700/80 text-zinc-300 hover:text-emerald-300 border border-zinc-700/60 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              {/* INPUT FORM */}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="p-2.5 bg-zinc-900 border-t border-zinc-800 flex items-center space-x-2 shrink-0"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Urdu / Roman Urdu / English me baat karein..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-sans"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};
