const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extractText(file) {
  try {
    if (file.mimetype === 'application/pdf') {
      const data = await pdfParse(file.buffer);
      return data.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    throw new Error(`Error extracting text: ${error.message}`);
  }
}

module.exports = { extractText };