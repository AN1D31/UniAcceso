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
    <div className="min-h-screen bg-[#0b0b0f] flex flex-col justify-between relative px-6 py-6 md:py-8 overflow-x-hidden text-gray-100 font-sans">

      <div className="absolute w-75 md:w-125 h-75 md:h-125 bg-purple-600 rounded-full blur-[100px] md:blur-[150px] opacity-20 -top-20 -left-20 pointer-events-none"></div>
      <div className="absolute w-75 md:w-125 h-75 md:h-125 bg-emerald-500 rounded-full blur-[100px] md:blur-[150px] opacity-15 -bottom-20 -right-20 pointer-events-none"></div>

      <header className="flex justify-between items-center z-10 max-w-7xl mx-auto w-full border-b border-white/5 pb-4 lg:border-none lg:pb-0">
        <div className="flex items-center gap-3 text-xl md:text-2xl font-extrabold tracking-tight mx-auto sm:mx-0">
          <img 
            src="/uniaccesologo.png" 
            alt="Logo UniAcceso" 
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl object-cover shadow-lg"
          />
          <span>Uni<span className="text-purple-500">Acceso</span></span>
        </div>
        
        <span className="bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-1.5 rounded-full text-sm font-semibold hidden sm:inline-block">
          Próximamente App Móvil
        </span>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center z-10 max-w-7xl mx-auto w-full my-8 md:my-12">
        
        <div className="flex flex-col gap-5 md:gap-6 lg:col-span-7 xl:col-span-7 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4rem] font-extrabold leading-[1.15] lg:leading-[1.1] tracking-tight text-balance">
            Democratizando el acceso a la{' '}
            <span className="bg-linear-to-r from-purple-500 to-emerald-400 bg-clip-text text-transparent block sm:inline">
              educación
            </span>
          </h1>
          
          <p className="text-gray-400 text-base sm:text-lg md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">
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
              className="w-full px-5 py-3.5 md:py-4 bg-[#13131a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-base"
            />
            <input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-5 py-3.5 md:py-4 bg-[#13131a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-base"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white font-bold py-3.5 md:py-4 rounded-xl transition-all shadow-[0_5px_20px_rgba(139,92,246,0.2)] hover:shadow-[0_5px_25px_rgba(139,92,246,0.4)] lg:hover:-translate-y-1"
            >
              {loading ? 'Asegurando lugar...' : 'Asegurar mi acceso anticipado'}
            </button>
          </form>

          {statusMessage.text && (
            <div
              className={`mt-2 p-4 rounded-xl text-sm max-w-md font-medium border mx-auto lg:mx-0 text-left w-full ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/50 text-red-400'
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
            className="w-full max-w-72.5 sm:max-w-sm lg:max-w-lg xl:max-w-xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] lg:hover:-translate-y-3 transition-transform duration-700 ease-in-out"
          />
        </div>
      </main>

      <footer className="text-center text-gray-500 text-xs md:text-sm z-10 max-w-7xl mx-auto w-full pt-6 border-t border-white/5 lg:border-none">
        <p>© {new Date().getFullYear()} UniAcceso — Proyecto de Investigación y Desarrollo</p>
      </footer>
    </div>
  );
}