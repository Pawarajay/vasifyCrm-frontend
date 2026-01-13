
'use client';
import { useRouter } from 'next/navigation';
import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';

export default function ProjectList({ projects, onUpdate }) {
    const router = useRouter();

    const getPriorityColor = (priority) => {
        const colors = {
            'Low': 'bg-gray-100 text-gray-700',
            'Medium': 'bg-blue-100 text-blue-700',
            'High': 'bg-orange-100 text-orange-700',
            'Critical': 'bg-red-100 text-red-700'
        };
        return colors[priority] || colors.Medium;
    };

    const getHealthDot = (health) => {
        const colors = {
            'Green': 'bg-green-500',
            'Yellow': 'bg-yellow-500',
            'Red': 'bg-red-500'
        };
        return colors[health] || colors.Green;
    };

    if (projects.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">No projects found</p>
                <p className="text-gray-400 text-sm mt-2">Create your first project to get started</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
                <div
                    key={project.id}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-blue-500"
                >
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-2 h-2 rounded-full ${getHealthDot(project.health_rating)}`}></div>
                                    <span className="text-xs text-gray-500 font-medium">{project.project_id}</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                                    {project.title}
                                </h3>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(project.priority)}`}>
                                {project.priority}
                            </span>
                        </div>

                        {/* Client & Category */}
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                {project.client_name || 'No Client'} • {project.category}
                            </p>
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span className="font-semibold">{project.progress_percentage || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${project.progress_percentage || 0}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                            <div className="flex flex-col items-center">
                                <Users size={16} className="text-gray-400 mb-1" />
                                <span className="text-sm font-semibold text-gray-900">{project.team_count || 0}</span>
                                <span className="text-xs text-gray-500">Team</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <TrendingUp size={16} className="text-gray-400 mb-1" />
                                <span className="text-sm font-semibold text-gray-900">
                                    {project.completed_tasks || 0}/{project.total_tasks || 0}
                                </span>
                                <span className="text-xs text-gray-500">Tasks</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <Calendar size={16} className="text-gray-400 mb-1" />
                                <span className="text-sm font-semibold text-gray-900">
                                    {project.end_date ? new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                                </span>
                                <span className="text-xs text-gray-500">Due</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Status */}
                    <div className={`px-6 py-3 rounded-b-lg text-sm font-medium text-center ${
                        project.status === 'Completed' ? 'bg-green-50 text-green-700' :
                        project.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                        project.status === 'On Hold' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-gray-50 text-gray-700'
                    }`}>
                        {project.status}
                    </div>
                </div>
            ))}
        </div>
    );
}


