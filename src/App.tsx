import { useEffect, useState } from "react";
import "./index.css";

type Propiedad = {
public_id: string;
title: string;
title_image_full: string;
location: string;
property_type: string;
lot_size: number | null;
construction_size: number | null;
operations: {
type: string;
amount: number;
currency: string;
formatted_amount: string;
}[];
};

type RespuestaAPI = {
pagination: {
page: number;
limit: number;
total: number;
};
cantidad: number;
propiedades: Propiedad[];
};

export default function App() {
const [datos, setDatos] = useState<RespuestaAPI | null>(null);
const [pagina, setPagina] = useState(1);
const [cargando, setCargando] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
const controller = new AbortController();

async function cargarPropiedades() {
  setCargando(true);
  setError("");

  try {
    const response = await fetch(
      `http://localhost:3055/api/properties?page=${pagina}&limit=3`,
      { signal: controller.signal },
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const resultado: RespuestaAPI = await response.json();
    setDatos(resultado);
  } catch (err) {
    if (err instanceof Error && err.name !== "AbortError") {
      setError(err.message);
    }
  } finally {
    if (!controller.signal.aborted) {
      setCargando(false);
    }
  }
}

cargarPropiedades();

return () => controller.abort();

}, [pagina]);

function formatoPrecio(propiedad: Propiedad) {
const operacion = propiedad.operations?.[0];
return operacion?.formatted_amount ?? "Consultar precio";
}

return (
<main className="min-h-screen bg-stone-50 text-stone-900">
<header className="border-b border-stone-200 bg-white">
<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
<a href="/" className="text-2xl font-bold tracking-tight">
INMO<span className="text-amber-700">EB</span>
</a>
<span className="text-sm text-stone-600">
Encuentra tu próximo espacio
</span>
</div>
</header>

  <section className="bg-stone-900 px-6 py-20 text-white md:py-28">
    <div className="mx-auto max-w-7xl">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-amber-400">
        Propiedades seleccionadas
      </p>

      <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
        Encuentra el lugar donde comienza tu próxima historia.
      </h1>

      <p className="mt-6 max-w-xl text-lg text-stone-300">
        Explora terrenos y propiedades en Yucatán y descubre nuevas
        oportunidades.
      </p>

      <a
        href="#propiedades"
        className="mt-8 inline-block rounded-md bg-amber-600 px-6 py-3 font-semibold text-white transition hover:bg-amber-700"
      >
        Ver propiedades
      </a>
    </div>
  </section>

  <section
    id="propiedades"
    className="mx-auto max-w-7xl px-6 py-16"
  >
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">
          Catálogo
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          Propiedades disponibles
        </h2>

        <p className="mt-2 text-stone-600">
          {datos
            ? `${datos.pagination.total} propiedades en total`
            : "Consultando catálogo"}
        </p>
      </div>

      <span className="text-sm text-stone-500">
        Página {pagina}
      </span>
    </div>

    {cargando && (
      <p className="py-12 text-center">
        Cargando propiedades...
      </p>
    )}

    {error && (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        <p>No se pudieron cargar las propiedades.</p>
        <p className="mt-2 text-sm">{error}</p>
        <button
          onClick={() => setPagina((actual) => actual)}
          className="mt-4 rounded-md bg-red-700 px-4 py-2 text-white"
        >
          Reintentar
        </button>
      </div>
    )}

    {!cargando && !error && datos && (
      <>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {datos.propiedades.map((propiedad) => (
            <article
              key={propiedad.public_id}
              className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-[4/3] overflow-hidden bg-stone-200">
                {propiedad.title_image_full ? (
                  <img
                    src={propiedad.title_image_full}
                    alt={propiedad.title}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-500">
                    Sin imagen disponible
                  </div>
                )}
              </div>

              <div className="p-5">
                <p className="text-sm font-medium text-amber-700">
                  {propiedad.property_type}
                </p>

                <h3 className="mt-2 line-clamp-2 text-lg font-bold">
                  {propiedad.title}
                </h3>

                <p className="mt-2 text-sm text-stone-600">
                  {propiedad.location}
                </p>

                <p className="mt-4 text-xl font-bold">
                  {formatoPrecio(propiedad)}
                </p>

                <div className="mt-4 flex flex-wrap gap-4 border-t border-stone-100 pt-4 text-sm text-stone-600">
                  {propiedad.lot_size != null && (
                    <span>Terreno: {propiedad.lot_size} m²</span>
                  )}

                  {propiedad.construction_size != null && (
                    <span>
                      Construcción: {propiedad.construction_size} m²
                    </span>
                  )}
                </div>

                <p className="mt-4 text-xs text-stone-400">
                  Clave: {propiedad.public_id}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            onClick={() => setPagina((actual) => Math.max(1, actual - 1))}
            disabled={pagina === 1}
            className="rounded-md border border-stone-300 px-5 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>

          <span className="text-sm text-stone-600">
            {datos.cantidad} propiedades mostradas
          </span>

          <button
            onClick={() => setPagina((actual) => actual + 1)}
            disabled={
              pagina * datos.pagination.limit >= datos.pagination.total
            }
            className="rounded-md bg-stone-900 px-5 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </>
    )}
  </section>

  <footer className="border-t border-stone-200 bg-white px-6 py-8 text-center text-sm text-stone-500">
    Catálogo inmobiliario · Datos proporcionados por EasyBroker
  </footer>
</main>

);
}