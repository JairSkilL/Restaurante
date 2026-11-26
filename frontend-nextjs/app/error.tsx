'use client';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="panel">
      <h1>No pudimos cargar la página</h1>
      <p>Comprueba que el servidor esté disponible e inténtalo otra vez.</p>
      <button type="button" onClick={() => { reset(); window.location.reload(); }}>
        Reintentar
      </button>
    </div>
  );
}
