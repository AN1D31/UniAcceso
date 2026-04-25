import React, { useState, useEffect } from 'react';
import { supabase } from '../createClient';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Camera, BookOpen, Briefcase, Star, Trash2, Save, Sparkles, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userAuth, setUserAuth] = useState(null);
  const [file, setFile] = useState(null);
  
  const [newPassword, setNewPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: null, text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [profileData, setProfileData] = useState({
    full_name: '', username: '', bio: '', avatar_url: '', backup_email: '', skills: '', academic_experience: '', work_experience: '', hobbies: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  async function fetchUserProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUserAuth(session.user);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfileData({
          full_name: data.full_name || '', username: data.username || '', bio: data.bio || '', avatar_url: data.avatar_url || '', backup_email: data.backup_email || '', skills: data.skills || '', academic_experience: data.academic_experience || '', work_experience: data.work_experience || '', hobbies: data.hobbies || ''
        });
      }
    } catch (error) {
      console.log('Error cargando perfil:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: null, text: '' }), 5000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ type: null, text: '' });
    let avatarUrl = profileData.avatar_url;

    try {
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userAuth.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { upsert: true });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          avatarUrl = publicUrlData.publicUrl;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name, username: profileData.username, bio: profileData.bio, avatar_url: avatarUrl, backup_email: profileData.backup_email, skills: profileData.skills, academic_experience: profileData.academic_experience, work_experience: profileData.work_experience, hobbies: profileData.hobbies
        })
        .eq('id', userAuth.id);

      if (error) throw error;

      if (newPassword.length >= 6) {
        const { error: passError } = await supabase.auth.updateUser({ password: newPassword });
        if (passError) throw passError;
        setNewPassword(''); 
      }

      showStatus('success', '¡Perfil actualizado con éxito!');
      fetchUserProfile(); 
    } catch (error) {
      showStatus('error', "Error actualizando perfil: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const executeDeleteAccount = async () => {
    try {
      const { error } = await supabase.rpc('delete_user');
      if (error) throw error;
      
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      setShowDeleteConfirm(false);
      showStatus('error', "Error al eliminar la cuenta: " + error.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-purple-600 font-bold">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-purple-50/30 py-12 px-4 sm:px-6 relative">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-800 to-emerald-600">
            Mi Panel de Estudiante
          </h1>
          <p className="text-gray-600 mt-2 font-medium">Configura tu perfil para destacar ante universidades y becas.</p>
        </div>

        {statusMsg.type === 'success' && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold text-center animate-pulse">
            <CheckCircle2 className="inline w-5 h-5 mr-2 -mt-0.5" />{statusMsg.text}
          </div>
        )}
        {statusMsg.type === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-bold text-center">
            <AlertTriangle className="inline w-5 h-5 mr-2 -mt-0.5" />{statusMsg.text}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-8">
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-8">
              <section className="bg-white p-8 rounded-3xl shadow-md border border-purple-100 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-100 bg-purple-50 flex items-center justify-center">
                    {profileData.avatar_url ? (
                      <img src={profileData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-purple-300" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors">
                    <Camera className="w-5 h-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                  </label>
                </div>

                <div className="w-full space-y-4 text-left">
                  <div>
                    <label className="text-xs font-bold text-purple-700 uppercase mb-1 block">Nombre Público</label>
                    <input type="text" name="full_name" value={profileData.full_name} onChange={handleChange} className="w-full p-3 bg-purple-50/50 border border-purple-100 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none font-medium" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-purple-700 uppercase mb-1 block">Usuario Único</label>
                    <div className="flex items-center">
                      <span className="bg-purple-100 p-3 rounded-l-xl border border-r-0 border-purple-200 text-purple-600 font-bold">@</span>
                      <input type="text" name="username" value={profileData.username} onChange={handleChange} className="w-full p-3 bg-purple-50/50 border border-purple-100 rounded-r-xl focus:ring-2 focus:ring-emerald-400 outline-none font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-purple-700 uppercase mb-1 block">Biografía Corta</label>
                    <textarea name="bio" value={profileData.bio} onChange={handleChange} rows="3" placeholder="¡Cuéntanos sobre ti!" className="w-full p-3 bg-purple-50/50 border border-purple-100 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none font-medium resize-none" />
                  </div>
                </div>
              </section>
            </div>

            <div className="md:col-span-2 space-y-8">
              <section className="bg-white p-8 rounded-3xl shadow-md border border-purple-100">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                  <Sparkles className="w-6 h-6 text-emerald-500" />
                  <h2 className="text-2xl font-extrabold text-purple-900">Atributos Profesionales</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className="flex items-center gap-2 text-sm font-bold text-purple-800 mb-2">
                      <Star className="w-4 h-4 text-amber-500" /> Habilidades Destacadas
                    </label>
                    <textarea name="skills" value={profileData.skills} onChange={handleChange} rows="3" placeholder="Ej. Liderazgo, Programación en Python..." className="w-full p-3 bg-white border border-purple-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm text-gray-700" />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="flex items-center gap-2 text-sm font-bold text-purple-800 mb-2">
                      <span className="text-xl">🎨</span> Pasatiempos / Hobbies
                    </label>
                    <textarea name="hobbies" value={profileData.hobbies} onChange={handleChange} rows="3" placeholder="Ej. Tocar guitarra, Calistenia..." className="w-full p-3 bg-white border border-purple-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm text-gray-700" />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="flex items-center gap-2 text-sm font-bold text-purple-800 mb-2">
                      <BookOpen className="w-4 h-4 text-blue-500" /> Formación Académica
                    </label>
                    <textarea name="academic_experience" value={profileData.academic_experience} onChange={handleChange} rows="3" placeholder="Ej. Cursando 11mo grado..." className="w-full p-3 bg-white border border-purple-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm text-gray-700" />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="flex items-center gap-2 text-sm font-bold text-purple-800 mb-2">
                      <Briefcase className="w-4 h-4 text-gray-500" /> Experiencia Laboral / Proyectos
                    </label>
                    <textarea name="work_experience" value={profileData.work_experience} onChange={handleChange} rows="3" placeholder="Ej. Proyecto de feria de ciencias..." className="w-full p-3 bg-white border border-purple-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm text-gray-700" />
                  </div>
                </div>
              </section>

              <section className="bg-white p-8 rounded-3xl shadow-md border border-purple-100">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-extrabold text-purple-900">Seguridad de la Cuenta</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                      <Mail className="w-4 h-4 text-gray-400" /> Correo Alternativo
                    </label>
                    <input type="email" name="backup_email" value={profileData.backup_email} onChange={handleChange} placeholder="Para recuperación de cuenta" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                      <Lock className="w-4 h-4 text-gray-400" /> Cambiar Contraseña
                    </label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nueva contraseña (Mín 6 caracteres)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none text-sm" />
                    <p className="text-xs text-gray-400 mt-1">Déjalo en blanco si no deseas cambiarla.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-3xl shadow-lg border border-purple-100 mt-8 gap-4">
            <button 
              type="button" 
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-colors w-full sm:w-auto"
            >
              <Trash2 className="w-5 h-5" /> Eliminar mi cuenta
            </button>

            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-linear-to-r from-purple-600 to-emerald-500 hover:from-purple-700 text-white font-extrabold rounded-xl shadow-md transition-all w-full sm:w-auto transform hover:-translate-y-1"
            >
              {saving ? 'Guardando...' : (
                <><Save className="w-5 h-5" /> Guardar Cambios</>
              )}
            </button>
          </div>
        </form>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl text-center border border-red-100">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">¿Eliminar cuenta?</h3>
              <p className="text-gray-600 mb-8 font-medium">
                Esta acción es irreversible. Se borrarán permanentemente todos tus datos, perfil y configuraciones.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={executeDeleteAccount}
                  className="w-full px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-md"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;