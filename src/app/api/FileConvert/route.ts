// app/api/convert/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

// Custom error types
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

const execAsync = promisify(exec);
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

async function convertToPdf(inputPath: string, outputDir: string): Promise<void> {
  try {
    const command = `libreoffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.error('Conversion stderr:', stderr);
    }
    console.log('Conversion output:', stdout);
  } catch (err) {
    throw new ConversionError(
      'PDF conversion failed',
      err instanceof Error ? err : undefined
    );
  }
}

async function cleanupFiles(files: string[]): Promise<void> {
  await Promise.all(
    files.map(file =>
      unlink(file).catch(err => {
        console.error(`Failed to delete file ${file}:`, err);
      })
    )
  );
}

export async function POST(req: NextRequest) {
  let inputPath = '';
  let outputPath = '';

  try {
    await ensureUploadDirectory();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      throw new ValidationError('No file provided');
    }

    const uniqueId = uuidv4();
    const originalExtension = path.extname(file.name);
    const inputFileName = `${uniqueId}${originalExtension}`;
    const outputFileName = `${uniqueId}.pdf`;
    
    inputPath = path.join(UPLOAD_DIR, inputFileName);
    outputPath = path.join(UPLOAD_DIR, outputFileName);

    // Write input file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer).catch(err => {
      throw new FileSystemError(
        'Failed to write input file',
        err instanceof Error ? err : undefined
      );
    });

    // Convert to PDF
    await convertToPdf(inputPath, UPLOAD_DIR);

    // Verify output file exists
    if (!existsSync(outputPath)) {
      throw new ConversionError('PDF file was not created');
    }

    // Read the generated PDF
    const pdfBuffer = await readFile(outputPath).catch(err => {
      throw new FileSystemError(
        'Failed to read converted PDF',
        err instanceof Error ? err : undefined
      );
    });

    // Clean up files
    await cleanupFiles([inputPath, outputPath]);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${file.name.replace(originalExtension, '.pdf')}"`,
      },
    });

  } catch (err) {
    // Clean up files if they exist
    if (inputPath || outputPath) {
      await cleanupFiles([inputPath, outputPath]);
    }

    // Handle different types of errors
    if (err instanceof ValidationError) {
      return NextResponse.json(
        { error: err.message },
        { status: 400 }
      );
    }

    if (err instanceof ConversionError) {
      console.error('Conversion error:', err);
      return NextResponse.json(
        { error: err.message },
        { status: 500 }
      );
    }

    if (err instanceof FileSystemError) {
      console.error('File system error:', err);
      return NextResponse.json(
        { error: err.message },
        { status: 500 }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}