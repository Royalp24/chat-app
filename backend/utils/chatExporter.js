/**
 * Export chat messages to formatted .txt file
 */

function formatTimestamp(date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function generateChatText(sessionData) {
  let text = '';

  // Header
  text += '╔═══════════════════════════════════════════════════════════════╗\n';
  text += '║                  EPHEMERAL CHAT SESSION                       ║\n';
  text += '╚═══════════════════════════════════════════════════════════════╝\n\n';

  // Session info
  text += `Session Code: ${sessionData.code}\n`;
  text += `Created By: ${sessionData.createdBy}\n`;
  text += `Created At: ${formatTimestamp(sessionData.createdAt)}\n`;
  text += `Participants (${sessionData.participants.length}): ${sessionData.participants.map((p) => p.username).join(', ')}\n`;
  text += '\n' + '─'.repeat(65) + '\n\n';

  // Messages
  text += 'CHAT HISTORY:\n\n';

  if (sessionData.messages.length === 0) {
    text += '[No messages in this session]\n';
  } else {
    sessionData.messages.forEach((msg) => {
      const timestamp = formatTimestamp(msg.timestamp);
      const username = msg.username;

      if (msg.deleted) {
        text += `[${timestamp}] ${username}: [This message was deleted]\n`;
      } else {
        let messageText = msg.text;
        if (msg.edited) {
          messageText += ' [edited]';
        }
        text += `[${timestamp}] ${username}:\n  ${messageText}\n`;
      }

      text += '\n';
    });
  }

  // Footer
  text += '\n' + '─'.repeat(65) + '\n';
  text += `End of chat history - Downloaded at ${formatTimestamp(new Date())}\n`;
  text += '═'.repeat(65) + '\n';

  return text;
}

function generateFileName(code) {
  const now = new Date();
  const dateStr = now
    .toISOString()
    .slice(0, 19)
    .replace(/:/g, '-')
    .replace('T', '_');
  return `chat_${code}_${dateStr}.txt`;
}

module.exports = {
  generateChatText,
  generateFileName,
  formatTimestamp,
};
