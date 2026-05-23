# QuizzY 🎮

> Plataforma gamificada de quizzes y tarjetas didácticas para estudiar con amigos.  
> Frontend en **GitHub Pages** · Base de datos en **Firebase Firestore** · 100% gratis.  
> v0.1.9

---

## Stack

| Capa             | Tecnología                              |
| ---------------- | --------------------------------------- |
| Framework        | React 19 + Vite 8 + TypeScript 6        |
| Estilos          | Tailwind CSS v3 (modo dark por defecto) |
| Routing          | React Router v6 (HashRouter)            |
| Estado global    | Zustand v5                              |
| Formularios      | Formik + Yup                            |
| Animaciones      | Framer Motion v12                       |
| Íconos           | Lucide React                            |
| Efectos visuales | canvas-confetti                         |
| Sonidos          | Web Audio API                           |
| Base de datos    | Firebase Firestore                      |
| Auth             | Firebase Auth (Google)                  |
| Paquete          | pnpm                                    |
| Deploy           | GitHub Actions + GitHub Pages           |

---

## Funcionalidades

### Quizzes

- **Crear tests** con preguntas de opción múltiple o verdadero/falso
- **Editor JSON** — editar múltiples preguntas a la vez directamente desde el creador
- **Importar JSON** — cargar tests desde un archivo `.json`
- **Pegar JSON** — pegar un test completo en formato JSON desde el portapapeles
- **Exportar JSON** — descargar un test como archivo `.json`
- **Jugar** con timer circular animado, rachas y multiplicadores de puntaje
- **Auto-avance** configurable entre preguntas (0–10 s)
- **Mezclar preguntas y/o opciones** al estudiar
- **Sonidos y partículas** — feedback visual y auditivo al responder (configurable desde la cabecera del quiz)
- **Persistencia de partida** — si recargás la página, podés continuar donde lo dejaste
- **Resultados** con estadísticas detalladas, puntaje total y confetti al obtener ≥80%
- **Leaderboard** compartido entre amigos (agrupa por jugador)
- **Mis respuestas** — historial completo de todas tus partidas con detalle por pregunta
- **Sincronización automática de tiempo** — al cambiar el tiempo global por pregunta, se actualizan todas las preguntas

### Tarjetas didácticas (Flashcards)

- **Crear sets** de tarjetas con anverso (`front`) y reverso (`back`)
- **Pegar JSON** — importar múltiples tarjetas desde JSON directamente en el creador
- **Estudiar** con volteo animado, navegación con flechas y barra de progreso
- **Mezclar** tarjetas al estudiar
- **Compartir** sets por código único o visibilidad global

### Organización y uso compartido

- **Carpetas compartidas** — organizá quizzes y flashcards en carpetas con tres niveles de visibilidad:
  - **Privada** 🔒 — solo visible para el creador
  - **Pública** 🌐 — visible para todos los usuarios automáticamente
  - **Por código** 🔑 — accesible mediante un código compartible
- **Código único** de 6 caracteres para cada test, set de tarjetas y carpeta
- **Visibilidad global/privada** por ítem
- **Búsqueda por código** — accedé a cualquier recurso público con su código
- **Renombrar y eliminar** carpetas desde el gestor de carpetas

### Preferencias de usuario

- **Sonido** 🔊 — activar/desactivar efectos de sonido al responder quizzes
- **Partículas** ✨ — activar/desactivar animaciones de partículas al responder
- Las preferencias se persisten automáticamente en `localStorage`

### Autenticación

- **Login con Google** mediante Firebase Auth
- **Persistencia de sesión** en `localStorage` con rehidratación automática
- **Redirección automática** al home si ya hay sesión activa
- **Cobertura completa offline** — si Firebase no está configurado, la app usa exclusivamente `localStorage`

### Sistema de errores

- **Error Logger** centralizado con envío a Firestore (colección `error_logs`)
- **Fallback a localStorage** cuando Firestore no está disponible
- **Auto-flush** de logs acumulados localmente hacia Firestore
- Niveles: `info`, `warning`, `error`, `critical`

### UI / UX

