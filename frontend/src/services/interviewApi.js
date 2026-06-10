import axios from 'axios';

const interviewAxios = axios.create({ baseURL: '/api', timeout: 120000 });

export const generateQuestions = (payload) =>
  interviewAxios.post('/interview/questions', payload)
    .then((r) => r.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

export const getInterviewHistory = (page = 1, limit = 10) =>
  interviewAxios.get(`/interview/history?page=${page}&limit=${limit}`)
    .then((r) => r.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

export const getSessionById = (id) =>
  interviewAxios.get(`/interview/${id}`)
    .then((r) => r.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

export const deleteSession = (id) =>
  interviewAxios.delete(`/interview/${id}`)
    .then((r) => r.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

// Fetch all three lists for the dropdowns
export const fetchAllLists = () =>
  Promise.all([
    interviewAxios.get('/jd/history?page=1&limit=50').then((r) => r.data.data || []).catch(() => []),
    interviewAxios.get('/resume/history?page=1&limit=50').then((r) => r.data.data || []).catch(() => []),
    interviewAxios.get('/match/history?page=1&limit=50').then((r) => r.data.data || []).catch(() => []),
  ]);
