const RUTA_MENU = 'data/menu.json';
const CATEGORIA_TODAS = 'todas';

const contenedorCarta = document.querySelector('#contenedor-carta');
const contenedorFiltros = document.querySelector('#filtros');
const inputBuscador = document.querySelector('#buscador');
const contadorResultados = document.querySelector('#contador-resultados');

// Estado del módulo: los productos se cargan una sola vez y todo lo demás
// (filtros, búsqueda, contador) se deriva de estas tres variables.
let productosCargados = [];
let categoriaActiva = CATEGORIA_TODAS;
let textoBusqueda = '';

const formateadorCLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
});

function formatearPrecio(precio) {
  return formateadorCLP.format(precio);
}

// Minúsculas y sin tildes, para comparar "jengibre" con "Jengibre" o "menta" con "Mentá"
function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function obtenerProductosVisibles() {
  const busqueda = normalizarTexto(textoBusqueda.trim());

  return productosCargados
    .filter(
      (producto) =>
        categoriaActiva === CATEGORIA_TODAS ||
        producto.categoria === categoriaActiva
    )
    .filter((producto) => {
      if (busqueda === '') {
        return true;
      }
      return (
        normalizarTexto(producto.nombre).includes(busqueda) ||
        normalizarTexto(producto.descripcion).includes(busqueda)
      );
    });
}

function renderizarCarta(productos) {
  if (productos.length === 0) {
    contenedorCarta.innerHTML = `
      <div class="mensaje-vacio">
        <p>No encontramos nada con esos criterios.</p>
        <button type="button" id="limpiar-busqueda">Limpiar búsqueda</button>
      </div>
    `;
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
}

function actualizarBotones() {
  const botones = contenedorFiltros.querySelectorAll('button');

  botones.forEach((boton) => {
    const esActivo = boton.dataset.categoria === categoriaActiva;
    boton.classList.toggle('activo', esActivo);
    boton.setAttribute('aria-pressed', String(esActivo));
  });
}

function actualizarContador(visibles) {
  contadorResultados.textContent = `Mostrando ${visibles} de ${productosCargados.length} productos`;
}

// Único camino de render: todo cambio de estado termina aquí.
function render() {
  const visibles = obtenerProductosVisibles();
  actualizarBotones();
  actualizarContador(visibles.length);
  renderizarCarta(visibles);
}

function limpiarBusqueda() {
  categoriaActiva = CATEGORIA_TODAS;
  textoBusqueda = '';
  inputBuscador.value = '';
  render();
}

contenedorFiltros.addEventListener('click', (event) => {
  const boton = event.target.closest('button');

  if (!boton) {
    return; // el clic cayó en el contenedor, no en un botón
  }

  categoriaActiva = boton.dataset.categoria;
  render();
});

inputBuscador.addEventListener('input', () => {
  textoBusqueda = inputBuscador.value;
  render();
});

// Delegación: el botón "Limpiar búsqueda" se crea y destruye con cada render,
// pero el contenedor es permanente.
contenedorCarta.addEventListener('click', (event) => {
  if (event.target.closest('#limpiar-busqueda')) {
    limpiarBusqueda();
  }
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
    render();
  } catch (error) {
    console.error('No se pudo cargar el menú:', error);
    contenedorCarta.innerHTML =
      '<p class="mensaje-error">No pudimos cargar la carta. Intenta recargar la página en unos minutos.</p>';
  }
}

cargarMenu();
