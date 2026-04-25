import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../createClient";
import { differenceInDays, format } from "date-fns";
import { Calendar, MapPin, Info, CalendarDays, Monitor, Users, Ticket, Star, Search, Edit, Trash2 } from "lucide-react";
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
    const { data, error } = await supabase.from('events').select('*').order('iso_date', { ascending: true });
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
      await supabase.from('events').insert({
        title: formData.title, display_date: formData.display_date, iso_date: formData.iso_date,
        location: formData.location, description: formData.description, url: formData.url, tags: tagsArray
      });
    } else if (typeModal === 'editar') {
      await supabase.from('events').update({
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
    await supabase.from('events').delete().eq('id', id);
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
    <section className="min-h-screen bg-white py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-white shadow-sm border border-purple-100 mb-4">
            <CalendarDays className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="mt-2 text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-800 to-emerald-600">
            Eventos Universitarios
          </h1>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4 bg-white p-4 rounded-3xl shadow-sm border border-purple-100">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" />
            <input type="text" placeholder="Buscar eventos..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-2xl border border-purple-100 bg-purple-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition" />
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            {Object.keys(TAG_STYLES).map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)} className={`flex items-center text-sm font-bold px-4 py-2 rounded-xl border transition-all ${activeTags.includes(tag) ? `${TAG_STYLES[tag]} ring-2 ring-purple-400 scale-105 shadow-md` : `bg-gray-50 text-gray-500 border-gray-200 hover:bg-purple-50 hover:text-purple-600`}`}>
                {ICONS[tag]}{tag}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 font-bold text-purple-600">Cargando eventos...</div>
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
              {filtered.map((evento, idx) => {
                const dias = differenceInDays(new Date(evento.fechaISO), new Date());
                return (
                  <motion.div key={evento.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl border border-purple-100 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col overflow-hidden group h-full min-h-75">
                    <div className="h-2 w-full bg-linear-to-r from-purple-500 to-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-6 flex flex-col grow">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {evento.etiquetas?.map((et, i) => (
                          <span key={i} className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-lg border ${TAG_STYLES[et] || 'bg-gray-100 text-gray-700'}`}>
                            {ICONS[et] || ''} {et}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-xl font-extrabold text-purple-900 mb-3">{evento.titulo}</h2>
                      <div className="flex items-center text-sm font-medium text-gray-600 gap-2 mb-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span>{evento.fecha}</span>
                        {dias >= 0 && <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-lg border ${DAYS_STYLES(dias)}`}>Faltan {dias} días</span>}
                      </div>
                      <div className="flex items-center text-sm font-medium text-gray-600 gap-2 mb-4 px-2">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <span className="truncate">{evento.lugar}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-6 line-clamp-3 grow">{evento.descripcion}</p>
                      
                      <a href={evento.enlace} target="_blank" rel="noopener noreferrer" className="mt-auto flex items-center justify-center py-3 px-4 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white font-bold rounded-xl transition-all">
                        <Info className="w-5 h-5 mr-2" /> Ver detalles
                      </a>

                      {isAdmin && (
                        <div className="flex justify-between gap-3 pt-4 border-t border-purple-100 mt-4">
                          <button onClick={() => deleteEvent(evento.id)} className="flex items-center justify-center w-1/2 py-2 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 mr-1.5" /> Eliminar
                          </button>
                          <button onClick={() => displayEventForEdit(evento)} className="flex items-center justify-center w-1/2 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-3xl max-w-lg w-full shadow-2xl relative">
              <button onClick={() => setTypeModal(null)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 font-bold">&times;</button>
              <h2 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-linear-to-r from-purple-700 to-emerald-500 text-center">
                {typeModal === 'crear' ? 'Registrar Evento' : 'Editar Evento'}
              </h2>
              <form onSubmit={handleCreateOrUpdateEvent} className="flex flex-col gap-4">
                <input type="text" placeholder="Título (Ej. Expo Estudiante)" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="p-3 border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400" required />
                <div className="flex gap-4">
                  <input type="text" placeholder="Fecha a mostrar (Ej. 28 de Oct)" value={formData.display_date} onChange={e=>setFormData({...formData, display_date: e.target.value})} className="p-3 border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 w-1/2" required />
                  <input type="date" value={formData.iso_date} onChange={e=>setFormData({...formData, iso_date: e.target.value})} className="p-3 border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 w-1/2" required title="Fecha exacta para el contador" />
                </div>
                <input type="text" placeholder="Lugar (Ej. Corferias)" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} className="p-3 border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400" required />
                <textarea placeholder="Descripción" rows="3" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="p-3 border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 resize-none" required />
                <input type="url" placeholder="URL Oficial" value={formData.url} onChange={e=>setFormData({...formData, url: e.target.value})} className="p-3 border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400" required />
                <input type="text" placeholder="Etiquetas (separadas por comas. Ej: Virtual, Gratuito)" value={formData.tags} onChange={e=>setFormData({...formData, tags: e.target.value})} className="p-3 border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 text-sm" required />
                <button type="submit" className="bg-linear-to-r from-purple-600 to-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all mt-2">
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