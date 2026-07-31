import React, { useState, useEffect } from "react";
import { Menu, X, UserCircle, LogOut } from "lucide-react";
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
    { to: "/", label: "Inicio" },
    { to: "/explorar", label: "Universidades" },
    { to: "/becas", label: "Becas" },
    { to: "/recursos", label: "Recursos" },
    { to: "/contacto", label: "Contáctanos" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

        <Link to="/" className="flex items-center gap-2">
          <img src="/uniaccesologo.png" alt="UniAcceso" className="h-10 w-10 object-contain" />
          <span className="text-xl tracking-tight">
            <span className="text-purple-700 font-bold">Uni</span><span className="text-black font-medium">Acceso</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((item) => (
            <Link key={item.to} to={item.to} className="text-gray-700 hover:text-purple-700 font-medium text-sm">
              {item.label}
            </Link>
          ))}

          <div className="border-l border-gray-200 pl-6 flex items-center space-x-3">
            {session ? (
              <>
                <Link to="/perfil" className="flex items-center text-gray-700 hover:text-purple-700 font-medium text-sm">
                  <UserCircle className="w-5 h-5 mr-1" /> Mi Perfil
                </Link>
                <button onClick={handleLogout} className="flex items-center text-red-600 hover:text-red-700 font-semibold">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-black font-medium text-sm hover:text-purple-700 transition-colors">Entrar</Link>
                <Link to="/register" className="bg-purple-700 text-white px-4 py-2 rounded-sm font-semibold hover:bg-purple-800 transition-colors">Registro</Link>
              </>
            )}
          </div>
        </nav>

        <div className="flex md:hidden items-center space-x-3">
          {!session && (
            <div className="flex items-center space-x-2 mr-1">
              <Link to="/login" className="text-black font-medium text-xs">Entrar</Link>
              <Link to="/register" className="bg-purple-700 text-white px-3 py-1.5 rounded-sm text-xs font-semibold hover:bg-purple-800 transition-colors">Registro</Link>
            </div>
          )}

          {session && (
             <Link to="/perfil" className="text-gray-700 p-1"><UserCircle className="w-7 h-7" /></Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-sm text-purple-700 border border-gray-200 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 z-40 overflow-hidden">
          <nav className="flex flex-col p-4 space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-purple-700 font-semibold text-base p-3 rounded-sm hover:bg-gray-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {session && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 font-semibold text-base p-3 rounded-sm hover:bg-red-50 transition-colors w-full border-t border-gray-200 mt-2 pt-4"
              >
                <LogOut className="w-5 h-5" />
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