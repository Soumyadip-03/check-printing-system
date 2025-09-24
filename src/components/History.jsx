import React, { useState } from 'react';
import { Search, Calendar, User, DollarSign, FileText } from 'lucide-react';

const History = ({ history, templates, onDeleteHistory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('all');

  const getTemplateName = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    return template ? template.name : 'Unknown Template';
  };

  const filteredHistory = history.filter(check => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    switch (filterField) {
      case 'payeeName':
        return check.payeeName.toLowerCase().includes(searchLower);
      case 'amount':
        return check.amount.toString().includes(searchTerm);
      case 'date':
        return check.date.includes(searchTerm);
      default:
        return (
          check.payeeName.toLowerCase().includes(searchLower) ||
          check.amount.toString().includes(searchTerm) ||
          check.date.includes(searchTerm) ||
          getTemplateName(check.selectedTemplate).toLowerCase().includes(searchLower)
        );
    }
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Check History</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search checks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Fields</option>
            <option value="payeeName">Payee Name</option>
            <option value="amount">Amount</option>
            <option value="date">Date</option>
          </select>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>{history.length === 0 ? 'No checks printed yet' : 'No checks match your search'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Payee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Template</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Printed At</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((check, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(check.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {check.payeeName}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        ₹{parseFloat(check.amount).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {getTemplateName(check.selectedTemplate)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(check.printedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this history entry?')) {
                            const updatedHistory = history.filter((_, i) => i !== index);
                            // This needs to be passed from parent
                            onDeleteHistory && onDeleteHistory(index);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
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