<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="dark">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Configuración</ion-title>
        
        <ion-buttons slot="end">
            <ion-button color="danger" @click="borrarTodo">
                <ion-icon slot="icon-only" :icon="trashBinOutline"></ion-icon>
            </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      
      <ion-card>
        <ion-card-header>
          <ion-card-title>Añadir Clase</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-input label="Materia" label-placement="stacked" placeholder="Ej: Cálculo" v-model="nuevaMateria.nombre"></ion-input>
          </ion-item>
          <ion-item>
            <ion-select label="Día" label-placement="stacked" v-model="nuevaMateria.dia">
              <ion-select-option v-for="(dia, index) in diasSemana" :key="index" :value="String(index + 1)">{{ dia }}</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-select label="Inicio" label-placement="stacked" v-model="nuevaMateria.horaInicio">
              <ion-select-option v-for="h in horas" :key="h" :value="h">{{ h }}</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-select label="Fin" label-placement="stacked" v-model="nuevaMateria.horaFin">
              <ion-select-option v-for="h in horasFin" :key="h" :value="h">{{ h }}</ion-select-option>
            </ion-select>
          </ion-item>
          
          <ion-button expand="block" @click="agregarHorario" class="ion-margin-top" color="medium">
            Añadir Horario
          </ion-button>
        
        </ion-card-content>
      </ion-card>

      <ion-list-header>Horarios Agregados</ion-list-header>
      <ion-list v-if="materiasAgregadas.length > 0" lines="inset">
        <ion-item v-for="item in materiasAgregadas" :key="item.id">
          <ion-label>
            <h2>{{ item.nombre }}</h2>
            <p>{{ diasSemana[parseInt(item.dia) - 1] }} {{ item.horaInicio }} - {{ item.horaFin }}</p>
          </ion-label>
          <ion-button slot="end" fill="clear" color="danger" @click="quitarHorario(item.id)">
            <ion-icon slot="icon-only" :icon="trash"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-list>
      <ion-item v-else lines="none">
        <ion-label class="ion-text-center ion-text-wrap" color="medium">Sin clases configuradas.</ion-label>
      </ion-item>

      <h3 class="ion-padding-top ion-text-center">Vista Previa</h3>
      <div class="schedule-grid">
        <div class="day-column" v-for="(dia, diaIndex) in diasSemana" :key="diaIndex">
          <h4 class="day-label">{{ dia.substring(0, 3) }}</h4>
          <div class="time-slot" v-for="hora in horas" :key="hora">
            <div class="hora-label">{{ hora }}</div>
            <div class="materia-display">
              {{ gridData[diaIndex + 1][hora] }}
            </div>
          </div>
        </div>
      </div>

    </ion-content>

    <ion-footer class="ion-padding">
      <ion-button expand="block" size="large" @click="guardarYContinuar" color="dark">
        Confirmar y Finalizar
      </ion-button>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, 
  IonInput, IonButton, IonFooter, IonIcon, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonItem, loadingController, IonSelect, 
  IonSelectOption, IonList, IonListHeader, IonButtons, IonBackButton,
  alertController 
} from '@ionic/vue';
import { trash, trashBinOutline } from 'ionicons/icons';
import { HorarioService } from '@/services/horarioService';

const router = useRouter();
const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Rango 5:00 - 19:00
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let h = 5; h <= 19; h++) { 
    const hour = String(h).padStart(2, '0');
    slots.push(`${hour}:00`);
    if (h < 19) slots.push(`${hour}:30`);
  }
  return slots;
};

const horas = generateTimeSlots();
const horasFin = [...horas]; 

const initialGridData = () => {
  const data: { [day: string]: { [time: string]: string } } = {};
  for (let i = 1; i <= 7; i++) { 
    data[String(i)] = {};
    horas.forEach(time => { data[String(i)][time] = ""; });
  }
  return data;
};

interface HorarioItem {
  id: number;
  nombre: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
}

const materiasAgregadas = ref<HorarioItem[]>([]);
const nuevaMateria = reactive({
  nombre: '',
  dia: '1', 
  horaInicio: '07:00',
  horaFin: '08:00'
});
let nextId = 0;

