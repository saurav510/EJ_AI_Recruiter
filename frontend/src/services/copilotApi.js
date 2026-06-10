import axios from 'axios';

const copilotAxios = axios.create({ baseURL: '/api', timeout: 90000 });

export const startCopilotSession = (matchId) =>
  copilotAxios.post('/copilot/start', { matchId })
    .then((r) => r.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

export const sendCopilotMessage = (sessionId, message) =>
  copilotAxios.post(`/copilot/${sessionId}/message`, { message })
    .then((r) => r.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

export const getCopilotHistory = () =>
  copilotAxios.get('/copilot/history')
    .then((r) => r.data.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

export const getCopilotSession = (sessionId) =>
  copilotAxios.get(`/copilot/${sessionId}`)
    .then((r) => r.data.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

export const deleteCopilotSession = (sessionId) =>
  copilotAxios.delete(`/copilot/${sessionId}`)
    .then((r) => r.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));
