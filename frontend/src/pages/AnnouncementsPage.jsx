import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Calendar,
  Building,
  User,
  Users,
  AlertCircle,
  Pin,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

export const AnnouncementsPage = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetRole: 'ALL',
    propertyId: '',
  });

  const canPostAnnouncement = ['SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(user?.role);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedPropertyFilter) params.propertyId = selectedPropertyFilter;
      const res = await api.get('/announcements', { params });
      setAnnouncements(res.data || []);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedPropertyFilter]);

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const res = await api.get('/properties');
        setProperties(res.data || []);
      } catch (err) {
        console.error('Failed to load properties', err);
      }
    };
    fetchProps();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      title: '',
      content: '',
      targetRole: 'ALL',
      propertyId: properties.length > 0 ? properties[0].id : '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setErrorMsg('Title and content are required');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        targetRole: formData.targetRole,
        propertyId: formData.propertyId ? Number(formData.propertyId) : null,
      };
      await api.post('/announcements', payload);
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to publish announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAnnouncements = announcements.filter((ann) => {
    const term = searchTerm.toLowerCase();
    const matchTitle = ann.title?.toLowerCase().includes(term);
    const matchContent = ann.content?.toLowerCase().includes(term);
    const matchAuthor = ann.author?.fullName?.toLowerCase().includes(term);
    return matchTitle || matchContent || matchAuthor;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Noticeboard & Announcements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated with essential property notifications, rules, and community notices
          </p>
        </div>

        {canPostAnnouncement && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-secondary transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Property:</span>
          </div>
          <select
            value={selectedPropertyFilter}
            onChange={(e) => setSelectedPropertyFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Announcements</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs">Loading announcements...</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Announcements Found</h3>
          <p className="text-xs text-slate-500 mt-1">There are no notices matching your filter or query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>

              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                    <Pin className="w-3.5 h-3.5" />
                    <span>{ann.property ? ann.property.name : 'Platform Wide'}</span>
                  </div>
                  <Badge
                    variant={
                      ann.targetRole === 'ALL'
                        ? 'neutral'
                        : ann.targetRole === 'TENANT'
                        ? 'primary'
                        : 'warning'
                    }
                  >
                    Target: {ann.targetRole}
                  </Badge>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {ann.title}
                </h3>

                {/* Content */}
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line line-clamp-4">
                  {ann.content}
                </p>
              </div>

              {/* Footer Meta */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1 truncate max-w-[140px]">
                  <User className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{ann.author?.fullName || 'Administrator'}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Publish Notice / Announcement">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Property</label>
            <select
              value={formData.propertyId}
              onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Platform Wide (All Tenants & Properties)</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Audience Role</label>
            <select
              value={formData.targetRole}
              onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Users</option>
              <option value="TENANT">Tenants Only</option>
              <option value="MANAGER">Managers Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Scheduled Water Maintenance Tomorrow 10 AM - 1 PM"
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Details & Instructions *</label>
            <textarea
              required
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Provide clear information, timelines, and guidelines for tenants..."
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-secondary transition-all disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default AnnouncementsPage;
