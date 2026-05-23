# QuizzY 🎮

> Plataforma gamificada de quizzes y tarjetas didácticas para estudiar con amigos.  
> Frontend en **GitHub Pages** · Base de datos en **Firebase Firestore** · 100% gratis.

---

## Stack

| Capa          | Tecnología                   |
| ------------- | ---------------------------- |
| Framework     | React 19 + Vite + TypeScript |
| Estilos       | Tailwind CSS v3             |
| Routing       | React Router v6 (HashRouter) |
| Estado        | Zustand                      |
| Animaciones   | Framer Motion                |
| Íconos        | Lucide React                 |
| Base de datos | Firebase Firestore           |
| Auth          | Firebase Auth (Google)       |
| Deploy        | gh-pages                     |

---

## Funcionalidades

### Quizzes
- **Crear tests** con preguntas de opción múltiple o verdadero/falso
- **Jugar** con timer circular, rachas y multiplicadores de puntaje
- **Sonidos y partículas** — feedback visual y auditivo al responder (configurable)
- **Persistencia de partida** — si recargás la página, podés continuar donde lo dejaste
- **Resultados** con estadísticas, puntaje y confetti al obtener ≥80%
- **Leaderboard** compartido entre amigos
- **Mis respuestas** — historial de todas tus partidas

### Tarjetas didácticas (Flashcards)
- **Crear sets** de tarjetas con anverso y reverso
- **Estudiar** con volteo animado, navegación y barra de progreso
- **Mezclar** tarjetas al estudiar
- **Compartir** sets por código o visibilidad global

### Organización y uso compartido
- **Carpetas compartidas** — organizá quizzes y flashcards en carpetas con tres niveles de visibilidad:
  - **Privada** — solo visible para el creador
  - **Pública** — visible para todos los usuarios automáticamente
  - **Por código** — accesible mediante un código compartible
- **Código único** de 6 caracteres para cada test y set de tarjetas
- **Visibilidad global/privada** por ítem

### Herramientas
- **Editor JSON** — editar múltiples preguntas a la vez directamente desde el creador
- **Exportar/Importar JSON** — compartir tests y tarjetas fuera de la plataforma
- **Ejemplo JSON** — copiá un template de referencia para conocer el formato
- **Sincronización automática de tiempo** — al cambiar el tiempo global por pregunta, se actualizan todas las preguntas
- **Firebase Firestore** como base de datos principal con **localStorage** como fallback automático

---

## Cómo funciona

### Carpetas compartidas

Cada carpeta tiene tres modos de visibilidad configurables desde el menú contextual:

| Visibilidad | Icono | Comportamiento |
|---|---|---|
| Privada | 🔒 | Solo el creador la ve |
| Pública | 🌐 | Aparece automáticamente para todos los usuarios |
| Por código | 🔑 | Se necesita el código para acceder |

Al seleccionar una carpeta compartida (pública o por código), se muestran **todos los tests y sets** que contiene, sin importar su visibilidad individual. Esto permite compartir un grupo de recursos con solo compartir la carpeta.

Para unirte a una carpeta por código, usa el campo **"Código de carpeta"** en el sidebar.

### Visibilidad y códigos

Cada test y set de tarjetas tiene:
- **Código único** de 6 caracteres (ej: `A3X9K2`)
- **Visibilidad**: `global` (cualquiera con el código puede acceder) o `private` (solo tú)

### Sonidos y partículas

Durante un quiz, al responder cada pregunta:
- **Acierto**: sonido ascendente suave + 20 partículas verdes/índigo
- **Error**: sonido grave sutil + 10 partículas rojas

Podés desactivar ambos desde los botones 🔊 y ✨ en la cabecera del quiz. Las preferencias se guardan en el navegador.

### Persistencia de partida

Si recargás la página durante un quiz, al volver a entrar verás un diálogo que te permite **continuar** desde la última pregunta respondida o **empezar de cero**. El progreso se guarda después de cada respuesta.

### Editor JSON

En el creador de tests, el botón **"Editar JSON"** abre un modal con el test completo. Los campos `createdBy` y `createdAt` son inmutables y se omiten del editor. También podés exportar el JSON desde el mismo modal.

### Sincronización de tiempo

El campo **"Tiempo por pregunta (s)"** en el creador actualiza automáticamente el tiempo límite de **todas** las preguntas del test.

### Tarjetas didácticas

En la página de flashcards, cada set tiene:
- **Anverso**: concepto, pregunta o término
- **Reverso**: definición, respuesta o explicación

Hacé clic en la tarjeta para **dar vuelta** y ver la respuesta. Usá las flechas o los botones para navegar. Podés mezclar el orden y reiniciar el set cuando quieras.

### Almacenamiento

```
Firestore/
├── folders/               ← Carpetas (con visibilidad y código)
├── tests/                 ← Tests
├── flashcards/            ← Sets de tarjetas didácticas
└── respuestas/            ← Respuestas de todos los usuarios
```

Si Firebase no está configurado, la app usa **localStorage** automáticamente.

---

## Formato JSON para importar tests

Usá el botón **Importar JSON** en la página principal o en el creador. El JSON debe tener esta estructura:

```json
{
  "title": "Historia Universal",
  "description": "Eventos históricos clave",
  "category": "Historia",
  "difficulty": "medio",
  "timePerQuestion": 20,
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

| Campo             | Tipo    | Descripción                              |
| ----------------- | ------- | ---------------------------------------- |
| `title`           | string  | Título del test                          |
| `description`     | string  | Descripción breve                        |
| `category`        | string  | Categoría (Historia, Ciencia, etc.)      |
| `difficulty`      | string  | `"facil"`, `"medio"` o `"dificil"`      |
| `timePerQuestion` | number  | Tiempo límite por pregunta en segundos   |
| `questions`       | array   | Lista de preguntas                       |

### Cada pregunta:

| Campo         | Tipo              | Descripción                                          |
| ------------- | ----------------- | ---------------------------------------------------- |
| `id`          | number            | Identificador único dentro del test                  |
| `text`        | string            | Enunciado de la pregunta                             |
| `type`        | `"multiple"` o `"truefalse"` | Tipo de pregunta                     |
| `options`     | string[]          | Solo para `multiple`: opciones de respuesta          |
| `correct`     | number o boolean  | Índice de la opción correcta (multiple) o true/false |
| `explanation` | string            | Explicación de la respuesta correcta                 |
| `points`      | number            | Puntos base por acertar                              |
| `timeLimit`   | number            | Tiempo límite en segundos para esta pregunta         |

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

| Campo     | Tipo   | Descripción                       |
| --------- | ------ | --------------------------------- |
| `title`   | string | Título del set                    |
| `description` | string | Descripción breve            |
| `cards`   | array  | Lista de tarjetas                 |

### Cada tarjeta:

| Campo   | Tipo   | Descripción                     |
| ------- | ------ | ------------------------------- |
| `front` | string | Anverso (concepto/pregunta)    |
| `back`  | string | Reverso (respuesta/definición) |

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

| Evento                               | Puntos             |
| ------------------------------------ | ------------------ |
| Respuesta correcta                   | 100 pts × multiplicador |
| Bonus velocidad (< mitad del tiempo) | +50 pts            |
| Racha de 3 seguidas                  | Multiplicador ×1.5 |
| Racha de 5 seguidas                  | Multiplicador ×2   |
| Confetti                             | Si accuracy ≥ 80%  |

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
