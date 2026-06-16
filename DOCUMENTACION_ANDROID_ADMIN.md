# Documentación del Sistema: App de Administración Android y Sincronización Cloud

Este documento describe detalladamente la arquitectura, configuración y manual de operaciones para la aplicación Android de Administración de **Fútbol Rápido Tribol**, integrada con sincronización en tiempo real a través de Google Firebase Firestore.

---

## 🗺️ 1. Arquitectura Híbrida y Flujo Multiplataforma

La solución se basa en una arquitectura unificada que proporciona tanto un sitio público interactivo para clientes como una aplicación nativa empaquetada para administradores mediante **Capacitor**:

1. **Cliente Web Público (SPA-React)**: Disponible para usuarios generales que realizan reservas, consultan torneos, MVPs, equipos, galerías y detalles de contacto.
2. **App Android de Administración (Capacitor Native Shell)**: Empaqueta la interfaz administrativa optimizada bajo pautas visuales oscuras (*"Cosmic Slate Theme"*), limitando la superficie de ataque y enfocándose 100% en controles gerenciales.

### 🔄 Detección de Plataforma Firme
En `src/App.tsx`, el sistema detecta de manera automatizada si está siendo ejecutado dentro del contenedor nativo de Android:
```typescript
import { Capacitor } from '@capacitor/core';
const isCapacitorNative = Capacitor.isNativePlatform();
```
* Si se ejecuta de forma nativa en un dispositivo, el usuario es dirigido directamente al portal administrativo blindado.
* Si se ejecuta en un navegador web tradicional de escritorio, los desarrolladores y el administrador tienen acceso a un botón interactivo flotante en la esquina inferior derecha: **📱 Vista App Android Admin**. Esto permite alternar y probar el comportamiento de la interfaz móvil en tiempo real.

---

## 📂 2. Estructura de Archivos Clave Modificados

El soporte móvil administrativo y la persistencia en la nube se encuentran estructurados en los siguientes componentes:

### ⚙️ Configuración del Entorno de Aplicación
* **`/capacitor.config.ts`**: Define la firma de la aplicación nativa (`com.futbolrapidotribol.admin`), el nombre visible (`Futbol Rapido Tribol Admin`) y enlaza el servidor de desarrollo activo para permitir pruebas inmediatas con el backend en la nube Cloud Run.
* **`/package.json`**: Incluye dependencias nativas de capacitor (`@capacitor/core`, `@capacitor/android`, `@capacitor/cli`).

### 📱 Componentes y Capa de Presentación
* **`/src/App.tsx`**: Administra los estados de autenticación móvil, control de accesos gerenciales, diseño de Material Design móvil con cabeceras de sincronización activa e inserciones fluidas de `AdminPanel.tsx` sobre la totalidad del viewport nativo.

### ☁️ Sincronización Ininterrumpida y Persistencia en Firebase
* **`/server/firebase.ts`**: Inicializa la interfaz con la base de datos de Google Cloud, cargando las credenciales asignadas desde `firebase-applet-config.json` y validando de manera no bloqueante el estado de la conexión mediante un ping con el servidor oficial:
  ```typescript
  export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  ```
* **`/server/dbStore.ts`**: Es el motor híbrido de redundancia local y en la nube. Realiza lecturas inmediatas desde el disco local `/database_state.json` para máxima velocidad, pero propaga instantáneamente todas las mutaciones realizadas a Firestore.

---

## 🔐 3. Portal de Acceso Administrativo Android

El acceso en dispositivos móviles cuenta con un diseño inspirado en lineamientos Material oscuros:
* **Esfera de Seguridad**: Encabezada por un contenedor con gradiente esmeralda y el ícono de escudo (`Shield`).
* **Indicador en Tiempo Real (= real-time cloud sync)**: Una pulsación verde brillante indica que la aplicación está conectada de manera segura a la base de datos en la nube.
* **Autocompletado de Prueba**: Para simplificar las demostraciones del simulador, se incluye un botón interactivo para autocompletar credenciales administrativas preestablecidas de manera inmediata.
* **Cierre de Sesión Seguro**: Un botón rojo de cierre de sesión purga el estado y regresa de inmediato al portal de acceso administrativo.

---

## 💾 4. Estrategia de Sincronización Híbrida (Firestore & Local)

Para garantizar la máxima tolerancia a fallos, velocidad y persistencia, `dbStore.ts` opera bajo un esquema complementario:

```
[Cliente Android Admin] ─► [Express REST APIs] ─► [Actualiza database_state.json (Local OS)]
                                   │
                                   └─► [Hilos No Bloqueantes (Cloud Sync)] ─► [Google Firestore Cloud]
```

### 🛰️ Startup Cloud Sync
Al iniciar el servidor backend, la base de datos local se sincroniza con Firestore de manera transparente:
* **Si Firestore tiene registros**: Descarga la estructura cloud actual e inicializa la memoria intermedia local con los datos más recientes de la nube.
* **Si la base en la nube está limpia**: Ejecuta un subproceso de semillado (*seeding*) para migrar todas las colecciones iniciales a Firestore, asegurando consistencia inmediata.

### 🏗️ Colecciones Cloud Mapeadas
Las mutaciones se propagan de manera asíncrona hacia las siguientes colecciones gemelas de Firestore:
* `users`
* `reservations`
* `payments`
* `promotions`
* `photos`
* `videos`
* `teams`
* `players`
* `reviews`
* `fields`
* `dynamicPrices`

### 🛡️ Tratamiento Avanzado de Errores de Permiso
Cumpliendo rigurosamente los estándares de Zero-Trust, el sistema mapea y encapsula los posibles fallos del SDK mediante la función centralizada `handleFirestoreError` de `OperationType`:
```typescript
interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | null;
    email: string | null;
    ...
  }
}
```
Esto permite interceptar de inmediato ataques de inyección de recursos, modificaciones fraudulentas o faltas de privilegios exponiendo logs estructurados limpios sin comprometer información sensible en la terminal del cliente.

---

## 🛠️ 5. Flujo de Trabajo para Compilación y Despliegue en Android

Para empaquetar la aplicación y transferirla a un dispositivo físico o emulador Android, siga los siguientes pasos desde el directorio raíz del proyecto:

### Paso 1: Compilar la Aplicación Web
Este comando compila toda la interfaz de usuario en React a código estático minimizado dentro de la carpeta `/dist`:
```bash
npm run build
```

### Paso 2: Sincronizar Recursos con Capacitor
Este comando transfiere todos los cambios de diseño estático de React Directamente al interior del proyecto Android nativo (`/android`):
```bash
npx cap sync
```

### Paso 3: Abrir y Ejecutar en Android Studio
Para compilar el binario APK y firmarlo, abra el IDE nativo de desarrollo:
```bash
npx cap open android
```
*(También se puede abrir la carpeta `/android` directamente en Android Studio desde el explorador).*

* Dentro de **Android Studio**, haga clic en el botón **Run ('app')** para instalar el software en su dispositivo conectado o emulador activo.

---

🚀 *Este ecosistema está listo para operaciones. El linter se ejecuta de forma exitosa y libre de errores de tipado, garantizando que futuras expansiones del panel sigan manteniendo consistencia total con Gradle y Capacitor.*
