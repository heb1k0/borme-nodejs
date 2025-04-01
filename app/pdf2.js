import fs from 'fs';
import path from 'path';
import Pdf from 'pdf-parse';

const dirPath = './pdfs';
const pdfFiles = [];

// Busca PDFs en todas las subcarpetas
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

buscarPDFsRecursivo(dirPath);
console.log(`📂 Se encontraron ${pdfFiles.length} PDFs.`);

// Extrae el texto desde un PDF usando pdf-parse
const extraerTextoPDF = async (ruta) => {
  const dataBuffer = fs.readFileSync(ruta);
  const data = await Pdf(dataBuffer);
  return data.text;
};

const parsePDFs = async () => {
  const todasLasEmpresas = [];

  for (const rutaPDF of pdfFiles) {
    console.log(`📄 Procesando: ${rutaPDF}`);
    try {
      const text = await extraerTextoPDF(rutaPDF);
      const bloques = text.split(/\n?(?=\d{3,6}\s+-)/g); // cada empresa empieza con un número y guión

      for (let bloque of bloques) {
        const empresa = {};

        const codigoMatch = bloque.match(/^(\d{3,6})/);
        if (codigoMatch?.[1]) empresa.codigo = codigoMatch[1];

        const nombreMatch = bloque.match(/^\d{3,6}\s-\s([A-ZÑÁÉÍÓÚÜ ,.\-&\(\)]+)/);
        if (nombreMatch?.[1]) empresa.nombre = nombreMatch[1].trim();

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

        const fechaMatch = bloque.match(/\((\d{1,2}\.\d{1,2}\.\d{2,4})\)/);
        if (fechaMatch?.[1]) empresa.fecha_registro = fechaMatch[1];

        const nombramientos = bloque.match(/Nombramientos\.\s*(.*?)(?=Datos registrales|$)/s);
        if (nombramientos) empresa.nombramientos = nombramientos[1].replace(/\n/g, ' ').trim();

        const ceses = bloque.match(/Ceses\/Dimisiones\.\s*(.*?)(?=Datos registrales|$)/s);
        if (ceses) empresa.ceses = ceses[1].replace(/\n/g, ' ').trim();

        const revocaciones = bloque.match(/Revocaciones\.\s*(.*?)(?=Datos registrales|$)/s);
        if (revocaciones) empresa.revocaciones = revocaciones[1].replace(/\n/g, ' ').trim();

        const reelecciones = bloque.match(/Reelecciones\.\s*(.*?)(?=Datos registrales|$)/s);
        if (reelecciones) empresa.reelecciones = reelecciones[1].replace(/\n/g, ' ').trim();

        const disolucion = bloque.match(/Disolución\.\s*(.*?)(?=Datos registrales|$)/s);
        if (disolucion) empresa.disolucion = disolucion[1].replace(/\n/g, ' ').trim();

        const extincion = bloque.match(/Extinción\./);
        if (extincion) empresa.extincion = true;

        const cambioObjeto = bloque.match(/Cambio de objeto social\.\s*(.*?)(?=Datos registrales|$)/s);
        if (cambioObjeto) empresa.cambio_objeto_social = cambioObjeto[1].replace(/\n/g, ' ').trim();

        const datosReg = bloque.match(/Datos registrales\.\s*(.*?)(\(\d{2}\.\d{2}\.\d{2,4}\))/s);
        if (datosReg) {
          empresa.datos_registrales = datosReg[1].trim();
          empresa.fecha_registro = datosReg[2].replace(/[()]/g, '');
        }

        empresa.rutapdf = rutaPDF;

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
