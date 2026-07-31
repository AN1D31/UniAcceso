import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../createClient";
import { differenceInDays } from "date-fns";
import { Calendar, MapPin, Info, Monitor, Users, Ticket, Star, Search, Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminAddButton from "../components/AdminAddButton";

const ICONS = {
  Virtual: <Monitor className="w-4 h-4 mr-1" />, 
  Presencial: <Users className="w-4 h-4 mr-1" />, 
  "Cupos limitados": <Ticket className="w-4 h-4 mr-1" />, 
  Gratuito: <Star className="w-4 h-4 mr-1" />, 
};

const TAG_STYLES = {
  Virtual: "bg-purple-100 text-purple-700 border-purple-300",
  Presencial: "bg-emerald-100 text-emerald-700 border-emerald-300",
  "Cupos limitados": "bg-amber-100 text-amber-800 border-amber-300",
  Gratuito: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300",
};

const DAYS_STYLES = dias => {
  if (dias < 10) return "bg-rose-100 text-rose-700 border-rose-200";
  if (dias < 30) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
};

export default function Eventos() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [typeModal, setTypeModal] = useState(null); 

  const [formData, setFormData] = useState({
    id: '', title: '', display_date: '', iso_date: '', location: '', description: '', url: '', tags: ''
  });

  useEffect(() => {
    checkAdminRole();
    fetchEvents();
  }, []);

  async function checkAdminRole() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (data && data.role === 'admin') setIsAdmin(true);
    }
  }

  async function fetchEvents() {
    const { data, error } = await supabase.from('trainings').select('*').order('iso_date', { ascending: true });
    if (!error && data) {
      const mappedEvents = data.map(ev => ({
        id: ev.id, titulo: ev.title, fecha: ev.display_date, fechaISO: ev.iso_date,
        lugar: ev.location, descripcion: ev.description, enlace: ev.url, etiquetas: ev.tags
      }));
      setEvents(mappedEvents);
    }
    setLoading(false);
  }

  const handleCreateOrUpdateEvent = async (e) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map(tag => tag.trim());
    
    if (typeModal === 'crear') {
      await supabase.from('trainings').insert({
        title: formData.title, display_date: formData.display_date, iso_date: formData.iso_date,
        location: formData.location, description: formData.description, url: formData.url, tags: tagsArray
      });
    } else if (typeModal === 'editar') {
      await supabase.from('trainings').update({
        title: formData.title, display_date: formData.display_date, iso_date: formData.iso_date,
        location: formData.location, description: formData.description, url: formData.url, tags: tagsArray
      }).eq('id', formData.id);
    }

    fetchEvents();
    setTypeModal(null);
    setFormData({ id: '', title: '', display_date: '', iso_date: '', location: '', description: '', url: '', tags: '' });
  };

  const deleteEvent = async (id) => {
    const confirm = window.confirm("¿Seguro que deseas eliminar este evento?");
    if (!confirm) return;
    await supabase.from('trainings').delete().eq('id', id);
    fetchEvents();
  };

  const displayEventForEdit = (ev) => {
    setFormData({
      id: ev.id, title: ev.titulo, display_date: ev.fecha, iso_date: ev.fechaISO,
      location: ev.lugar, description: ev.descripcion, url: ev.enlace, tags: ev.etiquetas.join(', ')
    });
    setTypeModal('editar');
  };

  const filtered = useMemo(() => {
    return events
      .filter(e => e.titulo.toLowerCase().includes(search.toLowerCase()))
      .filter(e => activeTags.length ? activeTags.every(tag => e.etiquetas?.includes(tag)) : true);
  }, [events, search, activeTags]);

  const toggleTag = tag => setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  return (
    <section className="min-h-screen bg-white py-8 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
            Recursos
          </h1>
          <p className="text-gray-600 mt-2">Ferias, congresos, charlas y demás recursos para tu camino académico.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white p-4 border border-gray-200">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar recursos..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-sm border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 transition-colors" />
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            {Object.keys(TAG_STYLES).map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)} className={`flex items-center text-sm font-semibold px-4 py-2 rounded-sm border transition-colors ${activeTags.includes(tag) ? `${TAG_STYLES[tag]} border-purple-400` : `bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100`}`}>
                {ICONS[tag]}{tag}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 font-semibold text-gray-600">Cargando recursos...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {isAdmin && (
              <div className="h-full">
                <AdminAddButton 
                  onClick={() => {
                    setFormData({ id: '', title: '', display_date: '', iso_date: '', location: '', description: '', url: '', tags: '' });
                    setTypeModal('crear');
                  }} 
                  label="Registrar Nuevo Evento" 
                  description="Añade ferias, congresos o charlas al calendario." 
                />
              </div>
            )}

            <AnimatePresence>
              {filtered.map((evento) => {
                const dias = differenceInDays(new Date(evento.fechaISO), new Date());
                return (
                  <motion.div key={evento.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-gray-200 flex flex-col overflow-hidden h-full min-h-75">
                    <div className="p-6 flex flex-col grow">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {evento.etiquetas?.map((et, i) => (
                          <span key={i} className={`flex items-center text-xs font-semibold px-2.5 py-1 rounded-sm border ${TAG_STYLES[et] || 'bg-gray-100 text-gray-700'}`}>
                            {ICONS[et] || ''} {et}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">{evento.titulo}</h2>
                      <div className="flex items-center text-sm font-medium text-gray-600 gap-2 mb-2 bg-gray-50 p-2.5 rounded-sm border border-gray-200">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{evento.fecha}</span>
                        {dias >= 0 && <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded-sm border ${DAYS_STYLES(dias)}`}>Faltan {dias} días</span>}
                      </div>
                      <div className="flex items-center text-sm font-medium text-gray-600 gap-2 mb-4 px-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{evento.lugar}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-6 line-clamp-3 grow">{evento.descripcion}</p>

                      <Link to={`/recursos/${evento.id}`} className="mt-auto flex items-center justify-center py-3 px-4 bg-purple-700 text-white hover:bg-purple-800 font-semibold rounded-sm transition-colors">
                        <Info className="w-5 h-5 mr-2" /> Ver detalles
                      </Link>

                      {isAdmin && (
                        <div className="flex justify-between gap-3 pt-4 border-t border-gray-200 mt-4">
                          <button onClick={() => deleteEvent(evento.id)} className="flex items-center justify-center w-1/2 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-sm transition-colors">
                            <Trash2 className="w-4 h-4 mr-1.5" /> Eliminar
                          </button>
                          <button onClick={() => displayEventForEdit(evento)} className="flex items-center justify-center w-1/2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-sm transition-colors">
                            <Edit className="w-4 h-4 mr-1.5" /> Editar
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {typeModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 md:p-8 max-w-lg w-full relative border border-gray-200">
              <button onClick={() => setTypeModal(null)} className="absolute top-5 right-5 w-8 h-8 rounded-sm bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 font-bold">&times;</button>
              <h2 className="text-xl font-semibold mb-6 text-gray-900 text-center">
                {typeModal === 'crear' ? 'Registrar Evento' : 'Editar Evento'}
              </h2>
              <form onSubmit={handleCreateOrUpdateEvent} className="flex flex-col gap-4">
                <input type="text" placeholder="Título (Ej. Expo Estudiante)" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="p-3 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600" required />
                <div className="flex gap-4">
                  <input type="text" placeholder="Fecha a mostrar (Ej. 28 de Oct)" value={formData.display_date} onChange={e=>setFormData({...formData, display_date: e.target.value})} className="p-3 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 w-1/2" required />
                  <input type="date" value={formData.iso_date} onChange={e=>setFormData({...formData, iso_date: e.target.value})} className="p-3 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 w-1/2" required title="Fecha exacta para el contador" />
                </div>
                <input type="text" placeholder="Lugar (Ej. Corferias)" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} className="p-3 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600" required />
                <textarea placeholder="Descripción" rows="3" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="p-3 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 resize-none" required />
                <input type="url" placeholder="URL Oficial" value={formData.url} onChange={e=>setFormData({...formData, url: e.target.value})} className="p-3 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600" required />
                <input type="text" placeholder="Etiquetas (separadas por comas. Ej: Virtual, Gratuito)" value={formData.tags} onChange={e=>setFormData({...formData, tags: e.target.value})} className="p-3 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 text-sm" required />
                <button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3.5 rounded-sm transition-colors mt-2">
                  {typeModal === 'crear' ? 'Guardar Evento' : 'Actualizar Evento'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}