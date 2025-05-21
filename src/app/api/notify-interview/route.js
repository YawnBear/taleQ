import nodemailer from "nodemailer";

export async function POST(request) {
    try {
        const { email, name, details, subject } = await request.json();

        if (!email || !name || !details || !subject) {
            return new Response(JSON.stringify({ 
                error: "Email, name, subject and details are required."
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
            subject: subject,
            replyTo: "taleq.app@gmail.com",
            text: `Dear ${name},\n\n${details}\n\nBest regards,\nTaleQ HR Team`,
            html: `<p>Dear <strong>${name}</strong>,</p>
                   <p>${details.replace(/\n/g, '<br>')}</p>
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