- **Diseño oscuro** (dark mode) por defecto
- **Fondo de partículas** animadas (canvas) con temática índigo
- **Navbar responsiva** con menú móvil colapsable
- **Transiciones animadas** entre rutas (Framer Motion `AnimatePresence`)
- **Componentes compartidos**: `Button`, `Card`, `Modal`, `Badge`, `JsonEditorModal`, `JsonPasteModal`
- **Sistema de diseño** (`/design-system`) para visualizar colores, botones, badges y modales
- **Scrollbar personalizada** con estilo oscuro
- **Loaders animados** (spinner circular) durante carga de rutas lazy

---

## Cómo funciona

### Carpetas compartidas

Cada carpeta tiene tres modos de visibilidad configurables desde el menú contextual:

| Visibilidad | Icono | Comportamiento                                  |
| ----------- | ----- | ----------------------------------------------- |
| Privada     | 🔒    | Solo el creador la ve                           |
| Pública     | 🌐    | Aparece automáticamente para todos los usuarios |
| Por código  | 🔑    | Se necesita el código para acceder              |

Al seleccionar una carpeta compartida (pública o por código), se muestran **todos los tests y sets** que contiene, sin importar su visibilidad individual. Esto permite compartir un grupo de recursos con solo compartir la carpeta.

Para unirte a una carpeta por código, usá el campo **"Código de carpeta"** en el sidebar/flashcards.

### Visibilidad y códigos

Cada test, set de tarjetas y carpeta tiene:

- **Código único** de 6 caracteres (ej: `A3X9K2`)
- **Visibilidad**: `global` (cualquiera con el código puede acceder) o `private` (solo tú)

### Sonidos y partículas

Durante un quiz, al responder cada pregunta:

- **Acierto**: sonido ascendente suave (sine wave 523→659 Hz) + 20 partículas verdes/índigo
- **Error**: sonido grave sutil (sawtooth 180→120 Hz) + 10 partículas rojas

Podés desactivar ambos desde los botones 🔊 y ✨ en la cabecera del quiz. Las preferencias se guardan en el navegador.

### Persistencia de partida

Si recargás la página durante un quiz, al volver a entrar verás un diálogo que te permite **continuar** desde la última pregunta respondida o **empezar de cero**. El progreso (índice, respuestas, racha, tiempo, orden de preguntas mezcladas) se guarda después de cada respuesta.

### Editor JSON

En el creador de tests, el botón **"Editar JSON"** abre un modal con el test completo editable. Los campos `createdBy` y `createdAt` son inmutables y se omiten del editor. También podés exportar el JSON desde el mismo modal.

### Sincronización de tiempo

El campo **"Tiempo por pregunta (s)"** en el creador actualiza automáticamente el tiempo límite de **todas** las preguntas del test.

### Auto-avance

En el creador de tests, podés configurar un **auto-avance** (0–10 s) para que el quiz pase automáticamente a la siguiente pregunta después de responder.

### Puntaje y rachas

- **Puntos base**: se calculan en función del tiempo usado (`puntos * (1 - tiempo / (límite * 2))`)
- **Multiplicadores**: racha de 3+ → 1.5×, racha de 5+ → 2×
- **Puntos de bonus**: se suman los puntos extra por multiplicador
- **Puntaje total** = suma de puntos base + bonus de cada respuesta

### Tarjetas didácticas

En la página de flashcards, cada set tiene:

- **Anverso**: concepto, pregunta o término
- **Reverso**: definición, respuesta o explicación

Hacé clic en la tarjeta para **dar vuelta** y ver la respuesta. Usá las flechas o los botones para navegar. Podés mezclar el orden y reiniciar el set cuando quieras.

### Almacenamiento

```
Firestore/
├── error_logs/            ← Logs de errores de la app
├── folders/               ← Carpetas (con visibilidad y código)
├── tests/                 ← Tests
├── flashcards/            ← Sets de tarjetas didácticas
└── respuestas/            ← Respuestas de todos los usuarios
```

Si Firebase no está configurado (variables de entorno vacías), la app usa **exclusivamente `localStorage`** con la misma estructura de datos.

---

## Stack técnico detallado

