import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../createClient";
import { User, Mail, MessageSquare, Bot, Send, CheckCircle2, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const Contacto = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: null, text: '' });

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { 
    scrollToBottom(); 
  }, [chatMessages, isTyping]);

  useEffect(() => {
    const initChat = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setCurrentUser(session.user);
        
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          const formattedHistory = data.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            text: msg.content
          }));
          setChatMessages(formattedHistory);
        } else {
          setChatMessages([{ role: 'model', text: '¡Hola! Soy unIA, tu Orientador Vocacional de UniAcceso. 🎓 ¿Qué materias te gustan más o cuáles son tus intereses principales?' }]);
        }
      } else {
        setChatMessages([{ role: 'model', text: '¡Hola! Soy unIA, tu Orientador Vocacional de UniAcceso. 🎓 ¿Qué materias te gustan más o cuáles son tus intereses principales?' }]);
      }
    };
    initChat();
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, text: '' });

    try {
      const { error } = await supabase.from('contact_messages').insert([formData]);
      if (error) throw error;
      setSubmitStatus({ type: 'success', text: '¡Mensaje enviado con éxito! Te contactaremos pronto.' });
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitStatus({ type: null, text: '' }), 5000);
    } catch (error) {
      setSubmitStatus({ type: 'error', text: 'Hubo un error al enviar el mensaje.' });
    } finally {
      setIsSubmitting(false);
    }
  };

const handleSendChat = async (e) => {
  e.preventDefault();
  if (!chatInput.trim()) return;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const userText = chatInput.trim();
  
  setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
  setChatInput("");
  setIsTyping(true);
  setChatError(null);

  // 1. Guardar mensaje del usuario en el historial
  if (currentUser) {
    supabase.from('chat_history').insert({
      user_id: currentUser.id,
      role: 'user',
      content: userText
    }).then();
  }

  try {
    // --- PASO CLAVE: BÚSQUEDA DE CONTEXTO (RAG) ---
    // Buscamos en la base de datos si el usuario menciona algo relevante
    let contextData = "";
    
    // Consultamos programas o universidades que coincidan con palabras del usuario
    const { data: dbContext } = await supabase
      .from('programs')
      .select('name, level, modality, duration, universities(name)')
      .ilike('name', `%${userText.split(' ')[0]}%`) // Busca por la primera palabra clave
      .limit(5);

    if (dbContext && dbContext.length > 0) {
      contextData = "CONTEXTO DE LA BASE DE DATOS DE UNIACCESO:\n" + 
        dbContext.map(p => `- Programa: ${p.name}, Nivel: ${p.level}, Modalidad: ${p.modality}, Duración: ${p.duration} semestres en la institución ${p.universities?.name}`).join('\n');
    }
    // ----------------------------------------------

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `Eres unIA, el Orientador Vocacional oficial de UniAcceso. 
      Usa el siguiente contexto de nuestra base de datos para responder si es relevante. 
      Si el contexto no contiene la respuesta, usa tu conocimiento general pero prioriza siempre los datos de UniAcceso.
      
      ${contextData}`
    });

    const historyForGemini = chatMessages
      .filter(msg => msg.text !== '¡Hola! Soy unIA, tu Orientador Vocacional de UniAcceso. 🎓 ¿Qué materias te gustan más o cuáles son tus intereses principales?')
      .map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

    const chat = model.startChat({ history: historyForGemini });
    const result = await chat.sendMessage(userText);
    const botResponse = result.response.text();

    setChatMessages(prev => [...prev, { role: 'model', text: botResponse }]);

    if (currentUser) {
      supabase.from('chat_history').insert({
        user_id: currentUser.id,
        role: 'assistant',
        content: botResponse
      }).then();
    }

  } catch (error) {
    console.error("Error unIA:", error);
    setChatError("Error: " + error.message);
  } finally {
    setIsTyping(false);
  }
};

  return (
    <div className="min-h-screen bg-white flex flex-col pt-16">
      <main className="grow flex items-center justify-center px-4 pb-12">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-stretch">

          <section className="relative bg-white p-10 rounded-3xl shadow-xl border border-purple-100 flex flex-col justify-center">
            <div className="absolute -top-6 left-10 bg-linear-to-br from-purple-600 to-emerald-400 p-4 rounded-2xl shadow-lg rotate-3 hover:rotate-0 transition-transform">
              <Mail className="w-8 h-8 text-white" />
            </div>

            <h1 className="mt-4 text-4xl font-extrabold text-purple-900 mb-2">Contáctanos</h1>
            <p className="text-gray-600 mb-6 font-medium">Tu opinión es vital para la comunidad. Escríbenos y te responderemos pronto.</p>

            {submitStatus.type === 'success' && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 font-bold animate-pulse">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p>{submitStatus.text}</p>
              </div>
            )}
            {submitStatus.type === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-bold text-sm">
                <p>{submitStatus.text}</p>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 font-semibold text-purple-800">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
                  <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full pl-10 p-3 bg-purple-50/50 border border-purple-100 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-purple-800">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
                  <input type="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="w-full pl-10 p-3 bg-purple-50/50 border border-purple-100 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-purple-800">Mensaje</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 text-purple-300" />
                  <textarea name="message" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} rows="4" required className="w-full pl-10 p-3 bg-purple-50/50 border border-purple-100 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none transition-all resize-none"></textarea>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full bg-linear-to-r from-purple-600 to-emerald-500 hover:from-purple-700 hover:to-emerald-600 text-white font-bold py-3 rounded-xl shadow-md transform hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </div>
            </form>
          </section>

          <section className="relative bg-linear-to-br from-purple-900 to-purple-800 p-6 sm:p-10 rounded-3xl shadow-xl border border-purple-700 flex flex-col h-175 overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-purple-700/50">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    unIA
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  </h2>
                  <p className="text-purple-200 text-sm font-medium">Orientador impulsado por IA</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar mb-4">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && (
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-md">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] text-sm p-4 font-medium shadow-md ${
                      msg.role === 'user' 
                        ? 'bg-purple-500 text-white rounded-2xl rounded-tr-none' 
                        : 'bg-white/10 backdrop-blur-md text-purple-50 border border-white/10 rounded-2xl rounded-tl-none leading-relaxed'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-md">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white/10 backdrop-blur-md text-emerald-300 text-sm p-4 rounded-2xl rounded-tl-none font-medium flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> unIA está analizando...
                    </div>
                  </div>
                )}
                
                {chatError && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {chatError}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendChat} className="relative mt-auto">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Escribe tu mensaje a unIA..." 
                  disabled={isTyping}
                  className="w-full bg-black/30 border border-white/20 rounded-2xl py-4 pl-5 pr-14 text-white placeholder-purple-300 outline-none focus:ring-2 focus:ring-emerald-400 transition-all disabled:opacity-50" 
                />
                <button type="submit" disabled={isTyping || !chatInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:bg-transparent disabled:text-emerald-500">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default Contacto;