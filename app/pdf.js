import fs from 'fs';
import path from 'path';
import Pdf from 'pdf-parse';

const dirPath = './pdfs';
const pdfFiles = [];

// Recorrer todas las carpetas
const buscarPDFsRecursivo = (carpeta) => {
  const elementos = fs.readdirSync(carpeta, { withFileTypes: true });

  for (const elemento of elementos) {
    const rutaCompleta = path.join(carpeta, elemento.name);
    if (elemento.isDirectory()) {
      buscarPDFsRecursivo(rutaCompleta);
    } else if (elemento.isFile() && elemento.name.endsWith('.pdf')) {
      pdfFiles.push(rutaCompleta);
    }
  }
};

// Parsear cargos tipo "Presidente: Fulanito;Menganito"
const parseCampoConCargos = (texto) => {
  const resultados = [];
  const matches = texto.matchAll(/([A-Za-z.ñÑÁÉÍÓÚÜ ]+):\s*([A-ZÑÁÉÍÓÚÜ ,.\-&\(\);]+)/g);

  for (const match of matches) {
    const cargo = match[1].trim().replace(/\.+$/, '');
    const personas = match[2].split(';').map(p => p.trim()).filter(Boolean);
    for (const persona of personas) {
      resultados.push({ cargo, persona });
    }
  }
  return resultados;
};

buscarPDFsRecursivo(dirPath);
console.log(`📂 Se encontraron ${pdfFiles.length} PDFs.`);

// Extraer texto del PDF
const extraerTextoPDF = async (ruta) => {
  const dataBuffer = fs.readFileSync(ruta);
  const data = await Pdf(dataBuffer);
  return data.text;
};

// Procesar todos los PDFs
const parsePDFs = async () => {
  const todasLasEmpresas = [];

  for (const rutaPDF of pdfFiles) {
    console.log(`📄 Procesando: ${rutaPDF}`);
    try {
      const text = await extraerTextoPDF(rutaPDF);
      const bloques = text.split(/\n?(?=\d{3,6}\s+-)/g);

      for (let bloque of bloques) {
        const empresa = {};

        const codigo = bloque.match(/^(\d{3,6})/);
        if (codigo) empresa.codigo = codigo[1];

        const nombre = bloque.match(/^\d{3,6}\s-\s(.+?)\./);
        if (nombre) empresa.nombre = nombre[1].trim();

        const objeto = bloque.match(/Objeto social:\s*(.*?)(?=\. [A-Z]|Domicilio:|Capital:|Datos registrales|Nombramientos|$)/s);
        if (objeto) empresa.objeto_social = objeto[1].replace(/\n/g, ' ').trim();

        const domicilio = bloque.match(/Domicilio:\s*(.*?)(?=Capital:|Datos registrales|Nombramientos|$)/s);
        if (domicilio) empresa.domicilio = domicilio[1].replace(/\n/g, ' ').trim();

        const capital = bloque.match(/Capital:\s*([0-9.,]+)\s*Euros/);
        if (capital) empresa.capital = capital[1];

        const capitalAltMatch = bloque.match(/capital.*?([0-9.,]+)\s*Euro/i);
        if (!empresa.capital && capitalAltMatch?.[1]) empresa.capital = capitalAltMatch[1].trim();

        const socioUnico = bloque.match(/Socio único:\s*(.*?)(?=\n|Nombramientos|Capital|$)/);
        if (socioUnico) empresa.socio_unico = socioUnico[1].trim();

        const fecha = bloque.match(/\((\d{1,2}\.\d{1,2}\.\d{2,4})\)/);
        if (fecha) empresa.fecha_registro = fecha[1];

        // Extraer secciones estructuradas
        const nombramientos = bloque.match(/Nombramientos\.\s*(.*?)(?=\n[A-Z]|Datos registrales|$)/s);
        if (nombramientos) empresa.nombramientos = parseCampoConCargos(nombramientos[1]);

        const ceses = bloque.match(/Ceses\/Dimisiones\.\s*(.*?)(?=\n[A-Z]|Datos registrales|$)/s);
        if (ceses) empresa.ceses = parseCampoConCargos(ceses[1]);

        const revocaciones = bloque.match(/Revocaciones\.\s*(.*?)(?=\n[A-Z]|Datos registrales|$)/s);
        if (revocaciones) empresa.revocaciones = parseCampoConCargos(revocaciones[1]);

        const reelecciones = bloque.match(/Reelecciones\.\s*(.*?)(?=\n[A-Z]|Datos registrales|$)/s);
        if (reelecciones) empresa.reelecciones = parseCampoConCargos(reelecciones[1]);

        const disolucion = bloque.match(/Disolución\.\s*(.*?)(?=\n[A-Z]|Datos registrales|$)/s);
        if (disolucion) empresa.disolucion = disolucion[1].replace(/\n/g, ' ').trim();

        if (/Extinción\./.test(bloque)) {
          empresa.extincion = true;
        }

        const cambioObjeto = bloque.match(/Cambio de objeto social\.\s*(.*?)(?=Datos registrales|$)/s);
        if (cambioObjeto) empresa.cambio_objeto_social = cambioObjeto[1].replace(/\n/g, ' ').trim();

        const datosReg = bloque.match(/Datos registrales\.\s*(.*?)(\(\d{2}\.\d{2}\.\d{2,4}\))/s);
        if (datosReg) {
          empresa.datos_registrales = datosReg[1].trim();
          empresa.fecha_registro = datosReg[2].replace(/[()]/g, '');
        }

        if (empresa.codigo && empresa.nombre) {
          todasLasEmpresas.push(empresa);
        }
      }
    } catch (err) {
      console.error(`❌ Error procesando ${rutaPDF}: ${err.message}`);
    }
  }

  console.log(`✅ Total de empresas encontradas: ${todasLasEmpresas.length}`);
  fs.writeFileSync('empresas.json', JSON.stringify(todasLasEmpresas, null, 2));
};

parsePDFs();
