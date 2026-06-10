const RUTA_MENU = 'data/menu.json';

const contenedorCarta = document.querySelector('#contenedor-carta');

const formateadorCLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
});

function formatearPrecio(precio) {
  return formateadorCLP.format(precio);
}

function renderizarCarta(productos) {
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

async function cargarMenu() {
  try {
    const respuesta = await fetch(RUTA_MENU);

    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status} al pedir ${RUTA_MENU}`);
    }

    const datos = await respuesta.json();
    renderizarCarta(datos.productos);
  } catch (error) {
    console.error('No se pudo cargar el menú:', error);
    contenedorCarta.innerHTML =
      '<p class="mensaje-error">No pudimos cargar la carta. Intenta recargar la página en unos minutos.</p>';
  }
}

cargarMenu();
