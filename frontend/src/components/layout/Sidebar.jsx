import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Mail, 
  BarChart3, 
  Settings, 
  FileText,
  Filter,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Emails', href: '/emails', icon: Mail },
    { name: 'Summaries', href: '/summaries', icon: FileText },
    { name: 'Filter', href: '/filter', icon: Filter },
  ];

  const tools = [
    { name: 'Email Filtering', href: '/emails', icon: Filter, description: 'Organize your inbox' },
    { name: 'AI Summarization', href: '/summaries', icon: Sparkles, description: 'Quick email insights' },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 glass border border-subtle shadow-2xl transform transition-all duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-subtle">
          {(!isCollapsed || isOpen) && (
            <div className="flex items-center">
              <div className="relative">
                <Mail className="h-8 w-8 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              </div>
              <span className="ml-2 text-xl font-bold text-white">FocusMail</span>
            </div>
          )}
          
          <div className="flex items-center">
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto nice-scrollbar">
          <div>
            <h3 className={`px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${(isCollapsed && !isOpen) && 'lg:hidden'}`}>
              Navigation
            </h3>
            <div className="mt-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={`flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all hover-float ${
                      active
                        ? 'text-white bg-primary-soft shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {(!isCollapsed || isOpen) && <span className="ml-3">{item.name}</span>}
                    {active && (
                      <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className={`px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${(isCollapsed && !isOpen) && 'lg:hidden'}`}>
              AI Tools
            </h3>
            <div className="mt-2 space-y-2">
              {tools.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className="flex items-center px-3 py-3 text-sm rounded-md bg-gray-800/60 hover:bg-gray-800 transition-colors group border border-subtle"
                  >
                    <div className="p-1 bg-primary-gradient rounded-md">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    {(!isCollapsed || isOpen) && (
                      <div className="ml-3">
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className={`px-4 py-4 border-t border-subtle ${(isCollapsed && !isOpen) && 'lg:hidden'}`}>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-gradient rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">AI Assistant</p>
              <p className="text-xs text-gray-400">Powered by AI</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;