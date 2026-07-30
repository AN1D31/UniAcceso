import React, { useState, useEffect } from 'react';
import { supabase } from '../createClient';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, AtSign, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', username: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null); 
  
  const [usernameStatus, setUsernameStatus] = useState('idle');

  useEffect(() => {
    const checkUsername = async () => {
      const currentUsername = formData.username.trim();
      if (currentUsername.length < 3) {
        setUsernameStatus('idle');
        return;
      }
      setUsernameStatus('checking');

      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', currentUsername)
        .single();

      if (data) {
        setUsernameStatus('taken');
      } else {
        setUsernameStatus('available');
      }
    };

    const timeoutId = setTimeout(() => checkUsername(), 500);
    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (formData.password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden. Por favor, verifícalas.");
      return;
    }

    if (usernameStatus === 'taken') {
      setErrorMsg("El nombre de usuario ya está en uso. Por favor, elige otro.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.username.trim(),
          }
        }
      });

      if (error) throw error;

      setSuccessMsg("¡Registro exitoso! Revisa tu correo para confirmar tu cuenta. Redirigiendo al inicio de sesión...");
      
      setTimeout(() => {
        navigate('/login');
      }, 3500);
      
    } catch (error) {
      let friendlyError = "Ocurrió un error al registrar el usuario.";
      if (error.message.includes("already registered") || error.message.includes("already exists")) {
        friendlyError = "Este correo electrónico ya está asociado a una cuenta existente.";
      } else if (error.message.includes("Password should be at least")) {
        friendlyError = "La contraseña debe tener al menos 6 caracteres.";
      } else if (error.message.includes("invalid email")) {
        friendlyError = "El formato del correo electrónico no es válido.";
      } else {
        friendlyError = error.message;
      }
      setErrorMsg(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white p-8 border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="text-gray-600 mt-2">Únete a la comunidad UniAcceso</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-3 rounded-sm mb-6 text-sm font-semibold text-center border border-red-200">
            <XCircle className="inline w-5 h-5 mr-1 -mt-0.5" /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-sm mb-6 text-sm font-semibold text-center border border-emerald-200">
            <CheckCircle2 className="inline w-5 h-5 mr-1 -mt-0.5" /> {successMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" name="fullName" placeholder="Nombre Público (Ej. Juan Pérez)" required onChange={handleChange} className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-sm focus:ring-1 focus:ring-purple-600 focus:border-purple-600 outline-none" />
          </div>

          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="username"
              placeholder="Nombre de Usuario Único"
              required
              onChange={handleChange}
              className={`w-full pl-10 pr-10 p-3 bg-white border rounded-sm outline-none transition-colors ${
                usernameStatus === 'taken' ? 'border-red-300 focus:ring-1 focus:ring-red-500' :
                usernameStatus === 'available' ? 'border-emerald-300 focus:ring-1 focus:ring-emerald-500' :
                'border-gray-300 focus:ring-1 focus:ring-purple-600 focus:border-purple-600'
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {usernameStatus === 'checking' && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
              {usernameStatus === 'available' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {usernameStatus === 'taken' && <XCircle className="w-5 h-5 text-red-500" />}
            </div>
            {usernameStatus === 'taken' && (
              <p className="text-xs text-red-600 font-semibold mt-1 ml-1 absolute -bottom-5">Este usuario ya está en uso.</p>
            )}
          </div>

          <div className="relative pt-2">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 mt-1" />
            <input type="email" name="email" placeholder="Correo Electrónico" required onChange={handleChange} className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-sm focus:ring-1 focus:ring-purple-600 focus:border-purple-600 outline-none" />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="password" name="password" placeholder="Contraseña (Mín. 6 caracteres)" required minLength="6" onChange={handleChange} className="w-full pl-10 p-3 bg-white border border-gray-300 rounded-sm focus:ring-1 focus:ring-purple-600 focus:border-purple-600 outline-none" />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar Contraseña"
              required
              minLength="6"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full pl-10 p-3 bg-white border rounded-sm outline-none transition-colors ${
                confirmPassword && formData.password !== confirmPassword
                ? 'border-red-300 focus:ring-1 focus:ring-red-500'
                : 'border-gray-300 focus:ring-1 focus:ring-purple-600 focus:border-purple-600'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading || usernameStatus === 'taken'}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta? <Link to="/login" className="text-purple-700 hover:text-purple-900 font-semibold">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;