# 📄 Scraper BORME - Registro Mercantil en PDFs con Node.js

![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![PDF-Parse](https://img.shields.io/badge/pdf--parse-OK-blue)
![Estado](https://img.shields.io/badge/funcional-✅-green)

Este proyecto automatiza la descarga de PDFs desde el sitio web del BORME (Boletín Oficial del Registro Mercantil) y extrae información estructurada de cada empresa publicada.

---

## 🚀 Características

- 📥 Descarga automáticamente todos los PDFs desde el BORME desde 2025 hasta hoy (`npm run start`)
- 🧠 Extrae de los PDFs:
  - Código y nombre de empresa
  - Objeto social
  - Domicilio
  - Capital
  - Socio único
  - Fecha de registro
  - Nombramientos, ceses, revocaciones, reelecciones, disolución, extinción y cambios de objeto social como arrays de objetos

- 📁 Guarda la información en `empresas.json`

---

## 📦 Requisitos

- Node.js 16 o superior
- Dependencias instaladas:

```bash
npm install
```

---

## 🛠 Estructura del proyecto

```
/pdfs               → PDFs descargados organizados por fecha
parse-pdfs.js       → Parser de PDFs a JSON
start-scraper.js    → Scraper de PDFs del BORME
empresas.json       → Salida generada tras ejecutar el parser
```

---

## ▶️ Comandos disponibles

### 🔽 Descargar PDFs del BORME desde 2025 a hoy

```bash
npm run start
```

> Descargará los PDFs de cada día y los guardará en `/pdfs/AÑO/MES/DÍA/`

---

### 📊 Parsear los PDFs descargados

```bash
npm run pdfs
```

> Genera `empresas.json` con toda la información estructurada.

---

## 📚 Ejemplo de salida (`empresas.json`)

```json
{
  "codigo": "712",
  "nombre": "TANATORIO VIRGEN DE LA CANDELARIA Y SAN GREGORIO SOCIEDAD LIMITADA",
  "objeto_social": "Instalación y montajes...",
  "domicilio": "C/ CRUCES, 32 02600 (VILLARROBLEDO)",
  "capital": "10.000,00",
  "socio_unico": "JUAN PÉREZ",
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
```

---

## 🤝 Contribuciones

¡Eres bienvenido a abrir issues, pull requests o mejoras para adaptar el scraping a nuevas estructuras del BORME!

---

## 📝 Licencia

MIT © [heb1k0](https://github.com/heb1k0)

---
