// ============ frontend/components/projects/TeamAllocation.jsx ============
'use client';
import { useState, useEffect } from 'react';
import { UserPlus, X, Mail, Phone } from 'lucide-react';

export default function TeamAllocation({ project, onUpdate }) {
    const [team, setTeam] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        user_id: '',
        role: '',
        skills_assigned: '',
        workload_capacity: 100,
        hours_per_week: 40
    });

    useEffect(() => {
        fetchTeam();
        fetchAvailableUsers();
    }, []);

    const fetchTeam = async () => {
        setTeam(project.team || []);
    };

    const fetchAvailableUsers = async () => {
        try {
            const response = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAvailableUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/projects/${project.id}/team`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setShowAddForm(false);
                setFormData({
                    user_id: '',
                    role: '',
                    skills_assigned: '',
                    workload_capacity: 100,
                    hours_per_week: 40
                });
                onUpdate();
            }
        } catch (error) {
            console.error('Error adding team member:', error);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!confirm('Remove this team member?')) return;

        try {
            const response = await fetch(`/api/projects/${project.id}/team/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.ok) {
                onUpdate();
            }
        } catch (error) {
            console.error('Error removing team member:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Team Members ({team.length})</h3>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <UserPlus size={18} />
                    Add Member
                </button>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map(member => (
                    <div key={member.user_id} className="bg-white rounded-lg shadow p-6 relative">
                        <button
                            onClick={() => handleRemoveMember(member.user_id)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-600"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{member.name}</h4>
                                <p className="text-sm text-gray-600">{member.role}</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            {member.email && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Mail size={16} />
                                    <span>{member.email}</span>
                                </div>
                            )}
                            {member.phone && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone size={16} />
                                    <span>{member.phone}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Hours/Week</span>
                                <span className="font-semibold">{member.hours_per_week}h</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Workload</span>
                                <span className="font-semibold">{member.workload_capacity}%</span>
                            </div>
                        </div>

                        {member.skills_assigned && (
                            <div className="mt-4">
                                <p className="text-xs text-gray-500 mb-2">Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {member.skills_assigned.split(',').map((skill, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Member Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Add Team Member</h3>
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">User *</label>
                                <select
                                    value={formData.user_id}
                                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="">Select User</option>
                                    {availableUsers.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Role *</label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    required
                                    placeholder="e.g., Frontend Developer"
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Skills (comma-separated)</label>
                                <input
                                    type="text"
                                    value={formData.skills_assigned}
                                    onChange={(e) => setFormData({...formData, skills_assigned: e.target.value})}
                                    placeholder="React, Node.js, TypeScript"
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Hours/Week</label>
                                    <input
                                        type="number"
                                        value={formData.hours_per_week}
                                        onChange={(e) => setFormData({...formData, hours_per_week: e.target.value})}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Capacity %</label>
                                    <input
                                        type="number"
                                        value={formData.workload_capacity}
                                        onChange={(e) => setFormData({...formData, workload_capacity: e.target.value})}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Add Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
