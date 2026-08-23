# Tree Communicator — instrucciones de trabajo

## Fuente de verdad

Antes de cambiar comportamiento o arquitectura, consulta:

- `README.md`: visión y stack confirmado.
- `docs/DEFINICION_PROYECTO.md`: definición funcional y arquitectura.
- `docs/ANALISIS_REQUISITOS.md`: requisitos identificados `RF`, `RA`, `RD`, `RS` y `RNF`.

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

El dominio y aplicación no importan Angular, Ionic, Capacitor, SQLite ni APIs Android. Crear contratos solo en fronteras reales; evitar interfaces de una sola implementación sin valor.

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

## Calidad y validación

- TypeScript estricto: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` y `noImplicitOverride`.
- Usar `angular-eslint`, Prettier y `dependency-cruiser`.
- Vitest para dominio y aplicación; Playwright para flujos de interfaz críticos.
- Objetivos mínimos: 80 % global, 95 % en dominio/aplicación y 100 % de decisiones críticas de navegación y SMS.
- Validar en tablet Android real los SMS, TTS offline y la pulsación mantenida.
- Antes de integrar cambios, ejecutar tipos, lint, comprobación arquitectónica, pruebas y cobertura. El pre-commit solo debe realizar comprobaciones rápidas de archivos modificados.

## Forma de trabajo

- Preferir cambios pequeños y verificables.
- Mantener nombres y textos de interfaz en español.
- No usar red para funciones centrales ni convertir la IA en dependencia del comunicador.
- No introducir permisos Android, dependencias o servicios externos sin justificarlo y actualizar requisitos/documentación.
- No enviar SMS reales durante pruebas automatizadas; usar adaptadores falsos y pruebas instrumentadas controladas.
