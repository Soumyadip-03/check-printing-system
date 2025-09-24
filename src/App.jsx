import React, { useState, useEffect } from 'react';
import { FileText, Upload, History as HistoryIcon, Printer } from 'lucide-react';
import CheckForm from './components/CheckForm';
import Templates from './components/Templates';
import History from './components/History';

import { parseTemplate } from './utils/templateParser';
import { SBI_TEMPLATE } from './utils/constants';

function App() {
  const [activeTab, setActiveTab] = useState('form');
  const [templates, setTemplates] = useState([{ ...SBI_TEMPLATE, active: true }]);
  const [history, setHistory] = useState([]);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">

      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Check Printing System</h1>
          <p className="text-gray-600 dark:text-gray-300">Professional bank check printing with customizable templates</p>
        </header>

        <nav className="mb-8">
          <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
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