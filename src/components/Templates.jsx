import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, CheckCircle, XCircle, AlertCircle, Download, FolderOpen } from 'lucide-react';
import { sanitizeInput } from '../utils/validation';
import { APP_CONFIG, ERROR_MESSAGES, TEMPLATE_FIELDS } from '../utils/constants';
import { parseTemplate } from '../utils/templateParser';

const Templates = ({ templates, onTemplateUpload, onTemplateToggle, onTemplateDelete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (window.electronAPI) {
      const handleTemplateUpload = (event, template) => {
        const error = validateTemplate(template); // Raw template validation
        if (error) {
          setUploadError(error);
          return;
        }
        onTemplateUpload({ ...template, active: true, uploadedAt: new Date().toISOString() });
        setUploadError('');
      };

      window.electronAPI.onTemplateUpload(handleTemplateUpload);
      
      return () => {
        window.electronAPI.removeAllListeners('template-upload');
      };
    }
  }, [onTemplateUpload]);

  const validateTemplate = (template) => {
    if (!template.id || !template.name || !template.fields) {
      return 'Missing required fields: id, name, or fields';
    }
    
    const requiredFields = ['payeeName', 'amountInNumbers', 'amountInWords'];
    const dateField = template.fields.date_section || template.fields.dateSection;
    
    // Check basic fields
    for (const field of requiredFields) {
      if (!template.fields[field]) {
        return `Missing required field: fields.${field}`;
      }
      
      const fieldObj = template.fields[field];
      if (typeof fieldObj.x_px !== 'number' || typeof fieldObj.y_px !== 'number') {
        return `Invalid coordinates for field: ${field}. Expected x_px and y_px as numbers.`;
      }
    }
    
    // Check date section
    if (!dateField) {
      return 'Missing date_section or dateSection';
    }
    
    const requiredDateBoxes = ['day_box_1', 'day_box_2', 'month_box_1', 'month_box_2', 'year_box_1', 'year_box_2', 'year_box_3', 'year_box_4'];
    for (const box of requiredDateBoxes) {
      if (!dateField[box]) {
        return `Missing date box: ${box}`;
      }
    }
    
    return null;
  };

  const handleFileUpload = (file) => {
    if (!file || !APP_CONFIG.SUPPORTED_FILE_TYPES.some(type => file.name.endsWith(type))) {
      setUploadError(ERROR_MESSAGES.INVALID_FILE_TYPE);
      return;
    }

    if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
      setUploadError(ERROR_MESSAGES.FILE_TOO_LARGE);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawTemplate = JSON.parse(e.target.result);
        const template = parseTemplate(rawTemplate);
        const error = validateTemplate(rawTemplate); // Validate raw template first
        
        if (error) {
          setUploadError(sanitizeInput(error));
          return;
        }

        // Sanitize template data
        const sanitizedTemplate = {
          ...template,
          id: sanitizeInput(template.id),
          name: sanitizeInput(template.name),
          active: true,
          uploadedAt: new Date().toISOString()
        };

        onTemplateUpload(sanitizedTemplate);
        setUploadError('');
      } catch (err) {
        setUploadError(ERROR_MESSAGES.INVALID_JSON);
      }
    };
    reader.readAsText(file);
  };

  const handleElectronLoad = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.loadTemplate();
      if (result.success) {
        const error = validateTemplate(result.template); // Raw template validation
        if (error) {
          setUploadError(sanitizeInput(error));
          return;
        }
        onTemplateUpload({ ...result.template, active: true, uploadedAt: new Date().toISOString() });
        setUploadError('');
      } else if (result.error) {
        setUploadError(sanitizeInput(result.error));
      }
    }
  };

  const handleSaveTemplate = async (template) => {
    if (window.electronAPI) {
      const result = await window.electronAPI.saveTemplate(template);
      if (!result.success && result.error) {
        setUploadError(result.error);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Upload Template</h2>
        </div>
        


        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            dragActive 
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 scale-105' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50/50 dark:bg-gray-700/50'
          }`}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg font-medium">
            Drag and drop a JSON template file here, or click to select
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
            id="template-upload"
          />
          <label
            htmlFor="template-upload"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 cursor-pointer inline-block transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
          >
            Select File
          </label>
        </div>

        {uploadError && (
          <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <span className="text-red-700 dark:text-red-400 font-medium">{uploadError}</span>
          </div>
        )}
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Manage Templates</h2>
        </div>
        
        {templates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-lg font-medium">No templates uploaded yet</p>
            <p className="text-sm text-gray-400 mt-2">Upload your first template to get started</p>
          </div>
        ) : (
          <div className="space-y-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-6 flex items-center justify-between bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm hover:shadow-lg transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
              >
                <div className="flex items-center gap-6">
                  <div className={`p-3 rounded-2xl ${template.active ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30' : 'bg-gray-100 dark:bg-gray-600'}`}>
                    {template.active ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{template.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">ID: {template.id}</p>
                    {template.uploadedAt && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Uploaded: {new Date(template.uploadedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {window.electronAPI && (
                    <button
                      onClick={() => handleSaveTemplate(template)}
                      className="p-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 hover:scale-110"
                      title="Save Template"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => onTemplateToggle(template.id)}
                    className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${
                      template.active
                        ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 hover:from-yellow-200 hover:to-orange-200 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-yellow-400'
                        : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 hover:from-green-200 hover:to-emerald-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400'
                    }`}
                  >
                    {template.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this template?')) {
                        onTemplateDelete(template.id);
                      }
                    }}
                    className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;