import { IncomingForm } from 'formidable';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { file as tmpFile } from 'tmp-promise';

const execAsync = promisify(exec);

// Disable Next.js default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// API Route to handle file uploads and convert to PDF
export async function POST(request: Request) {
  try {
    // Parse the incoming form data
    const { files } = await new Promise((resolve, reject) => {
      const form = new IncomingForm();
      form.parse(request, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const file = files.file; // Extract the file from FormData

    // Create a temporary file in memory
    const { path: tempFilePath, cleanup } = await tmpFile({ postfix: file.originalFilename });

    // Read the file buffer and write it to the temporary file
    const fileBuffer = fs.readFileSync(file.filepath);  // `filepath` is provided by `formidable` for uploaded files
    await fs.promises.writeFile(tempFilePath, fileBuffer);

    // Convert the temporary file to PDF using LibreOffice
    const outputPdfPath = tempFilePath.replace(/\.\w+$/, '.pdf');
    await execAsync(`libreoffice --headless --convert-to pdf --outdir /tmp ${tempFilePath}`);

    // Read the PDF file back as a buffer
    const pdfBuffer = await fs.promises.readFile(outputPdfPath);

    // Cleanup the temporary files
    await cleanup();

    // Return the PDF as a response
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${file.originalFilename.replace(/\.\w+$/, '.pdf')}"`,
      },
    });
  } catch (error) {
    console.error('Error during file conversion:', error);
    return new Response(JSON.stringify({ error: 'File conversion failed' }), {
      status: 500,
    });
  }
}