import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { email, details } = await request.json();

    if (!email || !details) {
      return new Response(JSON.stringify({ error: "Email and interview details are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "taleq.app@gmail.com",
        pass: "taleq@9999",
      },
    });

    const mailOptions = {
      from: "taleq.app@gmail.com",
      to: email,
      subject: "Interview Invitation from taleQ",
      html: `<p>Congratulations! You have been shortlisted for an interview.<br>
             <b>Details:</b> ${details}<br>
             Please reply to this email to confirm your availability.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: "Interview notification sent." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to send email." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}