import client from './client'

export const getSchedules = (params) =>
  client.get('/schedules', { params })

export const getSchedule = (id) =>
  client.get(`/schedules/${id}`)

export const createSchedule = (data) =>
  client.post('/schedules', data)

export const updateSchedule = (id, data) =>
  client.put(`/schedules/${id}`, data)

export const deleteSchedule = (id) =>
  client.delete(`/schedules/${id}`)

export const updateScheduleStatus = (id, status) =>
  client.patch(`/schedules/${id}/status`, { status })

export const assignExaminers = (id, data) =>
  client.post(`/schedules/${id}/assign-examiners`, data)

export const setSchedule = (id, data) =>
  client.post(`/schedules/${id}/set-schedule`, data)

export const sendInvitations = (id) =>
  client.post(`/schedules/${id}/send-invitations`)

export const startExam = (id) =>
  client.patch(`/schedules/${id}/start-exam`)

export const completeExam = (id) =>
  client.patch(`/schedules/${id}/complete`)
