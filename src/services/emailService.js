async function sendTaskReminderEmail({ to, name, title, period, scheduledDate, timezone }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn('Email reminder skipped: RESEND_API_KEY and EMAIL_FROM must be configured.');
    return { sent: false, skipped: true };
  }

  const dateLabel = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone || 'UTC',
  }).format(new Date(scheduledDate));

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `StudySteady ${period.toLowerCase()} reminder: ${title}`,
      html: `\n        <div style="font-family:Arial,sans-serif;line-height:1.6">\n          <h2>StudySteady reminder</h2>\n          <p>Hi ${escapeHtml(name || 'there')},</p>\n          <p>You have an upcoming study task:</p>\n          <p><strong>${escapeHtml(title)}</strong></p>\n          <p>Scheduled for: ${escapeHtml(dateLabel)}</p>\n          <p>Open StudySteady to get started.</p>\n        </div>\n      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email provider returned ${response.status}: ${body.slice(0, 300)}`);
  }

  return { sent: true };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

module.exports = { sendTaskReminderEmail };
