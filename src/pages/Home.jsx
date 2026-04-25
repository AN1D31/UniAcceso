import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, BookOpen, BrainCircuit, Users, Sparkles } from 'lucide-react';

const Home = () => {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center pt-20 px-6">
      
      <section className="text-center max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm mb-6 shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span>Tu futuro académico sin barreras</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-800 to-emerald-500 mb-6 leading-tight">
          Democratizando el acceso a la educación
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 font-medium max-w-2xl mx-auto">
          UniAcceso centraliza las oportunidades de educación superior. Explora universidades, descubre becas y encuentra tu camino ideal con herramientas adaptadas al contexto latinoamericano.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/explorar" className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2">
            <Compass className="w-5 h-5" /> Explorar Universidades
          </Link>
          <Link to="/becas" className="px-8 py-4 bg-white text-purple-700 border border-purple-200 hover:bg-purple-50 font-bold rounded-2xl shadow-sm transition-transform hover:-translate-y-1 flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5" /> Directorio de Becas
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-24 pb-20 w-full">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
          <div className="bg-purple-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
            <BrainCircuit className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-purple-900 mb-3">Orientación Inteligente</h3>
          <p className="text-gray-600 font-medium">Algoritmos diseñados para sugerirte programas académicos que realmente se ajusten a tu perfil y habilidades.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
          <div className="bg-emerald-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-purple-900 mb-3">Oportunidades Reales</h3>
          <p className="text-gray-600 font-medium">Buscador avanzado de becas sin barreras idiomáticas ni muros de pago. Información transparente y accesible.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
          <div className="bg-amber-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-amber-600">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold text-purple-900 mb-3">Comunidad Activa</h3>
          <p className="text-gray-600 font-medium">Conecta con eventos, ferias universitarias y mentorías culturales enfocadas en el desarrollo estudiantil.</p>
        </div>
      </section>
      
    </main>
  );
};

export default Home;