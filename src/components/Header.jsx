import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Map, User, Menu, X, Calendar, BookKey } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-100 shadow-md mx-auto flex flex-col sm:flex-row items-center justify-between border border-gray-200 rounded-b-[25px] mb-6">
      <div className="flex items-center w-full sm:w-auto justify-between">
        <div className="flex items-center">
          <Calendar className="text-indigo-600 mr-2" size={28} />
          <span className="text-gray-800 text-[30px] sm:text-[36px] md:text-[42px] font-bold tracking-tight">
            <Link to="/">
              <span className="text-indigo-600">Spacery</span>
            </Link>
          </span>
        </div>

        <button
          className="sm:hidden text-gray-700 p-2 transition-transform duration-300 ease-in-out hover:bg-indigo-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Меню"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <nav
        className={`${
          menuOpen
            ? 'max-h-[200px] opacity-100 mt-4'
            : 'max-h-0 opacity-0 mt-0 sm:max-h-[200px] sm:opacity-100'
        } overflow-hidden sm:overflow-visible w-full sm:w-auto sm:mt-0 transition-all duration-500 ease-in-out`}
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link to="/" className="w-full">
            <div
              className={`px-6 py-2 rounded-xl flex justify-center items-center  ${
                isActive('/')
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200'
              }`}
            >
              <Map size={18} className="mr-2" />
              <span className="font-medium">Карта</span>
            </div>
          </Link>
          <Link to="/meetings" className="w-full">
            <div
              className={`px-6 py-2 rounded-xl flex justify-center items-center transition-all duration-300 text-nowrap ${
                isActive('/meetings')
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200'
              }`}
            >
              <BookKey size={18} className="mr-2" />
              <span className="font-medium">Бронирования</span>
            </div>
          </Link>
          <Link to="/profile" className="w-full">
            <div
              className={`px-6 py-2 rounded-xl flex justify-center items-center transition-all duration-300 ${
                isActive('/profile')
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200'
              }`}
            >
              <User size={18} className="mr-2" />
              <span className="font-medium">Профиль</span>
            </div>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
