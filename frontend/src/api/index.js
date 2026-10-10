import api from './client';

export const authApi = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/users/me');
    return res.data;
  },
  updateMe: async (userData) => {
    const res = await api.put('/users/me', userData);
    return res.data;
  },
};

export const contactsApi = {
  getContacts: async () => {
    const res = await api.get('/contacts');
    return res.data;
  },
  addContact: async (contact) => {
    const res = await api.post('/contacts', contact);
    return res.data;
  },
  deleteContact: async (id) => {
    const res = await api.delete(`/contacts/${id}`);
    return res.data;
  },
};

export const alertsApi = {
  trigger: async (type, lat, lng, meta = {}) => {
    const res = await api.post('/alerts/trigger', { type, lat, lng, meta });
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get('/alerts/history');
    return res.data;
  },
  acknowledge: async (id) => {
    const res = await api.post(`/alerts/${id}/acknowledge`);
    return res.data;
  },
  resolve: async (id) => {
    const res = await api.post(`/alerts/${id}/resolve`);
    return res.data;
  },
};

export const aiApi = {
  checkScream: async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'mic-sample.wav');
    const res = await api.post('/ai/scream-check', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  checkMotion: async (readings) => {
    const res = await api.post('/ai/motion-check', { readings });
    return res.data;
  },
};

export const locationsApi = {
  update: async (lat, lng) => {
    const res = await api.post('/locations/update', { lat, lng });
    return res.data;
  },
  getLive: async (userId = 'me') => {
    const res = await api.get(`/locations/${userId}/live`);
    return res.data;
  },
};

export const incidentsApi = {
  getNearby: async (lat, lng, radius = 15.0) => {
    const res = await api.get('/incidents/nearby', {
      params: { lat, lng, radius },
    });
    return res.data;
  },
  report: async (data) => {
    const res = await api.post('/incidents/report', data);
    return res.data;
  },
};
