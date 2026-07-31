import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, ExternalLink, ArrowLeft, Award } from 'lucide-react';
import { supabase } from '../createClient';

const SECTIONS = [
  { id: 'general', label: 'Información General' },
  { id: 'participacion', label: 'Detalles de Participación' },
];

const TYPE_LABELS = {
  evento_sincronico: 'Evento',
  curso_asincronico: 'Curso',
  taller_practico: 'Taller',
};

const MODALITY_LABELS = {
  virtual: 'Virtual',
  presencial: 'Presencial',
  hibrido: 'Híbrido',
};

const CERTIFICATION_LABELS = {
  merito: 'Certificado de mérito',
  asistencia: 'Certificado de asistencia',
  oficial: 'Certificado oficial',
  ninguno: 'Sin certificación',
};

const ResourceDetailPage = () => {
  const { resourceId } = useParams();
  const [resource, setResource] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(SECTIONS[0].id);
  const contentRef = useRef(null);

  useEffect(() => {
    setResource(null);
    setNotFound(false);

    supabase
      .from('trainings')
      .select('*, sponsors(name, website_url), cities(name), countries(name)')
      .eq('id', resourceId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
          return;
        }
        setResource(data);
      });
  }, [resourceId]);

  useEffect(() => {
    if (!resource) return;

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
  }, [resource]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
        <p className="text-gray-700 font-semibold mb-4">No se encontró este recurso.</p>
        <Link to="/recursos" className="text-purple-700 font-semibold hover:underline">Volver a recursos</Link>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  const location = resource.location || [resource.cities?.name, resource.countries?.name].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Link to="/recursos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-purple-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Volver a recursos
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
              {resource.title}
            </h1>
            {resource.sponsors?.name && (
              <p className="text-gray-600 font-medium mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> Organizado por {resource.sponsors.name}
              </p>
            )}
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
          <section id="general" className="space-y-6">
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-full py-3.5 bg-purple-700 text-white hover:bg-purple-800 font-semibold rounded-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Ir al Recurso
            </a>

            <div className="bg-white p-6 border border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Descripción</h2>
              <p className="text-gray-700 leading-relaxed">
                {resource.description || "Información general no disponible por el momento."}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 border border-gray-200 text-center">
                <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tipo</span>
                <span className="font-semibold text-gray-800">{TYPE_LABELS[resource.type] || 'N/A'}</span>
              </div>
              <div className="bg-white p-4 border border-gray-200 text-center">
                <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Modalidad</span>
                <span className="font-semibold text-gray-800">{MODALITY_LABELS[resource.modality] || 'N/A'}</span>
              </div>
              <div className="bg-white p-4 border border-gray-200 text-center">
                <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Costo</span>
                <span className="font-semibold text-gray-800">{resource.is_free ? 'Gratuito' : 'De pago'}</span>
              </div>
            </div>
          </section>

          <section id="participacion">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Detalles de Participación</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 border border-gray-200 text-center">
                <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fecha</span>
                <span className="font-semibold text-gray-800 flex items-center justify-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" /> {resource.display_date || resource.iso_date || 'N/A'}
                </span>
              </div>
              <div className="bg-white p-4 border border-gray-200 text-center">
                <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Lugar</span>
                <span className="font-semibold text-gray-800 flex items-center justify-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" /> {location || 'N/A'}
                </span>
              </div>
              <div className="bg-white p-4 border border-gray-200 text-center">
                <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Certificación</span>
                <span className="font-semibold text-gray-800 flex items-center justify-center gap-1.5">
                  <Award className="w-4 h-4 text-gray-400" /> {CERTIFICATION_LABELS[resource.certification_type] || 'N/A'}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailPage;
