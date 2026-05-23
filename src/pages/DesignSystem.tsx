import { useState } from 'react'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Modal } from '@shared/components/ui/Modal'

const colors = [
  { name: 'primary-500', class: 'bg-primary-500', hex: '#6366f1' },
  { name: 'primary-400', class: 'bg-primary-400', hex: '#818cf8' },
  { name: 'primary-300', class: 'bg-primary-300', hex: '#a5b4fc' },
  { name: 'green-500', class: 'bg-green-500', hex: '#22c55e' },
  { name: 'red-500', class: 'bg-red-500', hex: '#ef4444' },
  { name: 'yellow-400', class: 'bg-yellow-400', hex: '#facc15' },
  { name: 'gray-950', class: 'bg-gray-950', hex: '#030712' },
  { name: 'gray-900', class: 'bg-gray-900', hex: '#111827' },
  { name: 'gray-800', class: 'bg-gray-800', hex: '#1f2937' },
  { name: 'gray-700', class: 'bg-gray-700', hex: '#374151' },
  { name: 'gray-400', class: 'bg-gray-400', hex: '#9ca3af' },
  { name: 'gray-300', class: 'bg-gray-300', hex: '#d1d5db' },
]

const buttonVariants = [
  { variant: undefined, label: 'primary' },
  { variant: 'secondary' as const, label: 'secondary' },
  { variant: 'ghost' as const, label: 'ghost' },
  { variant: 'danger' as const, label: 'danger' },
]

const badgeColors = [
  { color: undefined, label: 'default' },
  { color: 'primary' as const, label: 'primary' },
  { color: 'green' as const, label: 'green' },
  { color: 'yellow' as const, label: 'yellow' },
  { color: 'red' as const, label: 'red' },
  { color: 'gray' as const, label: 'gray' },
]

