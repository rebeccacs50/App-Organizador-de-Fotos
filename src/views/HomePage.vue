<template>
  <ion-page>
    <ion-header :translucent="true" class="ion-no-border">
      <ion-toolbar color="dark">
        <ion-buttons slot="end">
          <ion-button router-link="/setup">
            <ion-icon :icon="settingsOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding content-bg">
      
      <div v-if="fotoCapturada" class="result-container animate__animated animate__fadeIn">
        <ion-card class="minimal-card">
          <img :src="fotoCapturada" alt="Evidencia" />

          <ion-card-content>
            Guardado en Galería: {{ horaActual }}
          </ion-card-content>
        </ion-card>

        <ion-button expand="block" fill="outline" color="medium" @click="tomarFoto" class="ion-margin-top">
          <ion-icon slot="start" :icon="camera"></ion-icon>
          Nueva Captura
        </ion-button>
      </div>

      <div v-else class="loading-view">
        <p>Listo para escanear...</p>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { 
  IonContent, IonHeader, IonPage, IonToolbar, IonButton, IonIcon, 
  IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, 
  IonButtons, loadingController, toastController, alertController 
} from '@ionic/vue';
import { camera, settingsOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { HorarioService } from "@/services/horarioService";
import { Media } from '@capacitor-community/media'; 

const fotoCapturada = ref<string | null>(null);
const materiaDetectada = ref<string>("");
const nombreAlbumFinal = ref<string>(""); 
const horaActual = ref<string>("");
const isLoadingPhoto = ref(false);

onMounted(() => {
  setTimeout(() => { tomarFoto(); }, 500);
});

watch(fotoCapturada, (newValue) => {
  if (newValue) setTimeout(() => { isLoadingPhoto.value = false; }, 500);
});

const tomarFoto = async () => {
  const loading = await loadingController.create({
    message: 'Procesando...',
    duration: 5000,
    spinner: 'crescent' // Spinner más elegante
  });
  await loading.present();

  try {
    procesarContexto(); 

    const image = await Camera.getPhoto({
      quality: 90, 
      width: 1280, 
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });

    fotoCapturada.value = image.webPath!;
    
    if (image.path) {
        await guardarEvidencia(image.path);
    } else {
        await guardarEvidencia(image.webPath!);
    }
    
  } catch (e) {
    console.log("Cancelado por usuario", e);
  } finally {
    loading.dismiss();
  }
};

const procesarContexto = () => {
    const fecha = new Date();
    horaActual.value = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    materiaDetectada.value = HorarioService.detectarMateriaActual();
}

const guardarEvidencia = async (pathOriginal: string) => {
    try {
        let nombreBuscado = "";
        if (materiaDetectada.value === "Fotos Escuela General") {
            nombreBuscado = "Fotos Escuela General";
        } else {
            nombreBuscado = materiaDetectada.value;
        }
        
        nombreAlbumFinal.value = nombreBuscado;

        const albumsResult = await Media.getAlbums();
        const albumEncontrado = albumsResult.albums.find(a => a.name === nombreBuscado);
        let albumID = "";

        if (albumEncontrado) {
            albumID = albumEncontrado.identifier;
        } else {
            const alert = await alertController.create({
                header: 'Álbum no encontrado',
                message: `Por favor crea el álbum "${nombreBuscado}" en tu iPhone.`,
                buttons: ['OK']
            });
            await alert.present();
            return; 
        }

        await Media.savePhoto({
            path: pathOriginal,
            albumIdentifier: albumID 
        });

        const toast = await toastController.create({
            message: ` ✓ Guardada en: ${nombreBuscado}`,
            duration: 2000,
            color: 'medium', // Toast gris también
            position: 'top'
        });
        await toast.present();

    } catch (e: any) {
        let mensajeError = "";
        if (typeof e === 'string') mensajeError = e;
        else if (e.message) mensajeError = e.message;
        else mensajeError = JSON.stringify(e);

        const alert = await alertController.create({
            header: 'Error Técnico',
            message: `Detalles: ${mensajeError}`,
            buttons: ['OK']
        });
        await alert.present();
    }
}
</script>

<style scoped>
.content-bg { --background: #f4f5f8; }

.result-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  text-align: center;
}

.loading-view {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-style: italic;
  height: 100%;
}

/* Tarjeta más limpia sin bordes azules */
.minimal-card {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05); /* Sombra suave */
  border-radius: 12px;
}

img {
  width: 100%;
  height: auto;
  object-fit: cover;
  /* CAMBIO 3: Borde gris sutil en lugar de azul primario */
  border-bottom: 1px solid #e0e0e0; 
  border-radius: 12px 12px 0 0;
}
</style>