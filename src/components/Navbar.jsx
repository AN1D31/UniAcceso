import React, { useState, useEffect } from "react";
import { Compass, Home as HomeIcon, Calendar, Menu, X, BookOpen, UserCircle, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../createClient";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { to: "/", icon: <HomeIcon className="w-5 h-5" />, label: "Inicio" },
    { to: "/explorar", icon: <Compass className="w-5 h-5" />, label: "Universidades" },
    { to: "/becas", icon: <BookOpen className="w-5 h-5" />, label: "Becas" },
    { to: "/eventos", icon: <Calendar className="w-5 h-5" />, label: "Eventos" },
    { to: "/contacto", icon: <Calendar className="w-5 h-5 rotate-45" />, label: "Contáctanos" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        
        <Link to="/" className="flex items-center space-x-3 group">
          <img src="/UniAcceso.jpeg" alt="Logo UniAcceso" className="h-10 w-10 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow" />
          <span className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-purple-700 to-emerald-500">
            UniAcceso
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((item) => (
            <Link key={item.to} to={item.to} className="flex items-center space-x-1.5 text-gray-600 hover:text-purple-600 font-medium">
              {item.icon}<span>{item.label}</span>
            </Link>
          ))}
          
          <div className="border-l border-gray-200 pl-6 flex items-center space-x-3">
            {session ? (
              <>
                <Link to="/perfil" className="flex items-center text-emerald-600 hover:text-emerald-700 font-bold">
                  <UserCircle className="w-5 h-5 mr-1" /> Mi Perfil
                </Link>
                <button onClick={handleLogout} className="flex items-center text-red-500 hover:text-red-700 font-bold">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-purple-600 font-bold hover:text-purple-800">Entrar</Link>
                <Link to="/register" className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-purple-700 transition-colors">Registro</Link>
              </>
            )}
          </div>
        </nav>

        <div className="flex md:hidden items-center space-x-3">
          {!session && (
            <div className="flex items-center space-x-2 mr-1">
              <Link to="/login" className="text-xs text-purple-600 font-bold px-2 py-1">Entrar</Link>
              <Link to="/register" className="bg-linear-to-r from-purple-600 to-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">Registro</Link>
            </div>
          )}
          
          {session && (
             <Link to="/perfil" className="text-emerald-600 p-1"><UserCircle className="w-7 h-7" /></Link>
          )}

          <button 
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 rounded-xl text-purple-700 bg-purple-50 border border-purple-100 transition-all active:scale-95"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-2xl animate-in slide-in-from-top duration-300 z-40 overflow-hidden">
          <nav className="flex flex-col p-6 space-y-3 bg-linear-to-b from-white to-purple-50/20">
            {navLinks.map((item) => (
              <Link 
                key={item.to} 
                to={item.to} 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-4 text-gray-700 hover:text-purple-600 font-bold text-lg p-4 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-purple-100"
              >
                <div className="p-2.5 bg-purple-100 rounded-xl text-purple-600 shadow-sm">{item.icon}</div>
                <span>{item.label}</span>
              </Link>
            ))}
            
            {session && (
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-4 text-red-500 font-bold text-lg p-4 rounded-2xl hover:bg-red-50 transition-all w-full border-t border-gray-100 mt-4 pt-6"
              >
                <div className="p-2.5 bg-red-100 rounded-xl text-red-500 shadow-sm"><LogOut className="w-5 h-5" /></div>
                <span>Cerrar Sesión</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;