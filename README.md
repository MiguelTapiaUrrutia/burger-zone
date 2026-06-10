# Burger Zone

Sitio web de una hamburguesería artesanal de Concepción con **carta dinámica**: los productos viven en un archivo JSON y se renderizan en la página con JavaScript, sin necesidad de tocar el HTML para actualizar el menú.

## Tecnologías

- HTML5 semántico
- CSS3 (custom properties / design tokens)
- JavaScript vanilla (Fetch API, async/await)
- JSON como fuente de datos de la carta

## Estructura

```
burger-zone/
├── index.html        # Página principal
├── css/styles.css    # Tokens de diseño y estilos
├── js/app.js         # Carga y renderizado de la carta
├── data/menu.json    # Productos del menú
└── img/              # Imágenes (pendiente)
```

## Cómo ejecutar

La carta se carga con `fetch`, así que el sitio necesita un servidor local (no funciona abriendo el archivo directamente):

```bash
npx serve .
# o
python -m http.server 8000
```

## Estado

🚧 **En desarrollo** — estructura inicial, carga de datos y tokens de diseño. Pendiente: renderizado de la carta, filtros por categoría y estilos.
