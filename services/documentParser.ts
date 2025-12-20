import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export interface ParsedDocument {
  content: string;
  metadata: Record<string, any>;
}

export const parseFile = async (file: File): Promise<ParsedDocument> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return parsePDF(file);
    case 'docx':
      return parseDOCX(file);
    case 'xlsx':
    case 'xls':
      return parseExcel(file);
    case 'txt':
    case 'md':
    case 'js':
    case 'ts':
    case 'json':
      return parseText(file);
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
};

const parseText = async (file: File): Promise<ParsedDocument> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ content: reader.result as string, metadata: {} });
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const parsePDF = async (file: File): Promise<ParsedDocument> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    text += strings.join(' ') + '\n\n';
  }

  return { content: text, metadata: { pages: pdf.numPages } };
};

const parseDOCX = async (file: File): Promise<ParsedDocument> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return { content: result.value, metadata: {} };
};

const parseExcel = async (file: File): Promise<ParsedDocument> => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  let text = '';

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    text += `--- Sheet: ${sheetName} ---\n`;
    text += XLSX.utils.sheet_to_csv(sheet) + '\n\n';
  });

  return { content: text, metadata: { sheets: workbook.SheetNames } };
};
