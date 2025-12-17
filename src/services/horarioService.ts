// src/services/horarioService.ts
import { Filesystem, Directory } from '@capacitor/filesystem';

const STORAGE_KEY = 'exomind_horario_db';

// Horario por defecto (Para que la app no empiece vacía)
const DEFAULT_HORARIO = {
  "1": { // Lunes
    "07": "Cálculo Diferencial",
    "08": "Cálculo Diferencial",
    "09": "Programación Lógica",
    "10": "Programación Lógica"
  },
  "2": { // Martes
    "07": "Redes Neuronales",
    "08": "Redes Neuronales",
    "10": "Inglés Técnico"
  },
  "3": { "08": "Álgebra Lineal" }, // Miércoles
  "4": { "08": "Robótica" },       // Jueves
  "5": { "09": "Seminario de IA" } // Viernes
};

export const HorarioService = {


  // Leer de la memoria
  obtener() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_HORARIO;
  },

  // La lógica inteligente: Dime qué hora es y te digo qué materia toca
  detectarMateriaActual(): string {
    const data = this.obtener();
    const ahora = new Date();
    
    const dia = ahora.getDay().toString(); // 1 = Lunes, 2 = Martes...
    const hora = ahora.getHours().toString().padStart(2, '0'); // "08", "09"...

    // Buscamos en el JSON
    if (data[dia] && data[dia][hora]) {
      return data[dia][hora];
    } else {
      return "General / Sin Clase";
    }
  },

  // Guardar en la memoria del teléfono
async guardar(json: any) {
    // 1. Guardar en memoria interna (para que la app sepa)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
    
    // 2. CREAR CARPETAS FÍSICAS
    await this.crearCarpetasReales(json);
  },

  async crearCarpetasReales(horario: any) {
    try {
      // Recorremos el JSON para sacar nombres únicos de materias
      const materias = new Set<string>();
      Object.values(horario).forEach((dia: any) => {
        Object.values(dia).forEach((materia: any) => {
          if (typeof materia === 'string') materias.add(materia);
          else if (materia.nombre) materias.add(materia.nombre);
        });
      });

      // Creamos cada carpeta en "Documentos/ExoMind"
      for (const materia of materias) {
        await Filesystem.mkdir({
          path: `app/${materia}`,
          directory: Directory.Documents,
          recursive: true // Crea "ExoMind" si no existe
        });
        console.log(`Carpeta creada: app/${materia}`);
      }
    } catch (e) {
      console.error("No se pudieron crear las carpetas físicas (¿Estás en web?)", e);
    }
  }
};