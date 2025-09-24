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
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Upload Template</h2>
        


        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
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
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer inline-block transition-colors"
          >
            Select File
          </label>
        </div>

        {uploadError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{uploadError}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Manage Templates</h2>
        
        {templates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No templates uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${template.active ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {template.active ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{template.name}</h3>
                    <p className="text-sm text-gray-500">ID: {template.id}</p>
                    {template.uploadedAt && (
                      <p className="text-xs text-gray-400">
                        Uploaded: {new Date(template.uploadedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {window.electronAPI && (
                    <button
                      onClick={() => handleSaveTemplate(template)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Save Template"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onTemplateToggle(template.id)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      template.active
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
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
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
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