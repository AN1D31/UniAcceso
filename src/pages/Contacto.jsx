import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../createClient";
import { User, Mail, MessageSquare, Bot, Send, CheckCircle2, Loader2 } from "lucide-react";

const BOT_UNAVAILABLE_REPLY = 'Lo sentimos, estamos trabajando actualmente en el bot para guiarte en tu aplicación a becas. Pronto lo tendremos listo, pero por el momento no se encuentra disponible.';

const Contacto = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: null, text: '' });

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
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

const handleSendChat = (e) => {
  e.preventDefault();
  if (!chatInput.trim()) return;

  const userText = chatInput.trim();

  setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
  setChatInput("");
  setIsTyping(true);

  if (currentUser) {
    supabase.from('chat_history').insert({
      user_id: currentUser.id,
      role: 'user',
      content: userText
    }).then();
  }

  setTimeout(() => {
    setChatMessages(prev => [...prev, { role: 'model', text: BOT_UNAVAILABLE_REPLY }]);
    setIsTyping(false);
  }, 1000);
};

  return (
    <div className="min-h-screen bg-white pt-8 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">Contáctanos</h1>
          <p className="text-gray-600 mt-2">Tu opinión es vital para la comunidad. Escríbenos y te responderemos pronto.</p>
        </div>

        <div className="grid md:grid-cols-2 border border-gray-200 divide-y md:divide-y-0 md:divide-x divide-gray-200">

          <section className="bg-white p-6 md:p-8 flex flex-col justify-center">
            <Mail className="w-8 h-8 text-purple-700 mb-4" strokeWidth={1.75} />

            {submitStatus.type === 'success' && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-sm flex items-center gap-3 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p>{submitStatus.text}</p>
              </div>
            )}
            {submitStatus.type === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm text-red-700 font-semibold text-sm">
                <p>{submitStatus.text}</p>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 font-semibold text-gray-800">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-sm focus:ring-1 focus:ring-purple-600 focus:border-purple-600 outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-800">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input type="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-sm focus:ring-1 focus:ring-purple-600 focus:border-purple-600 outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-800">Mensaje</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 text-gray-400" />
                  <textarea name="message" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} rows="4" required className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-sm focus:ring-1 focus:ring-purple-600 focus:border-purple-600 outline-none transition-colors resize-none"></textarea>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3 rounded-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </div>
            </form>
          </section>

          <section className="bg-gray-50 p-6 md:p-8 flex flex-col h-175">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              <div className="w-10 h-10 rounded-sm bg-purple-700 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">unIA</h2>
                <p className="text-gray-500 text-sm">Orientador impulsado por IA</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar mb-4">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-sm bg-purple-700 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] text-sm p-3 font-medium ${
                    msg.role === 'user'
                      ? 'bg-purple-700 text-white'
                      : 'bg-white text-gray-800 border border-gray-200 leading-relaxed'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-sm bg-purple-700 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white text-gray-600 text-sm p-3 border border-gray-200 font-medium flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> unIA está analizando...
                  </div>
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
                className="w-full bg-white border border-gray-300 rounded-sm py-3 pl-4 pr-12 text-gray-900 placeholder-gray-400 outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 transition-colors disabled:opacity-50"
              />
              <button type="submit" disabled={isTyping || !chatInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-700 hover:bg-purple-800 text-white rounded-sm transition-colors disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Contacto;