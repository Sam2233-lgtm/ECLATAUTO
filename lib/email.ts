import nodemailer from 'nodemailer';

// Configure transporter — uses env vars, falls back to Ethereal (dev preview)
function createTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  // Dev: log to console, don't actually send
  return null;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

const GOLD = '#C9A84C';
const BLACK = '#0a0a0a';

function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
          <td style="background:${BLACK};padding:32px 40px;text-align:center;">
            <div style="display:inline-block;background:${GOLD};border-radius:8px;padding:8px 14px;margin-bottom:12px;">
              <span style="color:${BLACK};font-weight:900;font-size:18px;">É</span>
            </div>
            <h1 style="color:${GOLD};margin:0;font-size:22px;font-weight:700;letter-spacing:1px;">Éclat Auto</h1>
            <p style="color:#D0D0C8;margin:4px 0 0;font-size:13px;">Service de détailing automobile à domicile</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8f8f8;padding:24px 40px;text-align:center;border-top:1px solid #e0e0e0;">
            <p style="color:#999;font-size:12px;margin:0;">Éclat Auto — Service mobile au Québec</p>
            <p style="color:#999;font-size:12px;margin:4px 0 0;">© ${new Date().getFullYear()} Éclat Auto. Tous droits réservés.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export interface ReservationEmailData {
  confirmationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  vehicleType: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  date: string;
  timeSlot: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
  price: number;
  locale?: string;
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 0;color:#666;font-size:14px;width:40%;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;color:#111;font-size:14px;font-weight:600;vertical-align:top;">${value}</td>
    </tr>`;
}

// Email to customer confirming reservation
export async function sendConfirmationEmail(data: ReservationEmailData, adminEmail: string, confirmationMsg: string) {
  const isFr = data.locale !== 'en';
  const vehicle = [data.vehicleMake, data.vehicleModel, data.vehicleYear].filter(Boolean).join(' ') || data.vehicleType;

  const body = `
    <h2 style="color:#111;font-size:24px;margin:0 0 8px;">${isFr ? 'Réservation confirmée! 🎉' : 'Reservation Received! 🎉'}</h2>
    <p style="color:#666;font-size:15px;margin:0 0 28px;line-height:1.6;">${confirmationMsg}</p>

    <div style="background:#fafafa;border:1px solid #e8e8e8;border-radius:10px;padding:24px;margin-bottom:28px;">
      <h3 style="color:${GOLD};font-size:14px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">${isFr ? 'Détails de votre réservation' : 'Booking Details'}</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row(isFr ? 'N° de confirmation' : 'Confirmation #', `<span style="font-family:monospace;background:#111;color:${GOLD};padding:2px 8px;border-radius:4px;">${data.confirmationNumber}</span>`)}
        ${row(isFr ? 'Service' : 'Service', data.service)}
        ${row(isFr ? 'Véhicule' : 'Vehicle', vehicle)}
        ${data.vehicleColor ? row(isFr ? 'Couleur' : 'Color', data.vehicleColor) : ''}
        ${row(isFr ? 'Date' : 'Date', formatDate(data.date))}
        ${row(isFr ? 'Heure' : 'Time', data.timeSlot)}
        ${row(isFr ? 'Adresse' : 'Address', `${data.address}, ${data.city} ${data.postalCode}`)}
        ${data.notes ? row(isFr ? 'Notes' : 'Notes', data.notes) : ''}
      </table>
    </div>

    <div style="background:${BLACK};border-radius:10px;padding:20px 24px;margin-bottom:28px;display:flex;align-items:center;justify-content:space-between;">
      <span style="color:#fff;font-size:15px;">${isFr ? 'Estimation du total' : 'Total Estimate'}</span>
      <span style="color:${GOLD};font-size:24px;font-weight:700;">~${data.price}$</span>
    </div>

    <p style="color:#888;font-size:13px;margin:0;font-style:italic;">${isFr ? '* Le prix final peut varier selon l\'état réel du véhicule.' : '* Final price may vary based on vehicle condition.'}</p>
  `;

  await send({
    to: data.email,
    from: adminEmail,
    subject: isFr
      ? `Éclat Auto — Réservation reçue (${data.confirmationNumber})`
      : `Éclat Auto — Reservation received (${data.confirmationNumber})`,
    html: baseTemplate(isFr ? 'Confirmation de réservation' : 'Booking Confirmation', body),
  });
}

// Email to admin notifying of new reservation
export async function sendAdminNotificationEmail(data: ReservationEmailData, adminEmail: string) {
  const vehicle = [data.vehicleMake, data.vehicleModel, data.vehicleYear].filter(Boolean).join(' ') || data.vehicleType;
  const body = `
    <h2 style="color:#111;font-size:22px;margin:0 0 8px;">🔔 Nouvelle réservation</h2>
    <p style="color:#666;font-size:14px;margin:0 0 24px;">Une nouvelle réservation vient d'être soumise sur le site.</p>

    <div style="background:#fafafa;border:1px solid #e8e8e8;border-radius:10px;padding:24px;margin-bottom:20px;">
      <h3 style="color:${GOLD};font-size:13px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Client</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row('Nom', `${data.firstName} ${data.lastName}`)}
        ${row('Téléphone', data.phone)}
        ${row('Courriel', data.email)}
        ${row('Adresse', `${data.address}, ${data.city} ${data.postalCode}`)}
      </table>
    </div>

    <div style="background:#fafafa;border:1px solid #e8e8e8;border-radius:10px;padding:24px;margin-bottom:20px;">
      <h3 style="color:${GOLD};font-size:13px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Réservation</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row('N° confirmation', data.confirmationNumber)}
        ${row('Service', data.service)}
        ${row('Véhicule', `${vehicle}${data.vehicleColor ? ' — ' + data.vehicleColor : ''}`)}
        ${row('Date', formatDate(data.date))}
        ${row('Heure', data.timeSlot)}
        ${row('Prix estimé', `${data.price}$`)}
        ${data.notes ? row('Notes client', data.notes) : ''}
      </table>
    </div>

    <div style="text-align:center;margin-top:28px;">
      <a href="${process.env.NEXTAUTH_URL ?? 'http://localhost:3001'}/fr/admin/reservations"
         style="display:inline-block;background:${GOLD};color:${BLACK};font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;">
        Voir dans l'admin →
      </a>
    </div>
  `;

  await send({
    to: adminEmail,
    from: adminEmail,
    subject: `🔔 Nouvelle réservation — ${data.firstName} ${data.lastName} (${data.confirmationNumber})`,
    html: baseTemplate('Nouvelle réservation', body),
  });
}

// Email to customer on status change
export async function sendStatusUpdateEmail(
  data: { firstName: string; lastName: string; email: string; confirmationNumber: string; service: string; date: string; timeSlot: string; locale?: string },
  newStatus: string,
  adminEmail: string
) {
  const isFr = data.locale !== 'en';
  const statusLabels: Record<string, { fr: string; en: string; color: string }> = {
    confirmed: { fr: 'Confirmée ✅', en: 'Confirmed ✅', color: '#16a34a' },
    completed: { fr: 'Complétée 🌟', en: 'Completed 🌟', color: '#7c3aed' },
    cancelled: { fr: 'Annulée ❌', en: 'Cancelled ❌', color: '#dc2626' },
  };

  const statusInfo = statusLabels[newStatus];
  if (!statusInfo) return; // Don't email on pending

  const body = `
    <h2 style="color:#111;font-size:22px;margin:0 0 8px;">${isFr ? 'Mise à jour de votre réservation' : 'Reservation Update'}</h2>
    <p style="color:#666;font-size:15px;margin:0 0 24px;">
      ${isFr ? 'Bonjour' : 'Hello'} ${data.firstName}, ${isFr ? 'le statut de votre réservation a été mis à jour.' : 'your reservation status has been updated.'}
    </p>

    <div style="text-align:center;padding:24px;background:#fafafa;border-radius:10px;margin-bottom:24px;border:1px solid #e8e8e8;">
      <p style="color:#666;font-size:13px;margin:0 0 8px;">${isFr ? 'Nouveau statut' : 'New status'}</p>
      <span style="font-size:20px;font-weight:700;color:${statusInfo.color};">${isFr ? statusInfo.fr : statusInfo.en}</span>
    </div>

    <div style="background:#fafafa;border:1px solid #e8e8e8;border-radius:10px;padding:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${row(isFr ? 'N° confirmation' : 'Confirmation #', data.confirmationNumber)}
        ${row(isFr ? 'Service' : 'Service', data.service)}
        ${row(isFr ? 'Date' : 'Date', formatDate(data.date))}
        ${row(isFr ? 'Heure' : 'Time', data.timeSlot)}
      </table>
    </div>

    ${newStatus === 'cancelled' ? `<p style="color:#666;font-size:14px;margin-top:20px;">${isFr ? 'Pour toute question, n\'hésitez pas à nous contacter.' : 'For any questions, feel free to contact us.'}</p>` : ''}
  `;

  await send({
    to: data.email,
    from: adminEmail,
    subject: isFr
      ? `Éclat Auto — Réservation ${isFr ? statusInfo.fr.split(' ')[0].toLowerCase() : statusInfo.en.split(' ')[0].toLowerCase()} (${data.confirmationNumber})`
      : `Éclat Auto — Reservation ${statusInfo.en.split(' ')[0].toLowerCase()} (${data.confirmationNumber})`,
    html: baseTemplate(isFr ? 'Mise à jour réservation' : 'Reservation Update', body),
  });
}

async function send({ to, from, subject, html }: { to: string; from: string; subject: string; html: string }) {
  const transporter = createTransporter();
  if (!transporter) {
    // Dev mode: log email to console
    console.log('\n📧 [EMAIL — DEV MODE]');
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log('  (Email not actually sent — configure SMTP_HOST to enable sending)');
    return;
  }
  try {
    await transporter.sendMail({ from, to, subject, html });
  } catch (err) {
    console.error('[Email error]', err);
  }
}