| Dependencia            | Versión  | Propósito                 |
| ---------------------- | -------- | ------------------------- |
| `react`                | ^19.2.6  | UI framework              |
| `react-dom`            | ^19.2.6  | Renderizado DOM           |
| `react-router-dom`     | ^6.30.3  | Enrutamiento (HashRouter) |
| `zustand`              | ^5.0.13  | Estado global             |
| `firebase`             | ^12.13.0 | Firestore + Auth          |
| `framer-motion`        | ^12.38.0 | Animaciones               |
| `lucide-react`         | ^1.14.0  | Íconos SVG                |
| `formik`               | ^2.4.9   | Manejo de formularios     |
| `yup`                  | ^1.7.1   | Validación de esquemas    |
| `canvas-confetti`      | ^1.9.4   | Confetti en resultados    |
| `vite`                 | ^8.0.12  | Bundler                   |
| `typescript`           | ~6.0.2   | Tipado estático           |
| `tailwindcss`          | ^3.4.19  | Utilidades CSS            |
| `@vitejs/plugin-react` | ^6.0.1   | Plugin de React para Vite |

---

## Rutas

| Ruta                       | Página                  | Lazy |
| -------------------------- | ----------------------- | ---- |
| `/`                        | Home (tests)            | ✅   |
| `/login`                   | Login con Google        | ✅   |
| `/creator`                 | Crear/editar test       | ✅   |
| `/play/:testId`            | Jugar quiz              | ✅   |
| `/results`                 | Resultados del quiz     | ✅   |
| `/leaderboard`             | Leaderboard             | ✅   |
| `/my-answers`              | Historial de respuestas | ✅   |
| `/flashcards`              | Home de flashcards      | ✅   |
| `/flashcards/crear`        | Crear/editar set        | ✅   |
| `/flashcards/study/:setId` | Estudiar tarjetas       | ✅   |
| `/design-system`           | Sistema de diseño       | ✅   |

Todas las rutas se cargan con `React.lazy` + `Suspense` y transiciones animadas con `AnimatePresence`.

---

## Formato JSON para importar tests

Usá el botón **Importar JSON** (desde archivo) o **Pegar JSON** (desde portapapeles) en la página principal o en el creador. El JSON debe tener esta estructura:

```json
{
  "title": "Historia Universal",
  "description": "Eventos históricos clave",
  "category": "Historia",
  "difficulty": "medio",
  "timePerQuestion": 20,
  "visibility": "private",
  "shuffleQuestions": true,
  "shuffleOptions": false,
  "autoAdvance": 4,
  "folderId": "optional-folder-id",
  "questions": [
    {
      "id": 1,
      "text": "¿En qué año comenzó la Segunda Guerra Mundial?",
      "type": "multiple",
      "options": ["1935", "1937", "1939", "1941"],
      "correct": 2,
      "explanation": "La WWII comenzó el 1 de septiembre de 1939.",
      "points": 100,
      "timeLimit": 20
    }
  ]
}
```

| Campo              | Tipo    | Descripción                                     |
| ------------------ | ------- | ----------------------------------------------- |
| `title`            | string  | Título del test (obligatorio, 3–100 caracteres) |
| `description`      | string  | Descripción breve (opcional, máx. 300)          |
| `category`         | string  | Categoría (Historia, Ciencia, etc.)             |
| `difficulty`       | string  | `"facil"`, `"medio"` o `"dificil"`              |
| `timePerQuestion`  | number  | Tiempo límite global por pregunta (5–120 s)     |
| `visibility`       | string  | `"global"` o `"private"` (opcional)             |
| `shuffleQuestions` | boolean | Mezclar preguntas al jugar (opcional)           |
| `shuffleOptions`   | boolean | Mezclar opciones al jugar (opcional)            |
| `autoAdvance`      | number  | Auto-avance en segundos (0–10, opcional)        |
| `folderId`         | string  | ID de carpeta para organizar (opcional)         |
| `questions`        | array   | Lista de preguntas (obligatorio, mínimo 1)      |

### Cada pregunta:

| Campo         | Tipo                         | Descripción                                          |
| ------------- | ---------------------------- | ---------------------------------------------------- |
| `id`          | number                       | Identificador único dentro del test                  |
| `text`        | string                       | Enunciado de la pregunta (obligatorio, mín. 5 chars) |
| `type`        | `"multiple"` o `"truefalse"` | Tipo de pregunta                                     |
| `options`     | string[]                     | Solo para `multiple`: 2–4 opciones de respuesta      |
| `correct`     | number o boolean             | Índice (multiple) o `true`/`false` (truefalse)       |
| `explanation` | string                       | Explicación de la respuesta correcta (opcional)      |
| `points`      | number                       | Puntos base (10–500, default 100)                    |
| `timeLimit`   | number                       | Tiempo límite individual (5–120 s, opcional)         |

