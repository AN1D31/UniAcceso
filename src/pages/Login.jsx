import React, { useState } from 'react';
import { supabase } from '../createClient';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, CheckCircle2, XCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isResetMode, setIsResetMode] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setErrorMsg("Credenciales incorrectas.");
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: 'http://localhost:5173/update-password', 
    });
    
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Te hemos enviado un correo con el enlace para recuperar tu contraseña.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-purple-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-800 to-emerald-500">
            {isResetMode ? 'Recuperar Contraseña' : 'Iniciar Sesión'}
          </h2>
          <p className="text-gray-600 mt-2 font-medium">
            {isResetMode ? 'Ingresa tu correo para enviarte un código' : 'Bienvenido de vuelta a UniAcceso'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-bold text-center border border-red-100">
            <XCircle className="inline w-5 h-5 mr-1 -mt-0.5" /> {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl mb-4 text-sm font-bold text-center border border-emerald-200">
            <CheckCircle2 className="inline w-5 h-5 mr-1 -mt-0.5" /> {successMsg}
          </div>
        )}

        <form onSubmit={isResetMode ? handlePasswordReset : handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300 w-5 h-5" />
            <input type="email" name="email" placeholder="Correo Electrónico" required onChange={handleChange} className="w-full pl-10 p-3 bg-purple-50/50 border border-purple-100 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none" />
          </div>
          
          {!isResetMode && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300 w-5 h-5" />
              <input type="password" name="password" placeholder="Contraseña" required onChange={handleChange} className="w-full pl-10 p-3 bg-purple-50/50 border border-purple-100 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none" />
            </div>
          )}

          <div className="flex justify-end">
            <button 
              type="button" 
              onClick={() => { setIsResetMode(!isResetMode); setErrorMsg(null); setSuccessMsg(null); }} 
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700"
            >
              {isResetMode ? 'Volver a Iniciar Sesión' : '¿Olvidaste tu contraseña?'}
            </button>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-linear-to-r from-purple-600 to-emerald-500 hover:from-purple-700 text-white font-bold py-3 rounded-xl shadow-md transition-all">
            {loading ? 'Procesando...' : (isResetMode ? 'Enviar Enlace' : 'Ingresar')}
          </button>
        </form>

        {!isResetMode && (
          <p className="mt-6 text-center text-sm text-gray-600 font-medium">
            ¿Eres nuevo aquí? <Link to="/register" className="text-purple-600 hover:text-purple-800 font-bold">Regístrate</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;