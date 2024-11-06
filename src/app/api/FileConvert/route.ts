import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';

class ConversionError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'ConversionError';
  }
}

class FileSystemError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'FileSystemError';
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

const UPLOAD_DIR = '/tmp/convert';

async function ensureUploadDirectory(): Promise<void> {
  if (!existsSync(UPLOAD_DIR)) {
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (err) {
      throw new FileSystemError(
        'Failed to create upload directory',
        err instanceof Error ? err : undefined
      );
    }
  }
}

async function convertDocxToPdf(inputPath: string, outputPath: string): Promise<void> {
  try {
    // Convert .docx to HTML
    const { value: htmlContent } = await mammoth.convertToHtml({ path: inputPath });


    console.log(htmlContent);
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText(htmlContent);

    // Save the PDF to the output path
    const pdfBytes = await pdfDoc.save();
    await writeFile(outputPath, pdfBytes);
  } catch (err) {
    throw new ConversionError(
      'Failed to convert DOCX to PDF',
      err instanceof Error ? err : undefined
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  await ensureUploadDirectory();

  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    throw new ValidationError('No file uploaded');
  }

  const fileId = uuidv4();
  const inputPath = path.join(UPLOAD_DIR, `${fileId}.docx`);
  const outputPath = path.join(UPLOAD_DIR, `${fileId}.pdf`);

  try {
    // Save the uploaded file to the input path
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, fileBuffer);

    // Convert the DOCX file to PDF
    await convertDocxToPdf(inputPath, outputPath);

    // Read the converted PDF file
    const pdfBuffer = await readFile(outputPath);

    // Return the PDF file as a response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileId}.pdf"`,
      },
    });
  } catch (err) {
    throw new FileSystemError(
      'Failed to process the file',
      err instanceof Error ? err : undefined
    );
  } finally {
    // Clean up the temporary files
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
  }
}