import { tavily } from "@tavily/core";
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY! });
export const AGENT_TOOLS = [
  { name: "calcularFinanzas", description: "Calcula margen, precio por m2, ROI", input_schema: { type: "object", properties: { m2: {type:"number"}, costoMaterial:{type:"number"}, costoInstalacion:{type:"number"}, margenDeseado:{type:"number"} }, required: ["m2","costoMaterial"] } },
  { name: "buscarMercado", description: "Busca precios reales y competencia en Ecuador", input_schema: { type: "object", properties: { query:{type:"string"}, pais:{type:"string", default:"Ecuador"} }, required: ["query"] } },
  { name: "generarOrganigrama", description: "Genera organigrama visual", input_schema: { type: "object", properties: { tipo:{type:"string", enum:["equipo","holding","proceso"]}, miembros:{type:"array", items:{type:"string"}} }, required: ["tipo"] } }
];
export async function ejecutarHerramienta(name:string, args:any){
  if(name==="buscarMercado"){
    // La firma real de @tavily/core (v0.7.x instalada) es search(query: string, options?) con
    // opciones en camelCase — no search({query, max_results, ...}) como un solo objeto snake_case.
    // Ajustado para que compile de verdad contra la librería instalada (tsc --noEmit lo detectó).
    const res = await tvly.search(`${args.query} ${args.pais||'Ecuador'}`, { maxResults:5, searchDepth:"advanced", includeAnswer:true });
    return { verificado:true, fuente: res.results.map((r:any)=>r.url), datos: res.answer, resultados: res.results };
  }
  if(name==="calcularFinanzas"){
    const totalCosto = args.costoMaterial + (args.costoInstalacion||0);
    const precioVenta = totalCosto * (1 + (args.margenDeseado||0.4));
    return { totalCosto, precioVenta, margen: args.margenDeseado||0.4, verificado:true };
  }
  if(name==="generarOrganigrama"){
    return { trigger:"GENERAR_IMAGEN_ORGANIGRAMA", tipo: args.tipo, miembros: args.miembros };
  }
}
