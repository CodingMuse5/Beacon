import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const SUPPORTED_RESUME_MIME_TYPES = ["application/pdf", DOCX_MIME];

export async function extractResumeText(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  if (mimetype === DOCX_MIME) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(`Unsupported file type: ${mimetype}`);
}