export const DesignSystem = () => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      <header className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-white">Guía de Estilos y Estándares</h1>
        <p className="text-gray-400">Sistema de diseño unificado para todas las páginas de QuizzY</p>
      </header>

      {/* Colors */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">1. Colores</h2>
        <p className="text-sm text-gray-400">Paleta definida en <code className="text-primary-300">tailwind.config.js</code>.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {colors.map(c => (
            <div key={c.name} className="text-center">
              <div className={`${c.class} h-20 rounded-xl mb-2 border border-gray-700`} />
              <code className="text-xs text-gray-400">{c.name}</code>
              <p className="text-xs text-gray-500">{c.hex}</p>
            </div>
          ))}
        </div>
        <pre className="bg-gray-950 p-4 rounded-xl text-sm text-gray-300 overflow-x-auto">{`// tailwind.config.js
colors: {
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
}`}</pre>
      </Card>

      {/* Typography */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">2. Tipografía</h2>
        <p className="text-sm text-gray-400">Fuente del sistema (sans-serif de Tailwind).</p>
        <div className="space-y-2">
          <p className="text-3xl font-bold text-white">Heading 1 — 30px bold</p>
          <p className="text-2xl font-bold text-white">Heading 2 — 24px bold</p>
          <p className="text-xl font-bold text-white">Heading 3 — 20px bold</p>
          <p className="text-lg font-bold text-white">Heading 4 — 18px bold</p>
          <p className="text-base text-white">Body — 16px regular</p>
          <p className="text-sm text-gray-400">Caption — 14px gray</p>
          <p className="text-xs text-gray-500">Small — 12px gray</p>
        </div>
        <pre className="bg-gray-950 p-4 rounded-xl text-sm text-gray-300 overflow-x-auto">{`/* Clases utilitarias de Tailwind */
.text-white    /* texto principal */
.text-gray-300 /* texto secundario */
.text-gray-400 /* meta-información */
.text-gray-500 /* etiquetas, footnotes */
.text-primary-300 /* enlaces, acentos */
.text-primary-400 /* acentos brillantes */`}</pre>
      </Card>

      {/* Buttons */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">3. Botones</h2>
        <p className="text-sm text-gray-400">Usar siempre el componente <code className="text-primary-300">Button</code> de <code className="text-primary-300">shared/components/ui</code>.</p>
        <div className="flex flex-wrap gap-3 items-center">
          {buttonVariants.map(b => (
            <Button key={b.label} variant={b.variant} size="sm">{b.label}</Button>
          ))}
          {buttonVariants.map(b => (
            <Button key={`${b.label}-md`} variant={b.variant}>{b.label}</Button>
          ))}
          {buttonVariants.map(b => (
            <Button key={`${b.label}-lg`} variant={b.variant} size="lg">{b.label}</Button>
          ))}
        </div>
        <pre className="bg-gray-950 p-4 rounded-xl text-sm text-gray-300 overflow-x-auto">{`import { Button } from '@shared/components/ui/Button'

<Button>primary</Button>
<Button variant="secondary">secondary</Button>
<Button variant="ghost">ghost</Button>
<Button variant="danger">danger</Button>
<Button size="sm">small</Button>
<Button size="lg">large</Button>`}</pre>
      </Card>

      {/* Cards */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">4. Cards</h2>
        <p className="text-sm text-gray-400">Usar siempre el componente <code className="text-primary-300">Card</code> para contenedores con fondo, borde y padding.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4">
            <p className="text-white font-semibold">Card con padding 4</p>
            <p className="text-sm text-gray-400 mt-1">Uso: sidebar, forms</p>
          </Card>
          <Card className="p-6">
            <p className="text-white font-semibold">Card con padding 6</p>
            <p className="text-sm text-gray-400 mt-1">Uso: contenedores principales</p>
          </Card>
        </div>
        <pre className="bg-gray-950 p-4 rounded-xl text-sm text-gray-300 overflow-x-auto">{`import { Card } from '@shared/components/ui/Card'

<Card className="p-4 sm:p-6">
  <h3>Contenido</h3>
</Card>`}</pre>
      </Card>

      {/* Badges */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">5. Badges</h2>
        <p className="text-sm text-gray-400">Etiquetas de estado, categoría o conteo.</p>
        <div className="flex flex-wrap gap-2">
          {badgeColors.map(b => (
            <Badge key={b.label} color={b.color}>{b.label}</Badge>
          ))}
        </div>
        <pre className="bg-gray-950 p-4 rounded-xl text-sm text-gray-300 overflow-x-auto">{`import { Badge } from '@shared/components/ui/Badge'

<Badge>default</Badge>
<Badge color="primary">primary</Badge>
<Badge color="green">green</Badge>
<Badge color="yellow">yellow</Badge>
<Badge color="red">red</Badge>
<Badge color="gray">gray</Badge>`}</pre>
      </Card>

      {/* Modals */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">6. Modales</h2>
        <p className="text-sm text-gray-400">Diálogos modales con overlay, título y contenido.</p>
        <Button onClick={() => setModalOpen(true)}>Abrir modal de ejemplo</Button>
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Modal de Ejemplo">
          <div className="space-y-4">
            <p className="text-gray-300">Este es un modal de ejemplo que muestra el patrón estándar de diálogo.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={() => setModalOpen(false)}>Confirmar</Button>
            </div>
          </div>
        </Modal>
        <pre className="bg-gray-950 p-4 rounded-xl text-sm text-gray-300 overflow-x-auto">{`import { Modal } from '@shared/components/ui/Modal'

<Modal isOpen={open} onClose={() => setOpen(false)} title="Título">
  <div className="space-y-4">
    <p>Contenido</p>
    <div className="flex gap-3 justify-end">
      <Button variant="secondary">Cancelar</Button>
      <Button>Confirmar</Button>
    </div>
  </div>
</Modal>`}</pre>
      </Card>

      {/* Form Elements */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">7. Elementos de Formulario</h2>
        <p className="text-sm text-gray-400">Inputs, selects y textareas usan las mismas clases de Tailwind en toda la app.</p>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Input texto</label>
            <input type="text" placeholder="Placeholder" readOnly className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Select</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500">
              <option>Opción 1</option>
              <option>Opción 2</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Textarea</label>
            <textarea rows={3} placeholder="Placeholder" readOnly className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none" />
          </div>
        </div>
        <pre className="bg-gray-950 p-4 rounded-xl text-sm text-gray-300 overflow-x-auto">{`/* Clases estándar para inputs */
className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5
           text-white placeholder-gray-500
           focus:outline-none focus:border-primary-500"`}</pre>
      </Card>

      {/* Layout Pattern */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">8. Patrón de Layout</h2>
        <p className="text-sm text-gray-400">Todas las páginas siguen esta estructura:</p>
        <pre className="bg-gray-950 p-4 rounded-xl text-sm text-gray-300 overflow-x-auto">{`// Estructura de layout estándar
<div className="max-w-3xl mx-auto space-y-6">  // o max-w-2xl/max-w-4xl según necesidad
  {/* Header con botón volver */}
  <div className="flex items-center gap-2 sm:gap-4">
    <Button variant="ghost" onClick={() => navigate('/')}>
      <ArrowLeft size={18} />
    </Button>
    <h1 className="text-xl sm:text-2xl font-bold text-white">Título</h1>
  </div>

  {/* Contenido en Cards */}
  <Card className="space-y-4 p-4 sm:p-6">...</Card>

  {/* Botón primario al final */}
  <Button size="lg" className="w-full">Acción</Button>
</div>`}</pre>
      </Card>

      {/* Icons */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">9. Íconos</h2>
        <p className="text-sm text-gray-400">Usar siempre <strong>lucide-react</strong>. Tamaños estándar: <code className="text-primary-300">size={14}</code> (small), <code className="text-primary-300">size={16}</code> (default), <code className="text-primary-300">size={18}</code> (medium), <code className="text-primary-300">size={24}</code> (large).</p>
        <pre className="bg-gray-950 p-4 rounded-xl text-sm text-gray-300 overflow-x-auto">{`import { Plus, Save, ArrowLeft, Trash2 } from 'lucide-react'

<Button><Plus size={14} /> Crear</Button>
<ArrowLeft size={18} />
<Trash2 size={16} />`}</pre>
      </Card>

      {/* Animations */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">10. Animaciones</h2>
        <p className="text-sm text-gray-400">Usar <strong>framer-motion</strong> para transiciones de página y micro-interacciones.</p>
        <pre className="bg-gray-950 p-4 rounded-xl text-sm text-gray-300 overflow-x-auto">{`import { motion } from 'framer-motion'

// Transición de página (App.tsx)
<motion.div
  key={pathname}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.25 }}
>

// Grid con stagger
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: i * 0.04 }}
>`}</pre>
      </Card>

      {/* Estructura del proyecto */}
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">11. Arquitectura del proyecto</h2>
        <p className="text-sm text-gray-400">Organización modular por features:</p>
        <pre className="bg-gray-950 p-4 rounded-xl text-sm text-gray-300 overflow-x-auto">{`src/
├── features/              # Módulos por funcionalidad
│   ├── quiz/              # Quizzes (tests, jugar, resultados)
│   │   ├── pages/         # Home, Creator, Play, Results, Leaderboard
│   │   ├── components/    # QuestionCard, TestCard, TimerRing, etc.
│   │   └── store/         # useQuizStore
│   ├── flashcards/        # Tarjetas didácticas
│   │   ├── pages/         # FlashcardsHome, Creator, Study
│   │   └── components/    # FlashcardCard
│   ├── auth/              # Autenticación
│   │   ├── pages/         # Login
│   │   └── store/         # useAuthStore
│   └── answers/           # Historial de respuestas
│       └── pages/         # MyAnswers
├── shared/                # Código compartido
│   ├── components/
│   │   ├── ui/            # Button, Card, Badge, Modal, etc.
│   │   └── layout/        # Navbar, ParticleBackground
│   ├── store/             # usePreferencesStore
│   ├── utils/             # scoreCalculator, jsonExporter, etc.
│   └── types/             # Interfaces
├── firebase/              # Servicios de Firebase
└── pages/                 # App.tsx, DesignSystem`}</pre>
      </Card>
    </div>
  )
}
