import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const body = await request.json();

    const { email, name, details } = body;

    if (!email || !name || !details) {
      return new Response(JSON.stringify({ 
        error: "Email, name and interview details are required.",
        received: { email, name, details } // Add this to see what was received
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
// Candidate can change to ${Candidate Name} to make it more personalized
    const mailOptions = {
      from: '"taleQ HR Team" <taleq.app@gmail.com>',
      to: email,
      subject: "Interview Invitation from TaleQ",
      replyTo: "taleq.app@gmail.com",
      text: `Dear ${name},

          We are pleased to inform you that you have been shortlisted for an interview with TaleQ.

          Please find the interview details below:
          ${details}

          We kindly request you to confirm your availability by replying to this email at your earliest convenience.

          Thank you for your interest in joining our team. We look forward to speaking with you soon.

          Best regards,
          TaleQ HR Team`,

      html: `<p>Dear <strong>${name}</strong>,</p>
            <p>We are pleased to inform you that you have been shortlisted for an interview with TaleQ.</p>
            <p><strong>Interview Details:</strong><br>${details}</p>
            <p>We kindly request you to confirm your availability by replying to this email at your earliest convenience.</p>
            <p>Thank you for your interest in joining our team. We look forward to speaking with you soon.</p>
            <p>Best regards,<br><strong>TaleQ HR Team</strong></p>`
    };


    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: "Interview notification sent." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: "Failed to send email." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}