import React, { useState } from 'react';
import { Search, Calendar, User, DollarSign, FileText } from 'lucide-react';

const History = ({ history, templates, onDeleteHistory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('all');

  const getTemplateName = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    return template ? template.name : 'Unknown Template';
  };

  const formatDisplayDate = (dateStr) => {
    // Handle DD/MM/YYYY format
    if (dateStr && dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        return `${day}/${month}/${year}`;
      }
    }
    // Fallback to Date parsing
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const filteredHistory = history.filter(check => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const displayDate = formatDisplayDate(check.date);
    
    switch (filterField) {
      case 'payeeName':
        return check.payeeName.toLowerCase().includes(searchLower);
      case 'amount':
        return check.amount.toString().includes(searchTerm);
      case 'date':
        return check.date.includes(searchTerm) || displayDate.includes(searchTerm);
      default:
        return (
          check.payeeName.toLowerCase().includes(searchLower) ||
          check.amount.toString().includes(searchTerm) ||
          check.date.includes(searchTerm) ||
          displayDate.includes(searchTerm) ||
          getTemplateName(check.selectedTemplate).toLowerCase().includes(searchLower)
        );
    }
  });

  return (
    <div className="space-y-8">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Check History</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search checks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
            />
          </div>
          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 font-medium"
          >
            <option value="all">All Fields</option>
            <option value="payeeName">Payee Name</option>
            <option value="amount">Amount</option>
            <option value="date">Date</option>
          </select>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-lg font-medium">{history.length === 0 ? 'No checks printed yet' : 'No checks match your search'}</p>
            <p className="text-sm text-gray-400 mt-2">{history.length === 0 ? 'Print your first check to see it here' : 'Try adjusting your search criteria'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border-2 border-gray-200 dark:border-gray-600">
            <table className="w-full border-collapse bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                  <th className="text-left py-4 px-6 font-bold text-gray-800 dark:text-gray-200">Date</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-800 dark:text-gray-200">Payee</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-800 dark:text-gray-200">Amount</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-800 dark:text-gray-200">Template</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-800 dark:text-gray-200">Printed At</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-800 dark:text-gray-200">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((check, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-600 hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all duration-200">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{formatDisplayDate(check.date)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{check.payeeName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <span className="font-bold text-gray-800 dark:text-gray-200">₹{parseFloat(check.amount).toLocaleString('en-IN')}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
                        {getTemplateName(check.selectedTemplate)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {new Date(check.printedAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this history entry?')) {
                            const updatedHistory = history.filter((_, i) => i !== index);
                            onDeleteHistory && onDeleteHistory(index);
                          }
                        }}
                        className="px-4 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-semibold bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all duration-200 hover:scale-105"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;