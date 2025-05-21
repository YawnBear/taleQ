import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body;

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      return NextResponse.json({ message: 'Unsupported content type' }, { status: 415 });
    }

    const { jobPosition, jobDesc, skillSet, remarks } = body;

    if (!jobPosition || !jobDesc || !skillSet) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    let y = 750;

    const lines = [
      `Job Position: ${jobPosition}`,
      '',
      `Job Description:\n${jobDesc}`,
      '',
      `Skill Set:\n${skillSet}`,
      '',
      `Remarks:\n${remarks}`,
    ];

    lines.forEach((line) => {
      const split = line.split('\n');
      split.forEach((l) => {
        page.drawText(l, { x: 50, y, size: fontSize, font, color: rgb(0, 0, 0) });
        y -= 20;
      });
    });

    const pdfBytes = await pdfDoc.save();

    // Return PDF file (as base64 or as Uint8Array for form upload)
    const base64String = Buffer.from(pdfBytes).toString('base64');

    return NextResponse.json({
      message: 'PDF generated successfully',
      base64: base64String,
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
