import React, { useState, useEffect } from 'react';
import { FileText, Upload, History as HistoryIcon, Printer } from 'lucide-react';
import CheckForm from './components/CheckForm';
import Templates from './components/Templates';
import History from './components/History';

import { parseTemplate } from './utils/templateParser';

function App() {
  const [activeTab, setActiveTab] = useState('form');
  const [templates, setTemplates] = useState([]);
  const [history, setHistory] = useState([]);

  // Load templates from localStorage on startup
  useEffect(() => {
    const savedTemplates = localStorage.getItem('checkTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  // Save templates to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('checkTemplates', JSON.stringify(templates));
  }, [templates]);

  // Load history from localStorage on startup
  useEffect(() => {
    const savedHistory = localStorage.getItem('checkHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('checkHistory', JSON.stringify(history));
  }, [history]);


  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'system';
  });

  useEffect(() => {
    if (window.electronAPI) {
      const handleNewCheck = () => {
        setActiveTab('form');
      };

      const handleThemeChange = (event, newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
      };

      window.electronAPI.onMenuNewCheck(handleNewCheck);
      window.electronAPI.onThemeChange(handleThemeChange);
      
      return () => {
        window.electronAPI.removeAllListeners('menu-new-check');
        window.electronAPI.removeAllListeners('theme-change');
      };
    }
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  const handleTemplateUpload = (template) => {
    setTemplates(prev => [...prev, { ...template, active: true }]);
  };

  const handleTemplateToggle = (templateId) => {
    setTemplates(prev =>
      prev.map(template =>
        template.id === templateId
          ? { ...template, active: !template.active }
          : template
      )
    );
  };

  const handleTemplateDelete = (templateId) => {
    setTemplates(prev => prev.filter(template => template.id !== templateId));
  };

  const handleHistoryDelete = (index) => {
    setHistory(prev => prev.filter((_, i) => i !== index));
  };

  const handlePrint = (checkData, isPreview = false) => {
    const rawTemplate = templates.find(t => t.id === checkData.selectedTemplate);
    if (!rawTemplate) return;

    // Parse template to ensure correct format
    const template = parseTemplate ? parseTemplate(rawTemplate) : rawTemplate;
    // Keep reference to original template for date_section
    template.originalTemplate = rawTemplate;

    setHistory(prev => [checkData, ...prev]);
  };

  const tabs = [
    { id: 'form', label: 'Check Form', icon: FileText },
    { id: 'templates', label: 'Templates', icon: Upload },
    { id: 'history', label: 'History', icon: HistoryIcon }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 transition-all duration-300">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-3">
            Check Printing System
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Professional bank check printing with customizable templates and modern design
          </p>
        </header>

        <nav className="mb-10">
          <div className="flex justify-center">
            <div className="inline-flex space-x-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <main>
          {activeTab === 'form' && (
            <CheckForm 
              templates={templates} 
              onPrint={handlePrint}
            />
          )}
          {activeTab === 'templates' && (
            <Templates
              templates={templates}
              onTemplateUpload={handleTemplateUpload}
              onTemplateToggle={handleTemplateToggle}
              onTemplateDelete={handleTemplateDelete}
            />
          )}
          {activeTab === 'history' && (
            <History 
              history={history} 
              templates={templates}
              onDeleteHistory={handleHistoryDelete}
            />
          )}

        </main>
      </div>
    </div>
  );
}

export default App;