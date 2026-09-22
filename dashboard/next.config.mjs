/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // gray-matter ya estaba. pdfjs-dist (build legacy, tiene ramas de código específicas
    // para Node) y @napi-rs/canvas (trae un binario .node precompilado por plataforma) se
    // agregan acá por la MISMA razón: si Next los empaqueta con webpack en vez de dejarlos
    // como require() normal en tiempo de ejecución, ese binario nativo se rompe -- y como
    // la ruta de API entera falla al cargarse (no al recibir el POST), Next devuelve su
    // página de error 500 en HTML en vez de JSON. Eso es lo que producía el
    // "Unexpected token '<'" en el botón Subir PDF: el fetch del navegador intentaba hacer
    // res.json() sobre HTML. No era un bug del endpoint en sí, era que nunca llegaba a
    // ejecutarse.
    serverComponentsExternalPackages: ["gray-matter", "pdfjs-dist", "@napi-rs/canvas"],
  },
};

export default nextConfig;
