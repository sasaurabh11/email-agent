import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, 
  X, 
  Mail, 
  BarChart3, 
  Settings, 
  LogOut, 
  User,
  Bell,
  Search,
  Moon,
  Sun,
  Filter
} from 'lucide-react';

const THEMES = [
  { key: 'indigo', label: 'Indigo' },
  { key: 'emerald', label: 'Emerald' },
  { key: 'rose', label: 'Rose' },
  { key: 'amber', label: 'Amber' },
  { key: 'sky', label: 'Sky' },
  { key: 'violet', label: 'Violet' },
];

const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('indigo');
  const [appearance, setAppearance] = useState('system'); // 'system' | 'light' | 'dark'

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('colorTheme') || 'indigo';
    const savedAppearance = localStorage.getItem('appearance') || 'system';
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const enableDark = savedAppearance === 'dark' ? true : savedAppearance === 'light' ? false : prefersDark;
    setTheme(savedTheme);
    setAppearance(savedAppearance);
    setDarkMode(enableDark);
    root.setAttribute('data-theme', savedTheme);
    root.classList.toggle('dark', enableDark);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('colorTheme', theme);
  }, [theme]);

  // React to appearance selection and system changes
  useEffect(() => {
    const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    const apply = () => {
      const prefersDark = media ? media.matches : true;
      const nextDark = appearance === 'dark' ? true : appearance === 'light' ? false : prefersDark;
      setDarkMode(nextDark);
      localStorage.setItem('appearance', appearance);
    };

    apply();
    if (media && appearance === 'system') {
      media.addEventListener ? media.addEventListener('change', apply) : media.addListener && media.addListener(apply);
      return () => {
        media.removeEventListener ? media.removeEventListener('change', apply) : media.removeListener && media.removeListener(apply);
      };
    }
  }, [appearance]);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Emails', href: '/emails', icon: Mail },
    { name: 'Summaries', href: '/summaries', icon: Filter },
    { name: 'Filter', href: '/filter', icon: Filter },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleDarkMode = () => {
    // Quick toggle between light and dark; does not change 'system' explicitly
    setAppearance(darkMode ? 'light' : 'dark');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="glass border-b border-subtle sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center ml-4 lg:ml-0">
              <div className="relative">
                <Mail className="h-8 w-8 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              </div>
              <h1 className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-primary-gradient hidden sm:block">
                FocusMail
              </h1>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Appearance selector */}
            {/* <select
              value={appearance}
              onChange={(e) => setAppearance(e.target.value)}
              className="glass border-subtle text-sm px-2 py-1 rounded-md text-gray-200 hover:bg-gray-800"
              aria-label="Select appearance"
            >
              <option value="system" className="bg-gray-900">System</option>
              <option value="light" className="bg-gray-900">Light</option>
              <option value="dark" className="bg-gray-900">Dark</option>
            </select> */}
            {/* Theme selector */}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="glass border-subtle text-sm px-2 py-1 rounded-md text-gray-200 hover:bg-gray-800"
              aria-label="Select color theme"
            >
              {THEMES.map(t => (
                <option key={t.key} value={t.key} className="bg-gray-900">{t.label}</option>
              ))}
            </select>

            <button 
              onClick={toggleDarkMode}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-gradient rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-200">
                  {user?.email?.split('@')[0]}
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-subtle">
                  <div className="px-4 py-2 border-b border-subtle">
                    <p className="text-sm font-medium text-white">{user?.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;