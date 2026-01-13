'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, AlertCircle, CheckCircle, Clock, Plus } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://crm-api.vasifytech.com/api';
// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DailyTracking({ project }) {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [formData, setFormData] = useState({
    tracking_date: new Date().toISOString().split('T')[0],
    planned_work: '',
    actual_work: '',
    issues_logged: '',
    tomorrow_plan: '',
    on_track_status: 'Green',
  });

  useEffect(() => {
    if (!project?.id) return;
    fetchEntries();
  }, [project?.id]);

  const fetchEntries = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/projects/${project.id}/daily-tracking`,
        {
          headers: {
            Authorization:
              typeof window !== 'undefined'
                ? `Bearer ${localStorage.getItem('token')}`
                : '',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setEntries(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // normalize date to YYYY-MM-DD to match MySQL DATE and unique key
      const d = new Date(formData.tracking_date);
      const trackingDateStr = Number.isNaN(d.getTime())
        ? formData.tracking_date
        : d.toISOString().split('T')[0];

      const payload = {
        ...formData,
        tracking_date: trackingDateStr,
      };

      const response = await fetch(
        `${API_BASE}/projects/${project.id}/daily-tracking`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              typeof window !== 'undefined'
                ? `Bearer ${localStorage.getItem('token')}`
                : '',
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setShowForm(false);
        setFormData({
          tracking_date: new Date().toISOString().split('T')[0],
          planned_work: '',
          actual_work: '',
          issues_logged: '',
          tomorrow_plan: '',
          on_track_status: 'Green',
        });
        fetchEntries();
      } else {
        const err = await response.json().catch(() => null);
        console.error('Failed to save entry:', err || response.statusText);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Green':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'Yellow':
        return <AlertCircle className="text-yellow-600" size={20} />;
      case 'Red':
        return <AlertCircle className="text-red-600" size={20} />;
      default:
        return <Clock className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Green: 'bg-green-100 text-green-800',
      Yellow: 'bg-yellow-100 text-yellow-800',
      Red: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.Green;
  };

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Generate all dates between project.start_date and project.end_date
  const days = useMemo(() => {
    const result = [];
    if (!project?.start_date || !project?.end_date) return result;

    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return result;

    const cur = new Date(
      Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
    );
    const endUtc = new Date(
      Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())
    );

    while (cur <= endUtc) {
      result.push(cur.toISOString().split('T')[0]);
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return result;
  }, [project?.start_date, project?.end_date]);

  // Map entries by tracking_date for quick lookup
  const entryByDate = useMemo(() => {
    const map = {};
    for (const e of entries) {
      if (!e.tracking_date) continue;
      const d = new Date(e.tracking_date);
      const key = Number.isNaN(d.getTime())
        ? String(e.tracking_date).slice(0, 10)
        : d.toISOString().split('T')[0];
      map[key] = e;
    }
    return map;
  }, [entries]);

  const openFormForDate = (dateStr, existingEntry) => {
    setSelectedDate(dateStr);
    setFormData({
      tracking_date: dateStr,
      planned_work: existingEntry?.planned_work || '',
      actual_work: existingEntry?.actual_work || '',
      issues_logged: existingEntry?.issues_logged || '',
      tomorrow_plan: existingEntry?.tomorrow_plan || '',
      on_track_status: existingEntry?.on_track_status || 'Green',
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">Daily Tracking</h3>
        <button
          onClick={() =>
            openFormForDate(
              new Date().toISOString().split('T')[0],
              entryByDate[new Date().toISOString().split('T')[0]]
            )
          }
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Calendar size={18} />
          {showForm ? 'Edit Today' : 'Add Today Entry'}
        </button>
      </div>

      {/* Entry Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4 text-sm text-gray-600">
            Updating entry for:{' '}
            <span className="font-semibold">{formatDateLabel(selectedDate)}</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={formData.tracking_date}
                  onChange={(e) =>
                    setFormData({ ...formData, tracking_date: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.on_track_status}
                  onChange={(e) =>
                    setFormData({ ...formData, on_track_status: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="Green">On Track (Green)</option>
                  <option value="Yellow">Slight Delay (Yellow)</option>
                  <option value="Red">Major Delay (Red)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Planned Work</label>
              <textarea
                value={formData.planned_work}
                onChange={(e) =>
                  setFormData({ ...formData, planned_work: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="What was planned for this day..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Actual Work Done</label>
              <textarea
                value={formData.actual_work}
                onChange={(e) =>
                  setFormData({ ...formData, actual_work: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="What was actually completed..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Issues/Blockers</label>
              <textarea
                value={formData.issues_logged}
                onChange={(e) =>
                  setFormData({ ...formData, issues_logged: e.target.value })
                }
                rows={2}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Any issues or blockers encountered..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tomorrow&apos;s Plan
              </label>
              <textarea
                value={formData.tomorrow_plan}
                onChange={(e) =>
                  setFormData({ ...formData, tomorrow_plan: e.target.value })
                }
                rows={2}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="What&apos;s planned for tomorrow..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Save Entry
            </button>
          </form>
        </div>
      )}

      {/* Per‑day list from start to end */}
      <div className="space-y-4">
        {days.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              This project does not have a valid start and end date.
            </p>
          </div>
        )}

        {days.map((dateStr) => {
          const entry = entryByDate[dateStr];
          return (
            <div key={dateStr} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {entry ? (
                    getStatusIcon(entry.on_track_status)
                  ) : (
                    <Clock className="text-gray-400" size={20} />
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {formatDateLabel(dateStr)}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {entry
                        ? `Logged by ${entry.logged_by_name || 'Unknown'}`
                        : 'No entry yet'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {entry && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        entry.on_track_status
                      )}`}
                    >
                      {entry.on_track_status}
                    </span>
                  )}
                  <button
                    onClick={() => openFormForDate(dateStr, entry)}
                    className="px-3 py-1 text-xs border rounded-lg flex items-center gap-1 hover:bg-gray-50"
                  >
                    <Plus size={14} />
                    {entry ? 'Edit' : 'Add'}
                  </button>
                </div>
              </div>

              {entry ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-sm text-gray-700 mb-2">
                        Planned Work
                      </h5>
                      <p className="text-gray-600 text-sm whitespace-pre-wrap">
                        {entry.planned_work || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm text-gray-700 mb-2">
                        Actual Work
                      </h5>
                      <p className="text-gray-600 text-sm whitespace-pre-wrap">
                        {entry.actual_work || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {entry.issues_logged && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <h5 className="font-semibold text-sm text-red-800 mb-1">
                        Issues/Blockers
                      </h5>
                      <p className="text-red-700 text-sm whitespace-pre-wrap">
                        {entry.issues_logged}
                      </p>
                    </div>
                  )}

                  {entry.tomorrow_plan && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold text-sm text-blue-800 mb-1">
                        Tomorrow&apos;s Plan
                      </h5>
                      <p className="text-blue-700 text-sm whitespace-pre-wrap">
                        {entry.tomorrow_plan}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  No daily update recorded for this day. Click &quot;Add&quot; to
                  log planned and actual work.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
