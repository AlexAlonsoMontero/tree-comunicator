# Guía de desarrollo

Esta guía concreta las normas que deben seguir personas y agentes de IA al modificar Tree Communicator. Complementa `AGENTS.md`, `README.md`, `docs/DEFINICION_PROYECTO.md` y `docs/ANALISIS_REQUISITOS.md`.

## 1. Arquitectura hexagonal pragmática

La aplicación se organiza por responsabilidad, no por comodidad del framework:

```text
src/
├── domain/           # TypeScript puro: entidades, reglas y políticas
├── application/      # Casos de uso y puertos reales
├── infrastructure/   # Adaptadores: SQLite, archivos, TTS, SMS, Keystore, red
└── presentation/     # Ionic Angular, componentes, páginas y estilos
```

La estructura base vive bajo `src/app/domain`, `src/app/application`, `src/app/infrastructure` y `src/app/presentation`. Cada carpeta empieza con un `README.md` y solo debe recibir código cuando exista una responsabilidad real.

Decisión de issue #4: este paso configura capas y controles de calidad sin crear puertos falsos, interfaces vacías ni adaptadores simulados. Playwright y hooks de pre-commit se incorporarán cuando existan flujos reales que validar; hasta entonces, CI es la puerta de integración.

Reglas obligatorias:

- `domain` no importa Angular, Ionic, Capacitor, SQLite, APIs Android ni adaptadores.
- `application` no importa presentación ni infraestructura concreta.
- `presentation` puede llamar casos de uso o adaptadores de presentación, pero no concentrar reglas de negocio.
- `infrastructure` implementa fronteras reales y traduce detalles externos al lenguaje de la aplicación.
- Los contratos se crean en fronteras reales: persistencia, voz, SMS, archivos, almacenamiento seguro, reloj y red futura.
- No crear interfaces decorativas para una única implementación si no hay sustitución real, prueba de frontera o inversión de dependencia útil.

## 2. SOLID aplicado con criterio

- **SRP:** una clase, función o componente debe tener una razón principal de cambio.
- **OCP:** extender reglas con modelos y políticas explícitas antes que editar condicionales dispersos.
- **LSP:** si aparece herencia, debe ser sustituible; preferir composición.
- **ISP:** los puertos deben ser pequeños y orientados al caso de uso.
- **DIP:** depender de abstracciones solo en fronteras reales, no por ceremonia.

Evitar especialmente:

- Servicios Angular que mezclen UI, persistencia, navegación y reglas de dominio.
- Componentes que calculen decisiones críticas de navegación, SMS o priorización.
- DTOs externos filtrándose dentro del dominio.

## 3. Angular e Ionic

- Usar componentes standalone.
- Mantener textos visibles de interfaz en español.
- Usar tipos explícitos cuando mejoren intención y `readonly` para datos inmutables.
- Evitar lógica de negocio pesada en páginas Ionic.
- No acceder a Capacitor directamente desde dominio o aplicación.
- No introducir dependencias nuevas sin justificar el problema, la alternativa descartada y el impacto en requisitos/documentación.
- Respetar safe areas de Android; la app no debe dibujar debajo de barras del sistema salvo decisión explícita.

## 4. SCSS, CSS y diseño

### 4.1 Metodología BEM

Las clases de presentación deben seguir BEM:

```scss
.communicator {
}
.communicator__bar {
}
.communicator__bar--top {
}
.communication-option {
}
.communication-option__label {
}
.communication-option--focused {
}
```

Reglas:

- Bloques para componentes o regiones estables.
- Elementos con `__` cuando dependen del bloque.
- Modificadores con `--` para estado, variante o intención.
- Evitar selectores profundos y acoplamiento a etiquetas salvo resets locales justificados.

### 4.2 Variables y tokens

Usar variables CSS para valores reutilizables o semánticos:

- colores;
- espaciado;
- radios;
- bordes;
- sombras;
- tamaños tipográficos base;
- duraciones de animación;
- z-index si aparece una escala.

Los colores de producto viven preferentemente en `src/theme/variables.scss`. No hardcodear colores en componentes salvo excepción local documentada.

Antes de repetir un valor, plantear si corresponde crear un token. Antes de crear un token, comprobar que representa una decisión reutilizable y no una casualidad visual.

### 4.3 Estilos globales

`src/global.scss` se reserva para:

- imports base de Ionic;
- resets globales mínimos;
- reglas verdaderamente globales;
- ajustes de accesibilidad transversales.

Los estilos específicos pertenecen al SCSS del componente o a componentes reutilizables.

## 5. Accesibilidad

- Todo control debe tener texto visible o nombre accesible.
- El color nunca es la única señal.
- Mantener foco visible con borde, forma, escala u otra señal no cromática.
- Respetar objetivos táctiles mínimos; los botones principales deben superar ampliamente 48 × 48 dp.
- La cuadrícula de comunicación contiene solo opciones de comunicación; navegación y configuración van fuera.
- `Me encuentro mal` permanece en la primera posición de inicio.
- Diseñar y validar primero tablet horizontal.

## 6. Datos, permisos y privacidad

- Las funciones centrales no dependen de red.
- No añadir permisos Android sin justificarlo en requisitos/documentación.
- Al importar imágenes, copiar al espacio privado de la app y guardar solo identificadores o rutas relativas internas.
- No guardar claves de IA en código, SQLite, archivos ni copias.
- No enviar SMS reales en pruebas automatizadas.
- No introducir analítica, publicidad, sincronización o servicios externos en el MVP.

## 7. Pruebas y validación

Antes de integrar cambios de código, ejecutar lo que aplique:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm arch
pnpm test:ci
pnpm coverage
pnpm build
pnpm exec cap sync android
cd android && ./gradlew assembleDebug
```

Además:

- Dominio y aplicación deben cubrirse con Vitest.
- Flujos críticos de UI se cubrirán con Playwright cuando existan.
- Navegación, pulsación mantenida, composición de frases, priorización y SMS requieren pruebas específicas.
- SMS, TTS offline y pulsación mantenida deben validarse en tablet Android real antes de considerarse listos.

Si una comprobación no puede ejecutarse, registrar el motivo y el comando pendiente.

## 8. Trabajo con agentes de IA

Los agentes deben:

1. Leer `AGENTS.md` y esta guía antes de modificar arquitectura, UI o comportamiento.
2. Consultar requisitos (`RF`, `RA`, `RD`, `RS`, `RNF`) antes de implementar.
3. Preferir cambios pequeños, verificables y trazables a una issue.
4. No inventar decisiones pendientes: proponer y esperar confirmación.
5. Actualizar documentación cuando cambie una decisión funcional o técnica.
6. Dejar evidencia de comandos ejecutados y limitaciones conocidas.
7. No cerrar una tarea si queda una prueba crítica fallando o sin ejecutar sin explicación.

## 9. Revisión antes de PR

Una PR debe dejar claro:

- issue relacionada;
- alcance y no-alcance;
- cambios principales;
- requisitos cubiertos;
- pruebas ejecutadas;
- pruebas pendientes o manuales;
- riesgos introducidos;
- capturas o evidencia visual cuando cambie UI.
