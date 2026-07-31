import React from 'react';

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/uniacceso?igsh=MTkzY2g3MXJ4Nm1jaw==',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@uniacceso?_r=1&_t=ZS-98U8CunNzBS',
    path: 'M16.6 5.82c-1.12-1.08-1.67-2.64-1.75-4.17h-3.44v13.85c0 1.66-1.35 3-3 3-1.66 0-3.01-1.34-3.01-3s1.35-3 3.01-3c.31 0 .61.05.89.14V9.16a6.65 6.65 0 0 0-.89-.06c-3.64 0-6.59 2.95-6.59 6.6s2.95 6.6 6.59 6.6 6.6-2.96 6.6-6.6V9.14c1.32.94 2.94 1.49 4.68 1.49V7.19c-1.1 0-2.14-.34-3.09-1.02a4.7 4.7 0 0 1-.99-.35z',
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com/@uniacceso?si=yfMg5DWQLZb7a7xN',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
];

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/uniaccesologo.png" alt="UniAcceso" className="h-8 w-8 object-contain" />
            <span className="text-lg tracking-tight">
              <span className="text-purple-700 font-bold">Uni</span><span className="text-black font-medium">Acceso</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map(({ name, href, path }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="text-gray-400 hover:text-purple-700 transition-colors rounded-sm"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
