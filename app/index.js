import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

function getDatesFrom2020ToToday() {
  const dates = [];
  const startDate = new Date('2025-01-01');
  const today = new Date();

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push({ year, month, day });
  }

  return dates;
}

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

(async () => {
  const downloadBaseDir = './pdfs';
  ensureDirExists(downloadBaseDir);

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: null,
  });

  const page = await browser.newPage();
  const dates = getDatesFrom2020ToToday();

  for (const { year, month, day } of dates) {
    const url = `https://www.boe.es/borme/dias/${year}/${month}/${day}/`;
    const dirPath = path.join(downloadBaseDir, String(year), month, day);
    ensureDirExists(dirPath);

    console.log(`\n📅 Visitando ${url}`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

      const enlaces = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.sumario li.puntoPDF a')).map(a => a.href);
      });

      if (enlaces.length === 0) {
        console.log('⚠️ No hay PDFs en esta fecha.');
        continue;
      }

      console.log(`🔗 ${enlaces.length} enlaces encontrados. Descargando PDFs...`);

      for (let i = 0; i < enlaces.length; i++) {
        const pdfUrl = enlaces[i];
        const fileName = `pdf_${i + 1}.pdf`;
        const filePath = path.join(dirPath, fileName);

        try {
          const res = await fetch(pdfUrl);
          const fileStream = fs.createWriteStream(filePath);
          await new Promise((resolve, reject) => {
            res.body.pipe(fileStream);
            res.body.on('error', reject);
            fileStream.on('finish', resolve);
          });
          console.log(`✅ Guardado: ${year}/${month}/${day}/${fileName}`);
        } catch (err) {
          console.error(`❌ Error al descargar ${pdfUrl}:`, err.message);
        }
      }
    } catch (err) {
      console.error(`⛔ Error al visitar ${url}:`, err.message);
    }

    // Espera de 1 segundo entre días (opcional pero recomendable)
    await new Promise(r => setTimeout(r, 1000));
  }

  await browser.close();
})();
