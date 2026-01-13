'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Edit } from 'lucide-react';
import ProjectOverview from '@/components/projects/ProjectOverview';
import TeamAllocation from '@/components/projects/TeamAllocation';
import DailyTracking from '@/components/projects/DailyTracking';
import TaskMilestone from '@/components/projects/TaskMilestone';
import TimeTracking from '@/components/projects/TimeTracking';
import NotesDiscussion from '@/components/projects/NotesDiscussion';

// same backend base
// api';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://crm-api.vasifytech.com/api';


export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!params?.id) return;
    fetchProjectDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/projects/${params.id}`, {
        headers: {
          Authorization: `Bearer ${
            typeof window !== 'undefined' ? localStorage.getItem('token') : ''
          }`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data);
      } else {
        console.error('Failed to fetch project:', await response.text());
        setProject(null);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = () => {
    if (!project?.id) return;
    router.push(`/projects/${project.id}/edit`);
  };

  const handleExport = async () => {
    if (!project?.id) return;
    try {
      const res = await fetch(`${API_BASE}/projects/${project.id}/report`, {
        headers: {
          Authorization:
            typeof window !== 'undefined'
              ? `Bearer ${localStorage.getItem('token')}`
              : '',
        },
      });
      if (!res.ok) {
        console.error('Failed to export report', await res.text());
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.project_id || 'project'}-report.pdf`; // change extension if needed
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting report:', err);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'team', label: 'Team & Resources', icon: '👥' },
    { id: 'daily', label: 'Daily Tracking', icon: '📅' },
    { id: 'tasks', label: 'Tasks & Milestones', icon: '✓' },
    { id: 'time', label: 'Time Tracking', icon: '⏱' },
    { id: 'notes', label: 'Notes & Discussion', icon: '💬' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Project not found</p>
          <button
            onClick={() => router.push('/projects')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'bg-gray-100 text-gray-800',
      Medium: 'bg-blue-100 text-blue-800',
      High: 'bg-orange-100 text-orange-800',
      Critical: 'bg-red-100 text-red-800',
    };
    return colors[priority] || colors.Medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Not Started': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'On Hold': 'bg-yellow-100 text-yellow-800',
      Completed: 'bg-green-100 text-green-800',
    };
    return colors[status] || colors['In Progress'];
  };

  const getHealthColor = (health) => {
    const colors = {
      Green: 'bg-green-500',
      Yellow: 'bg-yellow-500',
      Red: 'bg-red-500',
    };
    return colors[health] || colors.Green;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/projects')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {project.title}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      project.priority
                    )}`}
                  >
                    {project.priority}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                  <div
                    className={`w-3 h-3 rounded-full ${getHealthColor(
                      project.health_rating
                    )}`}
                    title={`Health: ${project.health_rating}`}
                  ></div>
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  {project.project_id} • {project.client_name || 'No Client'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Download size={18} />
                Export Report
              </button>
              <button
                onClick={handleEditProject}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit size={18} />
                Edit Project
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Project Progress</span>
              <span className="font-semibold text-gray-900">
                {project.progress_percentage || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${project.progress_percentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'overview' && (
          <ProjectOverview project={project} onUpdate={fetchProjectDetails} />
        )}
        {activeTab === 'team' && (
          <TeamAllocation project={project} onUpdate={fetchProjectDetails} />
        )}
        {activeTab === 'daily' && <DailyTracking project={project} />}
        {activeTab === 'tasks' && <TaskMilestone projectId={project.id} />}
        {activeTab === 'time' && <TimeTracking projectId={project.id} />}
        {activeTab === 'notes' && <NotesDiscussion projectId={project.id} />}
      </div>
    </div>
  );
}
