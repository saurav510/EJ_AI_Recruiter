import axios from 'axios';

const resumeAxios = axios.create({
  baseURL: '/api',
  timeout: 120000,
});

// Resume API calls
export const parseResume = (formData, onUploadProgress) =>
  resumeAxios
    .post('/resume/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    })
    .then((r) => r.data)
    .catch((err) => {
      const msg = err.response?.data?.error || err.message || 'Upload failed.';
      return Promise.reject(new Error(msg));
    });

export const getResumeHistory = (page = 1, limit = 10) =>
  resumeAxios
    .get(`/resume/history?page=${page}&limit=${limit}`)
    .then((r) => r.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

export const getResumeById = (id) =>
  resumeAxios
    .get(`/resume/${id}`)
    .then((r) => r.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

export const deleteResume = (id) =>
  resumeAxios
    .delete(`/resume/${id}`)
    .then((r) => r.data)
    .catch((err) => Promise.reject(new Error(err.response?.data?.error || err.message)));

