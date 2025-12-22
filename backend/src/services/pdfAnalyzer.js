const pdfParse = require('pdf-parse');

class PDFAnalyzer {
  constructor() {
    this.PAGE_NUMBER_PATTERNS = [
      { pattern: /^(\d+)$/gm },
      { pattern: /^page\s+(\d+)$/gim },
      { pattern: /^Page\s+(\d+)$/gm },
      { pattern: /^(\d+)\s*\/\s*\d+$/gm },
      { pattern: /^\((\d+)\)$/gm },
      { pattern: /^-\s*(\d+)\s*-$/gm },
      { pattern: /^p\.\s*(\d+)$/gim }
    ];

    // STRICT question formats only
    this.QUESTION_PATTERNS = [
      /\bQ\s*(\d+)\b/gi,            // Q1
      /\bQ\.\s*(\d+)\b/gi,          // Q.1
      /\bQ\s+(\d+)\b/gi,            // Q 1
      /\bQuestion\s+(\d+)\b/gi,     // Question 1
      /\bQ\(\s*(\d+)\s*\)/gi        // Q(1)
    ];
  }

  async analyzePDF(fileBuffer, fileName) {
    const data = await pdfParse(fileBuffer);
    const totalPages = data.numpages;
    const fullText = data.text;

    const pageTexts = this.splitIntoPages(fullText, totalPages);

    const results = {
      fileName,
      totalPages,
      printedPageSequence: [],
      pageSummary: []
    };

    for (let i = 0; i < pageTexts.length; i++) {
      const pageText = pageTexts[i];
      const pageIndex = i + 1;

      const printedPage = this.findPrintedPageNumber(pageText);
      const questions = this.findQuestions(pageText);

      results.pageSummary.push({
        printedPage: printedPage ?? pageIndex,
        questionStarts: questions
      });

      if (printedPage !== null) {
        results.printedPageSequence.push(printedPage);
      }
    }

    results.pageSummary = this.calculateQuestionRanges(results.pageSummary);

    if (results.printedPageSequence.length === 0) {
      results.printedPageSequence = Array.from(
        { length: totalPages },
        (_, i) => i + 1
      );
    }

    return results;
  }

  splitIntoPages(text, expectedPages) {
    const lines = text.split('\n');
    const linesPerPage = Math.ceil(lines.length / expectedPages);
    const pages = [];

    for (let i = 0; i < expectedPages; i++) {
      pages.push(
        lines
          .slice(i * linesPerPage, (i + 1) * linesPerPage)
          .join('\n')
      );
    }

    return pages;
  }

  findPrintedPageNumber(text) {
    const lines = text.split('\n');
    const checkLines = [...lines.slice(0, 3), ...lines.slice(-3)];

    for (const line of checkLines) {
      for (const { pattern } of this.PAGE_NUMBER_PATTERNS) {
        const match = pattern.exec(line.trim());
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num)) return num;
        }
      }
    }
    return null;
  }

  findQuestions(text) {
    const questions = new Set();

    for (const pattern of this.QUESTION_PATTERNS) {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(m => {
        const q = parseInt(m[1], 10);
        if (!isNaN(q)) questions.add(q);
      });
    }

    return Array.from(questions).sort((a, b) => a - b);
  }


  calculateQuestionRanges(pageSummary) {
    return pageSummary.map(page => {
      const questions = page.questionStarts;

      let range = null;
      if (questions.length > 0) {
        const min = Math.min(...questions);
        const max = Math.max(...questions);
        range = `${min}-${max}`;
      }

      return {
        printedPage: page.printedPage,
        range,
        questionStarts: questions
      };
    });
  }
}

module.exports = new PDFAnalyzer();