const agregarHorario = () => {
  if (!nuevaMateria.nombre.trim() || nuevaMateria.horaInicio >= nuevaMateria.horaFin) return;
  
  materiasAgregadas.value.push({
    id: nextId++,
    nombre: nuevaMateria.nombre.trim(),
    dia: nuevaMateria.dia,
    horaInicio: nuevaMateria.horaInicio,
    horaFin: nuevaMateria.horaFin
  });
  nuevaMateria.nombre = '';
};

const quitarHorario = (id: number) => {
  materiasAgregadas.value = materiasAgregadas.value.filter(item => item.id !== id);
};

// --- FUNCIÓN DE EMERGENCIA PARA ARREGLAR EL CRASH ---
const borrarTodo = async () => {
    const alert = await alertController.create({
        header: '¿Reiniciar Datos?',
        message: 'Esto borrará el horario actual corrupto. Úsalo si la app no te deja salir.',
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            { 
                text: 'Borrar y Reiniciar', 
                role: 'destructive',
                handler: () => {
                    localStorage.removeItem('exomind_horario_db');
                    window.location.reload(); // Recarga forzada
                }
            }
        ]
    });
    await alert.present();
};

const gridData = computed(() => {
  const grid = initialGridData();
  materiasAgregadas.value.forEach(item => {
    horas.forEach(h => {
      if (h >= item.horaInicio && h < item.horaFin && grid[item.dia] && grid[item.dia][h] !== undefined) {
        grid[item.dia][h] = item.nombre;
      }
    });
  });
  return grid;
});

onMounted(() => {
  try {
      const savedHorario = HorarioService.obtener();
      const materias: HorarioItem[] = [];
      
      // Lógica de recuperación segura
      for (const dayKey in savedHorario) {
        const daySchedule = savedHorario[dayKey];
        let currentMateria = "";
        let startBlock = "";

        for (let i = 0; i < horas.length; i++) {
          const time = horas[i];
          const materia = daySchedule[time];

          if (materia && materia.trim() !== "") {
            if (materia !== currentMateria) {
              if (currentMateria !== "") {
                materias.push({ id: nextId++, nombre: currentMateria, dia: dayKey, horaInicio: startBlock, horaFin: time });
              }
              currentMateria = materia;
              startBlock = time;
            }
          } else {
            if (currentMateria !== "") {
              materias.push({ id: nextId++, nombre: currentMateria, dia: dayKey, horaInicio: startBlock, horaFin: time });
              currentMateria = "";
              startBlock = "";
            }
          }
        }
        if (currentMateria !== "") {
          materias.push({ id: nextId++, nombre: currentMateria, dia: dayKey, horaInicio: startBlock, horaFin: "19:00" });
        }
      }
      materiasAgregadas.value = materias;
  } catch(e) {
      console.log("Datos corruptos, se recomienda usar el botón de borrar.");
  }
});

const guardarYContinuar = async () => {
  const loading = await loadingController.create({ message: 'Guardando...' });
  await loading.present();
  
  await HorarioService.guardar(gridData.value);
  await loading.dismiss();
  
  // Usamos replace para que no pueda volver atrás
  router.replace('/home'); 
};
</script>

<style scoped>
.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); /* Columnas un poco más estrechas */
  gap: 8px;
  font-size: 0.8em;
}
.day-column {
  background: var(--ion-color-light);
  padding: 5px;
  border-radius: 8px;
}
.day-label {
  text-align: center;
  font-weight: bold;
  margin-bottom: 5px;
  color: var(--ion-color-dark); /* Gris oscuro */
}
.time-slot { display: flex; align-items: center; margin-bottom: 2px; }
.hora-label { 
  width: 45px; 
  font-size: 0.8em;
  color: #666;
  flex-shrink: 0; 
}
ion-input {
  --padding-start: 8px;
  --padding-end: 8px;
  font-size: 0.9em;
}
.materia-display {
  flex-grow: 1;
  background-color: #e0e0e0;
  border-radius: 3px;
  padding: 4px;
  font-size: 0.8em;
  min-height: 25px;
  display: flex;
  align-items: center;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>