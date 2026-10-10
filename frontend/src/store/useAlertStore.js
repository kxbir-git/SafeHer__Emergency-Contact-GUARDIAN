import { create } from 'zustand';
import { alertsApi } from '../api';

export const useAlertStore = create((set, get) => ({
  alerts: [],
  activeAlert: null,
  isTriggering: false,
  guardianMode: false,
  micActive: false,
  motionActive: false,
  voiceActive: false,
  screamScore: 0.0,
  motionScore: 0.0,
  loading: false,

  setGuardianMode: (val) => set({ guardianMode: val }),
  setMicActive: (val) => set({ micActive: val }),
  setMotionActive: (val) => set({ motionActive: val }),
  setVoiceActive: (val) => set({ voiceActive: val }),
  setScreamScore: (score) => set({ screamScore: score }),
  setMotionScore: (score) => set({ motionScore: score }),

  setActiveAlert: (alert) => set({ activeAlert: alert }),

  fetchAlerts: async () => {
    set({ loading: true });
    try {
      const data = await alertsApi.getHistory();
      set({ alerts: data, loading: false });
      // Check if any alert is still active/triggered
      const active = data.find((a) => a.status === 'triggered' || a.status === 'acknowledged');
      if (active) set({ activeAlert: active });
    } catch (err) {
      set({ loading: false });
    }
  },

  triggerEmergency: async (type = 'sos', lat, lng, meta = {}) => {
    set({ isTriggering: true });
    try {
      const newAlert = await alertsApi.trigger(type, lat, lng, meta);
      set((state) => ({
        alerts: [newAlert, ...state.alerts],
        activeAlert: newAlert,
        isTriggering: false,
      }));
      return { success: true, alert: newAlert };
    } catch (err) {
      set({ isTriggering: false });
      return { success: false, error: err.response?.data?.detail || 'Failed to trigger alert' };
    }
  },

  acknowledgeAlert: async (alertId) => {
    try {
      const updated = await alertsApi.acknowledge(alertId);
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === alertId ? updated : a)),
        activeAlert: state.activeAlert?.id === alertId ? updated : state.activeAlert,
      }));
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  },

  resolveAlert: async (alertId) => {
    try {
      const updated = await alertsApi.resolve(alertId);
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === alertId ? updated : a)),
        activeAlert: state.activeAlert?.id === alertId ? null : state.activeAlert,
      }));
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  },

  handleRealtimeAlert: (event) => {
    if (event.event === 'alert_triggered') {
      const newAlert = event.data;
      set((state) => ({
        alerts: [newAlert, ...state.alerts.filter((a) => a.id !== newAlert.id)],
        activeAlert: newAlert,
      }));
    } else if (event.event === 'alert_acknowledged') {
      const { alert_id, status } = event.data;
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === alert_id ? { ...a, status } : a)),
        activeAlert: state.activeAlert?.id === alert_id ? { ...state.activeAlert, status } : state.activeAlert,
      }));
    } else if (event.event === 'alert_resolved') {
      const { alert_id, status } = event.data;
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === alert_id ? { ...a, status } : a)),
        activeAlert: state.activeAlert?.id === alert_id ? null : state.activeAlert,
      }));
    }
  },
}));