---

## Formato JSON para importar flashcards

Usá **"Pegar JSON"** en el creador de tarjetas. Estructura esperada:

```json
{
  "title": "Vocabulario Inglés",
  "description": "Palabras básicas",
  "cards": [
    { "front": "Hello", "back": "Hola" },
    { "front": "Goodbye", "back": "Adiós" }
  ]
}
```

| Campo         | Tipo   | Descripción                  |
| ------------- | ------ | ---------------------------- |
| `title`       | string | Título del set (opcional)    |
| `description` | string | Descripción breve (opcional) |
| `cards`       | array  | Lista de tarjetas            |

### Cada tarjeta:

| Campo   | Tipo   | Descripción                    |
| ------- | ------ | ------------------------------ |
| `front` | string | Anverso (concepto/pregunta)    |
| `back`  | string | Reverso (respuesta/definición) |

---

## Desarrollo

```bash
# Clonar e instalar
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Firebase (opcional, funciona sin Firebase)

# Iniciar servidor de desarrollo
pnpm dev

# Compilar para producción
pnpm build

# Vista previa del build
pnpm preview

# Linter
pnpm lint
```

> **Nota**: La app funciona completamente sin Firebase usando `localStorage`. Las variables de entorno son opcionales y solo se necesitan para persistencia en la nube y autenticación con Google.

### Variables de entorno

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### Alias de importación

```typescript
@/                        → src/
@app/                     → src/app/
@auth/                    → src/features/auth/
@flashcards/              → src/features/flashcards/
@folders/                 → src/features/folders/
@preferences/             → src/features/preferences/
@quiz/                    → src/features/quiz/
@shared/                  → src/shared/
```

---

## Arquitectura del proyecto

```
src/
├── App.tsx                         ← Componente raíz (HashRouter, navbar, rutas)
├── main.tsx                        ← Punto de entrada
├── index.css                       ← Estilos globales (Tailwind + scrollbar)
│
├── app/
│   ├── constants/routes.ts         ← Definición centralizada de rutas
│   ├── router/
│   │   ├── AnimatedRoutes.tsx      ← Transiciones animadas entre rutas
│   │   ├── lazyRoutes.tsx          ← React.lazy() para cada página
│   │   └── routes.tsx              ← Configuración de rutas
│   └── services/errorLogger.ts     ← Logger con Firestore + localStorage
│
├── features/
│   ├── auth/                       ← Autenticación (Google OAuth)
│   ├── flashcards/                 ← Tarjetas didácticas
│   ├── folders/                    ← Carpetas compartidas
│   ├── preferences/                ← Preferencias de usuario
│   └── quiz/
│       ├── answers/                ← Respuestas, leaderboard, resultados
│       ├── constants/              ← Constantes compartidas del módulo
│       ├── game-engine/            ← Motor de juego (timer, scoring, progreso)
│       └── test-management/        ← CRUD de tests, editor, importación
│
├── pages/DesignSystem.tsx          ← Sistema de diseño visual
│
└── shared/
    ├── components/
    │   ├── layout/                 ← Navbar, ParticleBackground
    │   └── ui/                     ← Button, Card, Modal, Badge, etc.
    ├── services/firebase.ts        ← Configuración de Firebase
    ├── types/index.ts              ← Re-export de tipos globales
    └── utils/
        ├── jsonExporter.ts         ← Descarga de JSON (tests, respuestas)
        └── jsonImporter.ts         ← Carga de JSON desde archivo
```

---

## Cómo compartir

### Opción 1: Carpeta compartida (recomendado para grupos)

1. Creá una carpeta y ponele un nombre
2. Cambiá la visibilidad a **Pública** o **Por código** desde el menú contextual
3. Asigná tus tests o sets de tarjetas a esa carpeta desde el creador
4. Compartí el nombre de la carpeta (si es pública) o el código (si es por código)
5. Los demás usuarios ven la carpeta y pueden acceder a todo su contenido

### Opción 2: Código

1. Creás un test/set con visibilidad **Global**
2. Compartís el **código** (ej: `A3X9K2`) por WhatsApp, Discord, etc.
3. Tu amigo ingresa el código en el buscador correspondiente
4. Juega o estudia

