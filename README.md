📄 Scraper BORME - Registro Mercantil en PDFs

Extrae automáticamente información estructurada de empresas a partir de PDFs del Boletín Oficial del Registro Mercantil (BORME), incluso en carpetas anidadas.

✨ ¿Qué hace este proyecto?

Este scraper:

✅ Recorre carpetas (y subcarpetas) buscando archivos `.pdf`  
✅ Usa `pdf-parse` para extraer texto desde los PDFs  
✅ Detecta empresas publicadas en el BORME  
✅ Extrae información relevante como:

- Código
- Nombre de la empresa
- Objeto social
- Domicilio
- Capital
- Socio único
- Fecha de registro
- Nombramientos, Ceses, Revocaciones, Reelecciones, Disolución, Extinción, etc. como arrays de objetos

✅ Guarda todo en un archivo `empresas.json` 📁

⚙️ Instalación

git clone https://github.com/tu-usuario/scraper-borme.git
cd scraper-borme
npm install

▶️ Uso

1. Coloca tus PDFs dentro de la carpeta `pdfs/` (puedes usar subcarpetas).
2. Ejecuta el script:

node parse-pdfs.js

3. Revisa el resultado en:

empresas.json

📦 Estructura de salida

{
  "codigo": "712",
  "nombre": "TANATORIO VIRGEN DE LA CANDELARIA Y SAN GREGORIO SOCIEDAD LIMITADA",
  "objeto_social": "...",
  "domicilio": "...",
  "capital": "10.000,00",
  "socio_unico": "...",
  "fecha_registro": "24.12.24",
  "nombramientos": [
    { "cargo": "Consejero", "persona": "FULANITO PÉREZ" },
    { "cargo": "Presidente", "persona": "MENGANITO LÓPEZ" }
  ],
  "ceses": [...],
  "revocaciones": [...],
  "reelecciones": [...],
  "disolucion": "...",
  "extincion": true,
  "cambio_objeto_social": "...",
  "datos_registrales": "S 8 , H AB 12345, I/A 7"
}

🧠 Requisitos

- Node.js 16 o superior
- PDF legibles por `pdf-parse` (no escaneados)
- Archivos `.pdf` con estructura tipo BORME

🤝 Contribuciones

¡Se aceptan contribuciones! Puedes:

- Mejorar el reconocimiento de campos
- Añadir compatibilidad con más formatos del BORME
- Exportar a CSV o base de datos

📝 Licencia

MIT © 2025 - Tu nombre o usuario GitHub
