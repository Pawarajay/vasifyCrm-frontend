'use client';
import { useState, useEffect } from 'react';
import { Clock, Plus, TrendingUp } from 'lucide-react';

export default function TimeTracking({ projectId }) {
    const [logs, setLogs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        task_id: '',
        hours_logged: '',
        log_date: new Date().toISOString().split('T')[0],
        is_billable: true,
        description: ''
    });
    const [summary, setSummary] = useState({
        totalHours: 0,
        billableHours: 0,
        nonBillableHours: 0
    });

    useEffect(() => {
        fetchLogs();
    }, [projectId]);

    const fetchLogs = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/time-logs`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setLogs(data);
                calculateSummary(data);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    const calculateSummary = (logsData) => {
        const total = logsData.reduce((sum, log) => sum + parseFloat(log.hours_logged), 0);
        const billable = logsData.reduce((sum, log) => 
            sum + (log.is_billable ? parseFloat(log.hours_logged) : 0), 0);
        
        setSummary({
            totalHours: total.toFixed(2),
            billableHours: billable.toFixed(2),
            nonBillableHours: (total - billable).toFixed(2)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/projects/${projectId}/time-logs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setShowForm(false);
                setFormData({
                    task_id: '',
                    hours_logged: '',
                    log_date: new Date().toISOString().split('T')[0],
                    is_billable: true,
                    description: ''
                });
                fetchLogs();
            }
        } catch (error) {
            console.error('Error logging time:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="text-blue-600" size={24} />
                        <TrendingUp className="text-blue-600" size={20} />
                    </div>
                    <p className="text-sm text-blue-700 font-medium">Total Hours</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">{summary.totalHours}h</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="text-green-600" size={24} />
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Billable</span>
                    </div>
                    <p className="text-sm text-green-700 font-medium">Billable Hours</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">{summary.billableHours}h</p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="text-gray-600" size={24} />
                        <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">Non-Billable</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">Non-Billable Hours</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{summary.nonBillableHours}h</p>
                </div>
            </div>

            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Time Logs ({logs.length})</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={18} />
                    {showForm ? 'Cancel' : 'Log Time'}
                </button>
            </div>

            {/* Log Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Hours *</label>
                                <input
                                    type="number"
                                    step="0.25"
                                    value={formData.hours_logged}
                                    onChange={(e) => setFormData({...formData, hours_logged: e.target.value})}
                                    required
                                    placeholder="e.g., 4.5"
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Date *</label>
                                <input
                                    type="date"
                                    value={formData.log_date}
                                    onChange={(e) => setFormData({...formData, log_date: e.target.value})}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Type</label>
                                <select
                                    value={formData.is_billable}
                                    onChange={(e) => setFormData({...formData, is_billable: e.target.value === 'true'})}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="true">Billable</option>
                                    <option value="false">Non-Billable</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={2}
                                placeholder="What did you work on?"
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                        >
                            Log Time
                        </button>
                    </form>
                </div>
            )}

            {/* Time Logs List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {new Date(log.log_date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">{log.user_name}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{log.hours_logged}h</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        log.is_billable 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {log.is_billable ? 'Billable' : 'Non-Billable'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{log.description || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No time logs yet</p>
                        <p className="text-gray-400 text-sm mt-1">Click "Log Time" to add your first entry</p>
                    </div>
                )}
            </div>
        </div>
    );
}
