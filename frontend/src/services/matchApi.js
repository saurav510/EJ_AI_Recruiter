import axios from 'axios';

const matchAxios = axios.create({ baseURL: '/api', timeout: 90000 });

export const matchCandidate = (payload) =>
  matchAxios.post('/match/candidate', payload)
    .then((r) => r.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

export const getMatchHistory = (page = 1, limit = 10) =>
  matchAxios.get(`/match/history?page=${page}&limit=${limit}`)
    .then((r) => r.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

export const getMatchById = (id) =>
  matchAxios.get(`/match/${id}`)
    .then((r) => r.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

export const deleteMatch = (id) =>
  matchAxios.delete(`/match/${id}`)
    .then((r) => r.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

// Fetch JD + Resume history lists for dropdowns
export const fetchJDList = (limit = 50) =>
  matchAxios.get(`/jd/history?page=1&limit=${limit}`)
    .then((r) => r.data)
    .catch(() => ({ data: [] }));

export const fetchResumeList = (limit = 50) =>
  matchAxios.get(`/resume/history?page=1&limit=${limit}`)
    .then((r) => r.data)
    .catch(() => ({ data: [] }));
