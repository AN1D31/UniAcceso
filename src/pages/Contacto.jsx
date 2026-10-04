import React, { useState } from "react";
import { supabase } from "../createClient";
import { User, Mail, MessageSquare, Bot, CheckCircle2 } from "lucide-react";
import ChatBot from "../components/ChatBot";

const Contacto = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: null, text: '' });

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
                <p className="text-gray-500 text-sm">Test vocacional guiado</p>
              </div>
            </div>

            <ChatBot />
          </section>

        </div>
      </div>
    </div>
  );
};

export default Contacto;