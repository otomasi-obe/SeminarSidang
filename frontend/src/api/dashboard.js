import client from './client'

export const getDashboardStats = () =>
  client.get('/dashboard/stats')

export const getSchedulesToday = () =>
  client.get('/dashboard/schedules-today')

export const getUpcomingSchedules = () =>
  client.get('/dashboard/upcoming')
