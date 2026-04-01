const { randomBytes } = require('crypto');
const { SESSION } = require('../config/constants');

/**
 * Generate a random invitation code
 * Format: 8-10 characters (alphanumeric + special chars)
 * Example: 'aB3#xK9@'
 */
function generateInvitationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let code = '';

  for (let i = 0; i < SESSION.CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }

  return code;
}

/**
 * Generate a unique message ID
 */
function generateMessageId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

module.exports = {
  generateInvitationCode,
  generateMessageId,
};
