import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, BookOpen, BrainCircuit, Users, Sparkles, Bot } from 'lucide-react';

const Home = () => {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center pt-20 px-6">
      
      <section className="text-center max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm mb-6 shadow-sm border border-emerald-200">
          <Sparkles className="w-4 h-4" />
          <span>Tu futuro académico sin barreras</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-800 to-emerald-500 mb-6 leading-tight">
          Democratizando el acceso a la educación
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 font-medium max-w-2xl mx-auto">
          UniAcceso centraliza las oportunidades de educación superior. Explora universidades, descubre becas y encuentra tu camino ideal con herramientas adaptadas al contexto latinoamericano.
        </p>
        
        <div className="flex flex-col items-center gap-6 mb-12">
          
          <Link 
            to="/contacto" 
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-extrabold rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] overflow-hidden text-lg w-full sm:w-auto"
          >
            <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 ease-in-out skew-x-12"></div>
            <Bot className="w-6 h-6 animate-pulse" />
            ¿No sabes qué estudiar? Habla con unIA
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
            <Link to="/explorar" className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-md transition-transform hover:-translate-y-1 flex items-center justify-center gap-2 flex-1 sm:flex-none">
              <Compass className="w-5 h-5" /> Explorar Universidades
            </Link>
            <Link to="/becas" className="px-8 py-3.5 bg-white text-purple-700 border border-purple-200 hover:bg-purple-50 font-bold rounded-2xl shadow-sm transition-transform hover:-translate-y-1 flex items-center justify-center gap-2 flex-1 sm:flex-none">
              <BookOpen className="w-5 h-5" /> Directorio de Becas
            </Link>
          </div>

        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16 pb-20 w-full">
        
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-purple-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 group cursor-default">
          <div className="bg-linear-to-br from-emerald-100 to-emerald-200 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-emerald-700 group-hover:scale-110 transition-transform shadow-inner">
            <BrainCircuit className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-purple-900 mb-3 flex items-center gap-2">
            Orientación con unIA <Sparkles className="w-5 h-5 text-emerald-500" />
          </h3>
          <p className="text-gray-600 font-medium leading-relaxed">
            ¿Indeciso? Chatea con nuestro asistente virtual impulsado por <strong className="text-purple-700">Google Gemini</strong>. Descubre tu vocación y recibe sugerencias de carreras personalizadas en segundos.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-purple-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 group cursor-default">
          <div className="bg-purple-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-purple-900 mb-3">Oportunidades Reales</h3>
          <p className="text-gray-600 font-medium leading-relaxed">
            Buscador avanzado de becas sin barreras idiomáticas ni muros de pago. Información transparente y accesible para todos.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-purple-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 group cursor-default">
          <div className="bg-amber-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-amber-600 group-hover:scale-110 transition-transform">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-purple-900 mb-3">Comunidad Activa</h3>
          <p className="text-gray-600 font-medium leading-relaxed">
            Conecta con eventos, ferias universitarias y mentorías culturales enfocadas en el desarrollo integral estudiantil.
          </p>
        </div>
        
      </section>
      
    </main>
  );
};

export default Home;