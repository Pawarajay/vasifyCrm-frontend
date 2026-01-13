'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://crm-api.vasifytech.com/api';
// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function NotesDiscussion({ projectId }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('General');

  useEffect(() => {
    if (!projectId) return;
    fetchNotes();
  }, [projectId]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${API_BASE}/projects/${projectId}/notes`, {
        headers: {
          Authorization:
            typeof window !== 'undefined'
              ? `Bearer ${localStorage.getItem('token')}`
              : '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNotes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const payload = {
      note_type: noteType || 'General',
      content: newNote.trim(),
      mentioned_users: [], // keep empty for now; backend handles null/JSON
    };

    try {
      const response = await fetch(`${API_BASE}/projects/${projectId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            typeof window !== 'undefined'
              ? `Bearer ${localStorage.getItem('token')}`
              : '',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setNewNote('');
        setNoteType('General');
        fetchNotes();
      } else {
        const err = await response.json().catch(() => null);
        console.error('Failed to add note:', err || response.statusText);
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const getNoteTypeColor = (type) => {
    const colors = {
      General: 'bg-gray-100 text-gray-700',
      Meeting: 'bg-blue-100 text-blue-700',
      Comment: 'bg-green-100 text-green-700',
    };
    return colors[type] || colors.General;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={24} className="text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Notes & Discussion</h3>
      </div>

      {/* Add Note Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              <option value="General">General Note</option>
              <option value="Meeting">Meeting Notes</option>
              <option value="Comment">Comment</option>
            </select>
          </div>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note or comment..."
            rows={4}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Send size={18} />
              Post Note
            </button>
          </div>
        </form>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {note.created_by_name
                    ? note.created_by_name.charAt(0).toUpperCase()
                    : '?'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {note.created_by_name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {note.created_at
                      ? `${new Date(
                          note.created_at
                        ).toLocaleDateString()} at ${new Date(
                          note.created_at
                        ).toLocaleTimeString()}`
                      : ''}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getNoteTypeColor(
                  note.note_type
                )}`}
              >
                {note.note_type || 'General'}
              </span>
            </div>
            <div className="text-gray-700 whitespace-pre-wrap">{note.content}</div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No notes or discussions yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Start the conversation above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
