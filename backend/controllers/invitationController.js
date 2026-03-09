const Invitation = require('../models/Invitation');

const listMine = (req, res) => {
  try {
    const invitations = Invitation.findByRecipient(req.user.id);
    return res.json({ success: true, data: invitations, total: invitations.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const markRead = (req, res) => {
  try {
    const invitation = Invitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }
    if (invitation.recipient_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const updated = Invitation.markRead(req.params.id);
    return res.json({ success: true, message: 'Invitation marked as read', data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { listMine, markRead };
