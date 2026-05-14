# QuizzY 🎮

> Plataforma gamificada de quizzes para estudiar con amigos.  
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

- **Crear tests** con preguntas de opción múltiple o verdadero/falso
- **Jugar** con timer circular, rachas y multiplicadores de puntaje
- **Resultados** con estadísticas, puntaje y confetti al obtener ≥80%
- **Leaderboard** compartido entre amigos
- **Código de test** — cada test tiene un código único de 6 caracteres para compartir
- **Tests globales** — visibles para cualquier usuario con el código
- **Tests privados** — solo visibles para el creador
- **Mis respuestas** — historial de todas tus partidas
- **Importar/Exportar JSON** — compartir tests fuera de la plataforma
- **Firebase Firestore** como base de datos principal con **localStorage** como fallback automático

---

## Cómo funciona

### Visibilidad y códigos

Cada test tiene:
- **Código único** de 6 caracteres (ej: `A3X9K2`)
- **Visibilidad**: `global` (cualquiera con el código puede jugar) o `private` (solo tú)

Para jugar un test de un amigo, ingresa el código en el buscador de la página principal.

### Almacenamiento

```
Firestore/
├── tests/                  ← Tests globales
│   ├── ABC123
│   └── DEF456
└── respuestas/             ← Respuestas de todos los usuarios
    ├── ...
    └── ...
```

Si Firebase no está configurado, la app usa **localStorage** automáticamente.

---

## Formato JSON para importar tests

Usa el botón **Importar JSON** en la página principal o en el creador para cargar un test. El JSON debe tener esta estructura:

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
    },
    {
      "id": 2,
      "text": "Napoleón nació en Francia.",
      "type": "truefalse",
      "correct": false,
      "explanation": "Napoleón nació en Córcega (Italia en ese entonces).",
      "points": 100,
      "timeLimit": 15
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

## Cómo compartir un test

### Opción 1: Código (recomendado)

1. Creas un test con visibilidad **Global**
2. Compartes el **código** (ej: `A3X9K2`) por WhatsApp, Discord, etc.
3. Tu amigo ingresa el código en el buscador de QuizzY
4. Juega y sus respuestas se guardan automáticamente

### Opción 2: Archivo JSON

1. Creas o juegas un test y usas el botón **Exportar**
2. Envías el archivo `.json`
3. Tu amigo usa **Importar JSON** en la página principal

---

## Sistema de puntos

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
    match /tests/{testId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
        && request.auth.token.email == resource.data.createdBy;
    }
    match /respuestas/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.auth.token.email == resource.data.playerId;
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
    ├── App.tsx
    ├── index.css
    ├── types/
    │   └── index.ts
    ├── firebase/
    │   ├── config.ts
    │   ├── authService.ts
    │   ├── testsService.ts
    │   └── answersService.ts
    ├── store/
    │   ├── useAuthStore.ts
    │   └── useQuizStore.ts
    ├── utils/
    │   ├── scoreCalculator.ts
    │   ├── jsonExporter.ts
    │   └── jsonImporter.ts
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Badge.tsx
    │   │   └── Modal.tsx
    │   ├── layout/
    │   │   ├── Navbar.tsx
    │   │   └── ParticleBackground.tsx
    │   ├── quiz/
    │   │   ├── TimerRing.tsx
    │   │   ├── QuestionCard.tsx
    │   │   ├── AnswerOption.tsx
    │   │   ├── ProgressBar.tsx
    │   │   └── ScoreDisplay.tsx
    │   └── creator/
    │       ├── TestCard.tsx
    │       ├── QuestionEditor.tsx
    │       └── JsonImporter.tsx
    └── pages/
        ├── Login.tsx
        ├── Home.tsx
        ├── Creator.tsx
        ├── Play.tsx
        ├── Results.tsx
        ├── Leaderboard.tsx
        └── MyAnswers.tsx
```
