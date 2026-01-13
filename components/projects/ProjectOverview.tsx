'use client';
import { DollarSign, Calendar, TrendingUp, FileText } from 'lucide-react';

export default function ProjectOverview({ project, onUpdate }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const formatDate = (date) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    icon={<Calendar className="text-blue-600" />}
                    title="Start Date"
                    value={formatDate(project.start_date)}
                    color="blue"
                />
                <MetricCard
                    icon={<Calendar className="text-green-600" />}
                    title="End Date"
                    value={formatDate(project.end_date)}
                    color="green"
                />
                <MetricCard
                    icon={<DollarSign className="text-purple-600" />}
                    title="Budget"
                    value={formatCurrency(project.estimated_budget)}
                    subtitle={`Spent: ${formatCurrency(project.actual_cost)}`}
                    color="purple"
                />
                <MetricCard
                    icon={<TrendingUp className="text-orange-600" />}
                    title="Progress"
                    value={`${project.progress_percentage || 0}%`}
                    color="orange"
                />
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Description */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText size={20} />
                        Description
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                        {project.description || 'No description provided'}
                    </p>
                </div>

                {/* Project Info */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Project Information</h3>
                    <div className="space-y-3">
                        <InfoRow label="Project ID" value={project.project_id} />
                        <InfoRow label="Client" value={project.client_name || 'No client'} />
                        <InfoRow label="Department" value={project.department || 'N/A'} />
                        <InfoRow label="Category" value={project.category} />
                        <InfoRow label="Created By" value={project.created_by_name} />
                        <InfoRow 
                            label="Created At" 
                            value={new Date(project.created_at).toLocaleDateString()} 
                        />
                    </div>
                </div>
            </div>

            {/* Scope of Work */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Scope of Work</h3>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                    {project.scope_of_work || 'No scope of work defined'}
                </div>
            </div>

            {/* Milestones Preview */}
            {project.milestones && project.milestones.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Milestones</h3>
                    <div className="space-y-3">
                        {project.milestones.slice(0, 3).map(milestone => (
                            <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{milestone.title}</p>
                                    <p className="text-sm text-gray-600">
                                        Target: {formatDate(milestone.target_date)}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    milestone.status === 'Completed' 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {milestone.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function MetricCard({ icon, title, value, subtitle, color }) {
    const colorClasses = {
        blue: 'bg-blue-50',
        green: 'bg-green-50',
        purple: 'bg-purple-50',
        orange: 'bg-orange-50'
    };

    return (
        <div className={`${colorClasses[color]} rounded-lg p-6 border border-gray-200`}>
            <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                    {icon}
                </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
    );
}