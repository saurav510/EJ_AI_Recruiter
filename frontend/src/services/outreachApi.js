import axios from 'axios';

const outreachAxios = axios.create({ baseURL: '/api', timeout: 90000 });

export const generateOutreach = (payload) =>
  outreachAxios.post('/outreach/generate', payload)
    .then((r) => r.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

export const getOutreachHistory = (page = 1, limit = 10) =>
  outreachAxios.get(`/outreach/history?page=${page}&limit=${limit}`)
    .then((r) => r.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

export const getOutreachById = (id) =>
  outreachAxios.get(`/outreach/${id}`)
    .then((r) => r.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

export const trackCopy = (id, type) =>
  outreachAxios.patch(`/outreach/${id}/copy`, { type })
    .then((r) => r.data)
    .catch(() => null); // fire-and-forget — don't block UI

export const deleteOutreach = (id) =>
  outreachAxios.delete(`/outreach/${id}`)
    .then((r) => r.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

// For dropdowns
export const fetchMatchList = (limit = 50) =>
  outreachAxios.get(`/match/history?page=1&limit=${limit}`)
    .then((r) => r.data.data || [])
    .catch(() => []);
