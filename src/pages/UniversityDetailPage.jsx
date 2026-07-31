import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Search, Clock, Monitor, Target, BookOpen, ArrowLeft } from 'lucide-react';
import { supabase } from '../createClient';

const SECTIONS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'oferta', label: 'Oferta Académica' },
  { id: 'mision', label: 'Misión y Visión' },
];

const UniversityDetailPage = () => {
  const { universityId } = useParams();
  const [university, setUniversity] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalityFilter, setModalityFilter] = useState('');
  const [activeSectionId, setActiveSectionId] = useState(SECTIONS[0].id);
  const contentRef = useRef(null);

  useEffect(() => {
    setUniversity(null);
    setNotFound(false);

    supabase.from('universities').select('*').eq('id', universityId).single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
          return;
        }
        setUniversity({
          id: data.id, nombre: data.name, descripcion: data.description, departamento: data.department,
          nivel: data.level, tipo: data.type, imagen: data.image_url, url: data.website_url,
          misionVision: data.source_metadata?.mision_y_vision,
        });
      });

    setLoadingPrograms(true);
    supabase.from('programs').select('*').eq('university_id', universityId)
      .then(({ data, error }) => {
        if (!error && data) setPrograms(data);
        setLoadingPrograms(false);
      });
  }, [universityId]);

  useEffect(() => {
    if (!university) return;

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
  }, [university]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
        <p className="text-gray-700 font-semibold mb-4">No se encontró esta universidad.</p>
        <Link to="/explorar" className="text-purple-700 font-semibold hover:underline">Volver al explorador</Link>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  const filteredPrograms = programs.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModality = modalityFilter === '' || (p.modality || '').toLowerCase() === modalityFilter.toLowerCase();
    return matchesSearch && matchesModality;
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Link to="/explorar" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-purple-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Volver al explorador
          </Link>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white border border-gray-200 flex items-center justify-center p-2 shrink-0">
              <img
                src={university.imagen || "https://placehold.co/400x200/f3e8ff/7e22ce?text=Sin+Logo"}
                alt={university.nombre}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
                {university.nombre}
              </h1>
              <p className="text-gray-600 font-medium mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {university.departamento}
              </p>
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
            <div className="bg-white p-6 border border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Acerca de la Institución</h2>
              <p className="text-gray-700 leading-relaxed">
                {university.descripcion || "Información general no disponible por el momento."}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 border border-gray-200 text-center">
                <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nivel</span>
                <span className="font-semibold text-gray-800">{university.nivel || 'N/A'}</span>
              </div>
              <div className="bg-white p-4 border border-gray-200 text-center">
                <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sector</span>
                <span className="font-semibold text-gray-800">{university.tipo || 'N/A'}</span>
              </div>
              <div className="bg-white p-4 border border-gray-200 text-center col-span-2 md:col-span-2">
                <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sitio Web Oficial</span>
                <a href={university.url} target="_blank" rel="noreferrer" className="font-semibold text-purple-700 hover:underline truncate block">
                  {university.url ? university.url.replace('https://', '') : 'No disponible'}
                </a>
              </div>
            </div>
          </section>

          <section id="oferta">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Oferta Académica ({programs.length})</h2>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar programa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600 text-sm"
                />
              </div>
              <select
                value={modalityFilter}
                onChange={(e) => setModalityFilter(e.target.value)}
                className="bg-white border border-gray-300 rounded-sm px-4 py-2.5 outline-none focus:ring-1 focus:ring-purple-600 text-sm font-medium"
              >
                <option value="">Todas las modalidades</option>
                <option value="Presencial">Presencial</option>
                <option value="Virtual">Virtual</option>
                <option value="A distancia">A Distancia</option>
              </select>
            </div>

            {loadingPrograms ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
              </div>
            ) : filteredPrograms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPrograms.map(prog => (
                  <div key={prog.id} className="bg-white p-4 border border-gray-200 hover:border-purple-300 transition-colors">
                    <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2" title={prog.name}>
                      {prog.name}
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-sm">
                        <Target className="w-3 h-3 text-gray-400" /> {prog.level}
                      </span>
                      <span className="flex items-center gap-1">
                        <Monitor className="w-3 h-3 text-gray-400" /> {prog.modality}
                      </span>
                      {prog.duration > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" /> {prog.duration} semestres
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white border border-dashed border-gray-300">
                <BookOpen className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No se encontraron programas que coincidan con tu búsqueda.</p>
              </div>
            )}
          </section>

          <section id="mision">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Misión y Visión</h2>
            <div className="bg-white p-6 border border-gray-200">
              {university.misionVision ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line border-l-4 border-purple-200 pl-4 bg-gray-50 py-3">
                  {university.misionVision}
                </p>
              ) : (
                <p className="text-gray-700 leading-relaxed italic border-l-4 border-gray-300 pl-4 bg-gray-50 py-3">
                  Esta institución no ha proporcionado una misión específica en los registros de datos abiertos actuales.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UniversityDetailPage;
