type BookingNotificationPayload = {
  recipientEmail: string;
  siteUrl: string;
  employeeName: string;
  startsAt: string;
  endsAt: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  notes: string | null;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendBookingNotificationEmail(payload: BookingNotificationPayload) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  const from = process.env.EMAIL_FROM ?? "Physio Patella <onboarding@resend.dev>";
  const normalizedSiteUrl = payload.siteUrl.replace(/\/$/, "");
  const logoUrl = `${normalizedSiteUrl}/physiopatella_logo.jpg`;
  const startsAtFormatted = formatDateTime(payload.startsAt);
  const endsAtFormatted = formatDateTime(payload.endsAt);

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f6fbfc;padding:24px;color:#16353d;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #d8e3e5;border-radius:16px;overflow:hidden;">
        <div style="padding:24px 24px 10px 24px;text-align:center;">
          <img src="${logoUrl}" alt="Physio Patella logo" width="120" height="120" style="display:block;margin:0 auto 12px auto;object-fit:contain;" />
          <h2 style="margin:0;font-size:24px;line-height:1.2;color:#2f7f90;">New Appointment Request</h2>
        </div>
        <div style="padding:20px 24px 24px 24px;">
          <p style="margin:0 0 16px 0;font-size:15px;color:#3d6068;">A new booking has been created on the Physio Patella website.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:8px 0;color:#3d6068;"><strong>Client:</strong></td><td style="padding:8px 0;color:#16353d;">${escapeHtml(payload.clientName)}</td></tr>
            <tr><td style="padding:8px 0;color:#3d6068;"><strong>Email:</strong></td><td style="padding:8px 0;color:#16353d;">${escapeHtml(payload.clientEmail)}</td></tr>
            <tr><td style="padding:8px 0;color:#3d6068;"><strong>Phone:</strong></td><td style="padding:8px 0;color:#16353d;">${escapeHtml(payload.clientPhone ?? "Not provided")}</td></tr>
            <tr><td style="padding:8px 0;color:#3d6068;"><strong>Employee:</strong></td><td style="padding:8px 0;color:#16353d;">${escapeHtml(payload.employeeName)}</td></tr>
            <tr><td style="padding:8px 0;color:#3d6068;"><strong>Starts:</strong></td><td style="padding:8px 0;color:#16353d;">${escapeHtml(startsAtFormatted)}</td></tr>
            <tr><td style="padding:8px 0;color:#3d6068;"><strong>Ends:</strong></td><td style="padding:8px 0;color:#16353d;">${escapeHtml(endsAtFormatted)}</td></tr>
            <tr><td style="padding:8px 0;color:#3d6068;"><strong>Notes:</strong></td><td style="padding:8px 0;color:#16353d;">${escapeHtml(payload.notes ?? "No notes")}</td></tr>
          </table>
        </div>
      </div>
    </div>
  `;

  const text = [
    "New appointment request - Physio Patella",
    "",
    `Client: ${payload.clientName}`,
    `Email: ${payload.clientEmail}`,
    `Phone: ${payload.clientPhone ?? "Not provided"}`,
    `Employee: ${payload.employeeName}`,
    `Starts: ${startsAtFormatted}`,
    `Ends: ${endsAtFormatted}`,
    `Notes: ${payload.notes ?? "No notes"}`,
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.recipientEmail],
      subject: `New appointment: ${payload.clientName} with ${payload.employeeName}`,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Email provider error: ${errorBody}`);
  }
}
