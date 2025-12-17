# App Organizador de Fotos

Este proyecto es una aplicación donde al tomar fotos del pizarrón se puedan guardar en carpetas especifacas de cada materia, (donde previamente se suba el horario de las materias y se pueda que al tomar la foto automaticamente se agregue a la carptea de esa materia).
Desarrollada con **Vue.js**, **Ionic Framework** y **TypeScript**. Permite gestionar y visualizar horarios de manera eficiente.


* **Framework:** [Vue.js 3](https://vuejs.org/)
* **Componentes UI:** [Ionic Framework](https://ionicframework.com/)
* **Herramienta de Construcción:** [Vite](https://vitejs.dev/)
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)

## Estructura del Proyecto

Los archivos principales de la lógica se encuentran en:
* `src/views/`: Ahí están las páginas de `HomePage.vue` y `SettingsPage.vue`.
* `src/services/`: Incluye el `horarioService.ts` para el manejo de datos.
* `src/theme/`: Estilos globales y variables de diseño.

## Instalación y Uso

### 1. Requisitos previos
Tener instalado [Node.js](https://nodejs.org/).

### 2. Clonar el repositorio
```bash
git clone [https://github.com/rebeccacs50/App-Organizador-de-Fotos.git](https://github.com/rebeccacs50/App-Organizador-de-Fotos.git)
cd App-Organizador-de-Fotos
```

### 3. Instalar Dependencias
npm install

### 4. Ejecutar Aplicación (en el navegador)
npm run dev