### Opción 3: Archivo JSON

1. Creás o exportás un test/set como JSON
2. Enviás el archivo
3. Tu amigo usa **Importar JSON** o **Pegar JSON**

---

## Sistema de puntos (quizzes)

| Evento                               | Puntos                  |
| ------------------------------------ | ----------------------- |
| Respuesta correcta                   | 100 pts × multiplicador |
| Bonus velocidad (< mitad del tiempo) | +50 pts                 |
| Racha de 3 seguidas                  | Multiplicador ×1.5      |
| Racha de 5 seguidas                  | Multiplicador ×2        |
| Confetti                             | Si accuracy ≥ 80%       |

---

## Setup

```bash
# Instalar dependencias
pnpm install

# Configurar Firebase (opcional)
# Crear .env con las credenciales (ver .env.example)

# Desarrollo local
pnpm dev      # → http://localhost:5173/quizz/

# Compilar para producción
pnpm build

# Publicar en GitHub Pages
pnpm deploy
```

### Variables de entorno (`.env`)

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### Reglas de Firestore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /folders/{folderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
        && request.auth.token.email == resource.data.createdBy;
    }
    match /tests/{testId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
        && request.auth.token.email == resource.data.createdBy;
    }
    match /flashcards/{flashcardId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
        && request.auth.token.email == resource.data.createdBy;
    }
    match /respuestas/{docId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.playerId == request.auth.token.email;
      allow update, delete: if request.auth != null
        && request.resource.data.playerId == request.auth.token.email;
    }
  }
}
```

---

## Estructura del proyecto

```
quizz/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .env
├── .env.example
├── .gitignore
└── src/
    ├── main.tsx
    ├── App.tsx                          # Router con las 11 rutas
    ├── index.css
    ├── types/
    │   └── index.ts                     # Interfaces: Question, Test, Folder, Flashcard, etc.
    ├── firebase/
    │   ├── config.ts
    │   ├── authService.ts
    │   ├── testsService.ts              # CRUD de tests (Firestore + localStorage)
    │   ├── flashcardService.ts          # CRUD de flashcards (Firestore + localStorage)
    │   ├── answersService.ts            # Respuestas a Firestore
    │   └── folderService.ts             # CRUD de carpetas con visibilidad y códigos
    ├── store/
    │   ├── useAuthStore.ts              # Estado de autenticación
    │   ├── useQuizStore.ts              # Estado del juego
    │   └── usePreferencesStore.ts       # Preferencias de sonido y partículas
    ├── utils/
    │   ├── scoreCalculator.ts
    │   ├── jsonExporter.ts
    │   ├── jsonImporter.ts
    │   ├── soundEffects.ts              # Sonidos con Web Audio API
    │   └── quizPersistence.ts           # Guardado/restauración de partidas
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Modal.tsx
    │   │   ├── FolderSelect.tsx
    │   │   ├── FolderList.tsx
    │   │   ├── JsonPasteModal.tsx
    │   │   └── JsonEditorModal.tsx
    │   ├── layout/
    │   │   ├── Navbar.tsx
    │   │   └── ParticleBackground.tsx
    │   ├── quiz/
    │   │   ├── TimerRing.tsx
    │   │   ├── QuestionCard.tsx
    │   │   ├── AnswerOption.tsx
    │   │   ├── ProgressBar.tsx
    │   │   └── ScoreDisplay.tsx
    │   ├── flashcard/
    │   │   └── FlashcardCard.tsx        # Tarjeta de set en la lista
    │   └── creator/
    │       ├── TestCard.tsx
    │       ├── QuestionEditor.tsx
    │       └── JsonImporter.tsx
    └── pages/
        ├── Login.tsx
        ├── Home.tsx                     # Dashboard de quizzes
        ├── Creator.tsx                  # Crear/editar tests
        ├── Play.tsx                     # Jugar quiz con sonido, partículas y persistencia
        ├── Results.tsx
        ├── Leaderboard.tsx
        ├── MyAnswers.tsx
        ├── FlashcardsHome.tsx           # Dashboard de tarjetas didácticas
        ├── FlashcardCreator.tsx         # Crear/editar sets de tarjetas
        └── FlashcardStudy.tsx           # Modo estudio con volteo animado
```
