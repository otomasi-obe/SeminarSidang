import client from './client'

export const getInvitations = () =>
  client.get('/invitations')

export const markInvitationRead = (id) =>
  client.patch(`/invitations/${id}/read`)
