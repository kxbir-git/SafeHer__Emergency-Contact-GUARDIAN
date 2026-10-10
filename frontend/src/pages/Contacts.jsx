import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Phone, Mail, Shield, Check, X, AlertCircle } from 'lucide-react';
import { contactsApi } from '../api';

export const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relation: 'Family',
    is_guardian: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await contactsApi.getContacts();
      setContacts(data);
    } catch (err) {
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Name and phone number are required.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      await contactsApi.addContact(formData);
      setShowAddModal(false);
      setFormData({ name: '', phone: '', email: '', relation: 'Family', is_guardian: true });
      fetchContacts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add contact');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this emergency contact?')) {
      try {
        await contactsApi.deleteContact(id);
        fetchContacts();
      } catch (err) {
        alert('Failed to delete contact');
      }
    }
  };

  return (
    <div className="p-6 max-w-[1240px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#111827]">Emergency Contacts & Guardians</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Up to 5 trusted people who receive immediate SMS & real-time alerts with your GPS location
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setShowAddModal(true);
          }}
          disabled={contacts.length >= 5}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Emergency Contact ({contacts.length}/5)</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="card-base overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#6B7280]">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-[#9CA3AF] mx-auto" />
            <h3 className="text-sm font-semibold text-[#111827]">No emergency contacts registered</h3>
            <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
              Add at least 2 emergency contacts so SafeHer can dispatch real-time alerts if you are in distress.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-[#DC2626] text-white text-xs font-semibold rounded-lg"
            >
              Add First Contact
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#6B7280] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Contact Name</th>
                  <th className="py-3 px-4">Relationship</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Guardian Privileges</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#111827]">
                      {contact.name}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280]">{contact.relation}</td>
                    <td className="py-3.5 px-4 font-mono text-[#111827]">{contact.phone}</td>
                    <td className="py-3.5 px-4 text-[#6B7280]">{contact.email || '—'}</td>
                    <td className="py-3.5 px-4">
                      {contact.is_guardian ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-[#DC2626] border border-red-200">
                          <Shield className="w-3 h-3" />
                          <span>GUARDIAN</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#6B7280]">Contact</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(contact.id)}
                        title="Delete contact"
                        className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#DC2626] hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-md p-6 shadow-modal">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#DC2626]" />
                <h3 className="text-base font-semibold text-[#111827]">Add Emergency Contact</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-[#9CA3AF] hover:text-[#111827]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5">
              {error && (
                <div className="p-2.5 rounded-lg bg-red-50 text-xs text-[#DC2626] border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sunita Sharma"
                  className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2 bg-white text-[#111827] focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Mobile Phone (Receives SMS)</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98111 22334"
                  className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2 bg-white text-[#111827] focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sunita@example.com"
                  className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2 bg-white text-[#111827] focus:outline-none focus:border-[#111827]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Relationship</label>
                <select
                  value={formData.relation}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2 bg-white text-[#111827] focus:outline-none focus:border-[#111827]"
                >
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Spouse">Spouse / Partner</option>
                  <option value="Friend">Close Friend</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="guardianCheckbox"
                  checked={formData.is_guardian}
                  onChange={(e) => setFormData({ ...formData, is_guardian: e.target.checked })}
                  className="rounded border-[#E5E7EB] text-[#DC2626] focus:ring-0"
                />
                <label htmlFor="guardianCheckbox" className="text-xs text-[#111827] select-none">
                  Designate as Guardian (can track live route and resolve alerts)
                </label>
              </div>

              <div className="pt-3 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 text-xs font-medium border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:text-[#111827]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
