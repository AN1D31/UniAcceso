import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, ExternalLink, ArrowLeft, Wallet } from 'lucide-react';
import { supabase } from '../createClient';

const SECTIONS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'requisitos', label: 'Requisitos' },
  { id: 'ubicacion', label: 'Ubicación' },
];

const COVERAGE_LABELS = {
  parcial: 'Cobertura parcial',
  total: 'Cobertura total',
  manutencion: 'Manutención',
  matricula: 'Matrícula',
};

const ScholarshipDetailPage = () => {
  const { scholarshipId } = useParams();
  const [scholarship, setScholarship] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(SECTIONS[0].id);
  const contentRef = useRef(null);

  useEffect(() => {
    setScholarship(null);
    setNotFound(false);

    supabase
      .from('scholarships')
      .select('*, universities(name, image_url), sponsors(name, website_url), cities(name), countries(name)')
      .eq('id', scholarshipId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
          return;
        }
        setScholarship(data);
      });
  }, [scholarshipId]);

  useEffect(() => {
    if (!scholarship) return;

    const handleScroll = () => {
      let current = SECTIONS[0].id;
      for (const { id } of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) {
          current = id;
        }
      }
      setActiveSectionId(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scholarship]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
        <p className="text-gray-700 font-semibold mb-4">No se encontró esta beca.</p>
        <Link to="/becas" className="text-purple-700 font-semibold hover:underline">Volver al directorio de becas</Link>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  const grantedBy = scholarship.sponsors?.name || scholarship.universities?.name;
  const location = scholarship.location || [scholarship.cities?.name, scholarship.countries?.name].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Link to="/becas" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-purple-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Volver al directorio de becas
          </Link>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white border border-gray-200 flex items-center justify-center p-2 shrink-0">
              <img
                src={scholarship.image_url || scholarship.universities?.image_url || "https://placehold.co/400x200/f3e8ff/7e22ce?text=Beca"}
                alt={scholarship.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
                {scholarship.name}
              </h1>
              {grantedBy && (
                <p className="text-gray-600 font-medium mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Otorgada por {grantedBy}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible border-b lg:border-b-0 border-gray-200 pb-3 lg:pb-0 lg:sticky lg:top-24">
            {SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className={`px-3 py-2 text-sm whitespace-nowrap border-l-2 transition-colors ${
                  activeSectionId === id
                    ? 'font-bold border-purple-700 text-purple-700'
                    : 'font-medium text-gray-500 border-transparent hover:text-gray-800'
                }`}
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <div ref={contentRef} className="lg:col-span-3 space-y-12">
          <section id="resumen" className="space-y-6">
            <a
              href={scholarship.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-full py-3.5 bg-purple-700 text-white hover:bg-purple-800 font-semibold rounded-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Aplicar en Sitio Oficial
            </a>

            <div className="bg-white p-6 border border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Descripción</h2>
              <p className="text-gray-700 leading-relaxed">
                {scholarship.description || "Información general no disponible por el momento."}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 border border-gray-200 text-center">
                <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Monto</span>
                <span className={`font-semibold flex items-center justify-center gap-1.5 ${scholarship.amount ? 'text-gray-800' : 'text-green-600'}`}>
                  <Wallet className="w-4 h-4 text-gray-400" />
                  {scholarship.amount ? `${scholarship.amount} ${scholarship.currency || ''}` : 'Gratuito'}
                </span>
              </div>
              <div className="bg-white p-4 border border-gray-200 text-center">
                <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cobertura</span>
                <span className="font-semibold text-gray-800">{COVERAGE_LABELS[scholarship.coverage] || 'N/A'}</span>
              </div>
              <div className="bg-white p-4 border border-gray-200 text-center col-span-2 md:col-span-2">
                <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Vigencia</span>
                <span className="font-semibold text-gray-800 flex items-center justify-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {scholarship.start_date || 'N/A'} — {scholarship.finish_date || 'N/A'}
                </span>
              </div>
            </div>
          </section>

          <section id="requisitos">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Requisitos</h2>
            <div className="bg-white p-6 border border-gray-200">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {scholarship.requirements || "Esta beca no ha proporcionado requisitos específicos en los registros de datos abiertos actuales."}
              </p>
            </div>
          </section>

          <section id="ubicacion">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Ubicación</h2>
            <div className="bg-white p-6 border border-gray-200">
              <p className="text-gray-700 leading-relaxed flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                {location || "Ubicación no especificada."}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetailPage;
