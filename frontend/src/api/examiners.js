import client from './client'

export const getExaminers = (scheduleId) =>
  client.get(`/schedules/${scheduleId}/examiners`)

export const addExaminer = (scheduleId, data) =>
  client.post(`/schedules/${scheduleId}/examiners`, data)

export const removeExaminer = (scheduleId, examinerId) =>
  client.delete(`/schedules/${scheduleId}/examiners/${examinerId}`)

export const updateScore = (scheduleId, examinerId, data) =>
  client.put(`/schedules/${scheduleId}/examiners/${examinerId}/score`, data)
