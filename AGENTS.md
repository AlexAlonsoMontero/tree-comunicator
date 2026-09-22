# Tree Communicator — instrucciones de trabajo

## Fuente de verdad

Antes de cambiar comportamiento o arquitectura, consulta:

- `README.md`: visión y stack confirmado.
- `docs/DEFINICION_PROYECTO.md`: definición funcional y arquitectura.
- `docs/ANALISIS_REQUISITOS.md`: requisitos identificados `RF`, `RA`, `RD`, `RS` y `RNF`.
- `docs/GUIA_DESARROLLO.md`: normas de arquitectura, SOLID, Angular/Ionic, SCSS, accesibilidad y validación.

Actualiza los documentos cuando una decisión funcional o técnica cambie. No inventes decisiones pendientes: plantea la propuesta y espera confirmación.

## Producto y alcance

- Comunicador AAC Android privado, offline-first; tablet horizontal como prioridad.
- Cuatro opciones de comunicación por pantalla. Los controles de navegación no ocupan la cuadrícula.
- Cada opción de comunicación requiere texto grande, pictograma y lectura por voz.
- Una pulsación breve enfoca y lee; una pulsación mantenida confirma.
- `Me encuentro mal` siempre ocupa la primera posición de inicio.
- IA opcional y posterior al MVP: nunca diagnostica, nunca envía SMS ni modifica el árbol sin aprobación.

## Arquitectura

Mantener arquitectura hexagonal pragmática:

1. `domain`: TypeScript puro con entidades, reglas y políticas.
2. `application`: casos de uso y puertos.
3. `infrastructure`: adaptadores de SQLite, archivos, TTS, SMS, Keystore y red.
4. `presentation`: Ionic Angular.

El dominio y aplicación no importan Angular, Ionic, Capacitor, SQLite ni APIs Android. Crear contratos solo en fronteras reales; evitar interfaces de una sola implementación sin valor. La estructura base se mantiene bajo `src/app/domain`, `src/app/application`, `src/app/infrastructure` y `src/app/presentation`.

Decisión issue #4: configurar límites y CI primero; no añadir puertos falsos, hooks de pre-commit ni Playwright hasta que existan flujos reales que los justifiquen. CI es la puerta de integración.

Aplica SOLID con criterio práctico: responsabilidades pequeñas, composición antes que herencia, puertos estrechos y dependencia de abstracciones solo cuando exista una frontera real. Evita servicios o componentes que mezclen UI, persistencia, navegación y reglas de negocio.

## Stack confirmado

- Ionic Angular y TypeScript.
- Capacitor para Android.
- `@capacitor-community/sqlite` 8.x para SQLite local.
- `@capacitor/filesystem` para recursos y copias locales.
- `@capacitor/camera` para importar imágenes.
- `@capacitor-community/text-to-speech` 8.x para voz offline.
- Plugins Capacitor propios en Kotlin para SMS y almacenamiento seguro con Android Keystore.

No fijar proveedor, modelo ni límites de IA hasta la evaluación futura definida en la documentación.

## Datos, seguridad y SMS

- El árbol, pictogramas, ajustes, estadísticas e historial son locales.
- Al importar una imagen, copiarla al espacio privado de la app y guardar en SQLite solo un ID o ruta relativa interna; nunca depender de la URI de galería.
- Las copias incluyen árbol, pictogramas, ajustes y contactos SMS; excluyen PIN, clave de IA e historiales.
- El PIN evita cambios accidentales; no es un mecanismo de protección de datos.
- SMS: máximo dos contactos, una SIM activa, primer mensaje inmediato y una actualización por episodio de 30 minutos.
- No implementar llamadas ni WhatsApp.
- Una clave de IA nunca se escribe en código, SQLite, archivos ni copias; usar exclusivamente el plugin respaldado por Android Keystore.

## Angular, Ionic y estilos

- Usar Angular standalone components.
- Mantener nombres y textos visibles de interfaz en español.
- Las páginas Ionic no concentran reglas de negocio; delegan en casos de uso o adaptadores de presentación.
- Respetar safe areas de Android; no dibujar bajo barras del sistema salvo decisión explícita.
- Usar SCSS con metodología BEM para clases de presentación: bloque, `__elemento`, `--modificador`.
- Usar variables CSS para tokens reutilizables: colores, espaciado, radios, bordes, tipografía, sombras, duraciones y z-index.
- Centralizar tokens de producto en `src/theme/variables.scss` siempre que sea razonable; no hardcodear colores repetidos en componentes.
- Reservar `src/global.scss` para imports Ionic, resets mínimos y reglas realmente globales.

## Calidad y validación

- TypeScript estricto: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` y `noImplicitOverride`.
- Usar `angular-eslint`, Prettier y `dependency-cruiser`.
- Vitest para dominio y aplicación; Playwright para flujos de interfaz críticos.
- Objetivos mínimos: 80 % global, 95 % en dominio/aplicación y 100 % de decisiones críticas de navegación y SMS.
- Validar en tablet Android real los SMS, TTS offline y la pulsación mantenida.
- Antes de integrar cambios, ejecutar formato, tipos, lint, comprobación arquitectónica, pruebas, cobertura, sincronización Capacitor y build Android. El pre-commit se añadirá más adelante solo si aporta comprobaciones rápidas de archivos modificados.
- Si una comprobación no puede ejecutarse, indicar el motivo y el comando pendiente.

## Forma de trabajo

- Preferir cambios pequeños y verificables.
- Leer `docs/GUIA_DESARROLLO.md` antes de modificar arquitectura, UI, estilos o comportamiento.
- No usar red para funciones centrales ni convertir la IA en dependencia del comunicador.
- No introducir permisos Android, dependencias o servicios externos sin justificarlo y actualizar requisitos/documentación.
- No enviar SMS reales durante pruebas automatizadas; usar adaptadores falsos y pruebas instrumentadas controladas.
- Dejar evidencia de comandos ejecutados, pruebas pendientes y limitaciones conocidas.
- No cerrar una tarea si queda una prueba crítica fallando o sin ejecutar sin explicación.
