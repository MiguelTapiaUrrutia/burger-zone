const RUTA_MENU = 'data/menu.json';
const CATEGORIA_TODAS = 'todas';

const contenedorCarta = document.querySelector('#contenedor-carta');
const contenedorFiltros = document.querySelector('#filtros');

// Estado del módulo: los productos se cargan una sola vez y los filtros
// operan sobre esta copia en memoria, sin volver a la red.
let productosCargados = [];
let categoriaActiva = CATEGORIA_TODAS;

const formateadorCLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
});

function formatearPrecio(precio) {
  return formateadorCLP.format(precio);
}

function renderizarCarta(productos) {
  if (productos.length === 0) {
    contenedorCarta.innerHTML =
      '<p class="mensaje-vacio">Por ahora no tenemos productos en esta categoría. ¡Vuelve pronto!</p>';
    return;
  }

  const tarjetas = productos
    .map((producto) => {
      const claseAgotado = producto.disponible ? '' : ' agotado';
      const badgeAgotado = producto.disponible
        ? ''
        : '<span class="badge badge-agotado">Agotado</span>';

      return `
        <article class="tarjeta${claseAgotado}">
          <div class="tarjeta-badges">
            <span class="badge badge-categoria">${producto.categoria}</span>
            ${badgeAgotado}
          </div>
          <h3 class="tarjeta-nombre">${producto.nombre}</h3>
          <p class="tarjeta-descripcion">${producto.descripcion}</p>
          <p class="tarjeta-precio">${formatearPrecio(producto.precio)}</p>
        </article>
      `;
    })
    .join('');

  contenedorCarta.innerHTML = tarjetas;
}

function renderizarFiltros(productos) {
  const categoriasUnicas = [...new Set(productos.map((p) => p.categoria))];
  const categorias = [CATEGORIA_TODAS, ...categoriasUnicas];

  contenedorFiltros.innerHTML = categorias
    .map(
      (categoria) => `
        <button type="button" class="filtro" data-categoria="${categoria}">
          ${categoria}
        </button>
      `
    )
    .join('');

  actualizarBotones();
}

function actualizarBotones() {
  const botones = contenedorFiltros.querySelectorAll('button');

  botones.forEach((boton) => {
    const esActivo = boton.dataset.categoria === categoriaActiva;
    boton.classList.toggle('activo', esActivo);
    boton.setAttribute('aria-pressed', String(esActivo));
  });
}

function filtrarProductos() {
  if (categoriaActiva === CATEGORIA_TODAS) {
    return productosCargados;
  }
  return productosCargados.filter((p) => p.categoria === categoriaActiva);
}

contenedorFiltros.addEventListener('click', (event) => {
  const boton = event.target.closest('button');

  if (!boton) {
    return; // el clic cayó en el contenedor, no en un botón
  }

  categoriaActiva = boton.dataset.categoria;
  actualizarBotones();
  renderizarCarta(filtrarProductos());
});

async function cargarMenu() {
  try {
    const respuesta = await fetch(RUTA_MENU);

    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status} al pedir ${RUTA_MENU}`);
    }

    const datos = await respuesta.json();
    productosCargados = datos.productos;

    renderizarFiltros(productosCargados);
    renderizarCarta(productosCargados);
  } catch (error) {
    console.error('No se pudo cargar el menú:', error);
    contenedorCarta.innerHTML =
      '<p class="mensaje-error">No pudimos cargar la carta. Intenta recargar la página en unos minutos.</p>';
  }
}

cargarMenu();
