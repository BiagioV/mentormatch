const nodemailer = require('nodemailer');

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    // fallback: log in console
    return {
      sendMail: async (opts) => {
        console.log('--- EMAIL (console transport) ---');
        console.log('To:', opts.to);
        console.log('Subject:', opts.subject);
        console.log(opts.text);
        console.log('-------------------------------');
        return { messageId: 'console' };
      }
    };
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

const transport = getTransport();

async function sendBookingEmail({ mentorEmail, menteeEmail, mentorName, menteeName, startTime, endTime }) {
  const from = process.env.MAIL_FROM || 'MentorMatch <no-reply@mentormatch.local>';
  const subject = 'Nuova prenotazione su MentorMatch';
  const text =
`Ciao!
È stata effettuata una prenotazione.

Mentor: ${mentorName}
Mentee: ${menteeName}
Quando: ${startTime} - ${endTime}

Accedi alla dashboard per i dettagli.`;

  await transport.sendMail({ from, to: [mentorEmail, menteeEmail].join(','), subject, text });
}

async function sendCancelEmail({ mentorEmail, menteeEmail, startTime, endTime }) {
  const from = process.env.MAIL_FROM || 'MentorMatch <no-reply@mentormatch.local>';
  const subject = 'Prenotazione annullata su MentorMatch';
  const text =
`Ciao!
Una prenotazione è stata annullata.

Quando: ${startTime} - ${endTime}`;

  await transport.sendMail({ from, to: [mentorEmail, menteeEmail].join(','), subject, text });
}

module.exports = { sendBookingEmail, sendCancelEmail };
