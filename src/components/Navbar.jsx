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

        <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 rounded-lg text-purple-700">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;