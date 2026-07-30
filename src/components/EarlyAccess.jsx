import React, { useState } from 'react';
import { supabase } from '../createClient'; 

export default function EarlyAccess() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ nombre, email }]);

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este correo ya está registrado para el acceso anticipado.');
        }
        throw error;
      }

      setStatusMessage({
        type: 'success',
        text: '¡Registro exitoso! Te avisaremos en cuanto la app esté lista.',
      });
      setNombre('');
      setEmail('');
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: error.message || 'Hubo un problema al registrarte. Inténtalo de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between px-6 py-8 md:py-12">

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center max-w-7xl mx-auto w-full my-6 md:my-10">

        <div className="flex flex-col gap-5 md:gap-6 lg:col-span-7 xl:col-span-7 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-gray-900 text-balance">
            Democratizando el acceso a la <span className="text-purple-700">educación</span>
          </h1>

          <p className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
            Estamos construyendo la herramienta definitiva para centralizar oportunidades de educación superior, becas y orientación vocacional. Únete a la lista de espera y obtén acceso antes que nadie.
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-4 w-full max-w-md mt-2 mx-auto lg:mx-0">
            <input
              type="text"
              placeholder="Tu nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              disabled={loading}
              className="w-full px-5 py-3.5 bg-white border border-gray-300 rounded-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors text-base"
            />
            <input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-5 py-3.5 bg-white border border-gray-300 rounded-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors text-base"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-700 hover:bg-purple-800 disabled:bg-gray-400 text-white font-semibold py-3.5 rounded-sm transition-colors"
            >
              {loading ? 'Asegurando lugar...' : 'Asegurar mi acceso anticipado'}
            </button>
          </form>

          {statusMessage.text && (
            <div
              className={`mt-2 p-4 rounded-sm text-sm max-w-md font-medium border mx-auto lg:mx-0 text-left w-full ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {statusMessage.text}
            </div>
          )}
        </div>

        <div className="flex justify-center lg:justify-end items-center w-full lg:col-span-5 xl:col-span-5 mt-4 lg:mt-0">
          <img
            src="/mockup-phone.png"
            alt="UniAcceso App Mockup"
            className="w-full max-w-72.5 sm:max-w-sm lg:max-w-md"
          />
        </div>
      </main>
    </div>
  );
}