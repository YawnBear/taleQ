const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// Function to send interview notification email
async function sendInterviewNotificationEmail(candidateEmail, interviewDetails) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'taleq.app@gmail.com',
      pass: 'taleq@9999',
    },
  });

  const mailOptions = {
    from: 'taleq.app@gmail.com',
    to: candidateEmail,
    subject: 'Interview Invitation from taleQ',
    html: `<p>Congratulations! You have been shortlisted for an interview.<br>
           <b>Details:</b> ${interviewDetails}<br>
           Please reply to this email to confirm your availability.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

// Endpoint to trigger interview notification
app.post('/api/notify-interview', async (req, res) => {
  const { email, details } = req.body;
  if (!email || !details) {
    return res.status(400).json({ error: 'Email and interview details are required.' });
  }
  try {
    await sendInterviewNotificationEmail(email, details);
    res.status(200).json({ message: 'Interview notification sent.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

app.listen(3000, () => console.log('Server started on http://localhost:3000'));