# Tree Communicator

Aplicación general de comunicación aumentativa y alternativa (CAA) para tabletas y móviles Android. Está pensada para personas con dificultades graves de habla y posibles limitaciones visuales o motoras. El soporte prioritario es tablet en orientación horizontal, aunque el mismo proyecto deberá funcionar también en móviles Android.

El producto no está orientado exclusivamente a salud. Debe permitir comunicar deseos, necesidades, emociones, preferencias, relaciones, actividades, conversación cotidiana y, como una rama más, dolor o malestar.

La aplicación permitirá construir mensajes mediante un árbol de opciones con cuatro botones grandes por pantalla. Cada botón combinará texto, pictograma y lectura por voz. El árbol, los pictogramas, las preferencias y el historial permanecerán en el dispositivo para que la comunicación principal no dependa de Internet.

## Estado

Proyecto en fase de definición y análisis de requisitos. Todavía no existe una implementación funcional.

## Funcionamiento previsto

```text
Pantalla principal
├── Me encuentro mal
├── Necesito algo
├── Baño e higiene
└── Ayuda

Ejemplo de comunicación
Me encuentro mal → Me duele → Barriga
Resultado hablado: «Me duele la barriga»
```

- Pulsación breve: enfoca el botón y lee su descripción.
- Pulsación mantenida sobre la opción enfocada: confirma la opción después del tiempo configurado.
- Una frase puede finalizar en cualquier nodo, aunque existan detalles opcionales.
- `Otras opciones`, situado fuera de la cuadrícula, permite mostrar el siguiente bloque de cuatro alternativas del mismo nivel.
- `Atrás`, `Inicio`, `Repetir` y `Otras opciones` permanecen fuera de la cuadrícula de comunicación.
- La configuración se encuentra fuera de las cuatro opciones; se abre con pulsación mantenida, requiere un PIN numérico de seis dígitos para evitar cambios accidentales y se bloquea tras dos minutos sin actividad o al salir manualmente.

## Alertas

Las ramas de dolor o malestar configuradas como alerta enviarán un SMS tras la confirmación del usuario:

1. Primer SMS inmediato con una alerta general.
2. Segundo SMS si el usuario añade información relevante, como zona o intensidad.

No se incluirán llamadas ni integración con WhatsApp.

Cada episodio dura 30 minutos y admite un SMS inicial más una única actualización. El mismo aviso no se repite durante ese período; un síntoma diferente puede abrir otro episodio.

El historial local de alertas y valoraciones se conservará durante 30 días y se eliminará automáticamente al superar ese plazo.

## Accesibilidad visual

- Cuatro botones grandes, separados y con posición predecible.
- Diseño prioritario para tablet en orientación horizontal.
- Texto grande y pictogramas obligatorios en cada opción de comunicación.
- Confirmación mediante pulsación mantenida, con duración ajustable por el cuidador.
- Tamaños base en tablet de 10 pulgadas: 36 sp en botones principales, 24 sp en controles y 48 sp en la frase comunicada.
- Tipografía grande, sencilla y ajustable.
- Tema oscuro cálido como diseño principal.
- Paleta principal: fondo `#1A1412`, texto `#FFF7ED`, borde `#F2E5D5`, foco/progreso `#FFD166` y botones ámbar, verde azulado, berenjena o burdeos.
- Contraste alto entre texto, pictogramas, fondos, bordes y estados.
- El color nunca será el único medio para comunicar significado.
- Los estados de foco y confirmación usarán borde, escala y señal sonora.
- Todos los controles tendrán texto o una descripción accesible.

## Personalización

El cuidador podrá, desde una zona protegida por PIN:

- Crear, editar, ordenar y desactivar nodos del árbol.
- Asignar texto, voz, pictograma, color y comportamiento.
- Marcar nodos como finales, opcionales o generadores de alertas.
- Configurar destinatarios y plantillas de SMS.
- Definir como máximo dos destinatarios activos: cuidador principal y contacto de respaldo.
- Usar una única SIM activa configurada para SMS; el MVP no gestiona doble SIM.
- Consultar sugerencias basadas en las comunicaciones más utilizadas.
- Importar y exportar copias de seguridad locales sin contraseña, con árbol, pictogramas, ajustes y contactos SMS; no incluyen el historial de uso ni de alertas.

`Me encuentro mal` permanecerá siempre visible en la primera posición de la pantalla principal. Los otros tres espacios principales se adaptarán a las categorías más utilizadas a partir de comunicaciones confirmadas. Las categorías restantes seguirán accesibles mediante `Otras opciones`. El cuidador podrá fijar categorías adicionales o desactivar la adaptación.

La adaptación se recalculará al arrancar o al regresar después de 30 minutos de inactividad. Exigirá al menos cinco comunicaciones completadas, una ventaja de prioridad mínima del 25 % y permitirá como máximo una sustitución por sesión.

## Inteligencia artificial

La IA será opcional y nunca necesaria para la comunicación básica. Sus usos previstos son:

- Ayudar al cuidador a crear o ampliar ramas.
- Proponer cuatro alternativas cuando el usuario elija `No encuentro mi opción`.
- Redactar una frase clara a partir de selecciones estructuradas.
- Sugerir que una frase frecuente se convierta en acceso rápido.

La IA no diagnosticará, no enviará SMS por sí sola y no modificará el árbol sin aprobación. El proveedor y el modelo se decidirán cuando se implemente esta función. Qwen será el primer candidato para una prueba; MiniMax y DeepSeek también se evaluarán. La aplicación es de uso privado: el cuidador podrá introducir su propia clave de API, que se guardará exclusivamente mediante almacenamiento seguro nativo de Android. No se incluirá en el código, en la base de datos normal ni en copias de seguridad. La app consultará directamente al proveedor elegido; si en el futuro se distribuye a terceros, este modelo deberá sustituirse por un backend intermedio.

## Tecnología prevista

- Ionic Angular y TypeScript para la interfaz
- Capacitor para integración con Android
- SQLite local mediante `@capacitor-community/sqlite` 8.x para árbol, configuración, estadísticas e historial
- `@capacitor/filesystem` para pictogramas, imágenes propias copiadas al almacenamiento privado y copias de seguridad locales
- `@capacitor/camera` para importar imágenes de la galería; la captura con cámara será opcional
- Motor Text-to-Speech offline mediante `@capacitor-community/text-to-speech` 8.x
- Plugin Capacitor propio en Kotlin para el envío y seguimiento de SMS mediante las APIs Android
- Plugin Capacitor propio en Kotlin con Android Keystore para la futura clave de API de IA

## Arquitectura y calidad

- Arquitectura hexagonal pragmática: dominio, aplicación, puertos, adaptadores de infraestructura y presentación Ionic Angular.
- Principios SOLID sin crear interfaces artificiales: los contratos se definen en fronteras reales, como SMS, voz, persistencia, archivos y reloj.
- Vitest para pruebas unitarias y de casos de uso; Playwright para los flujos críticos de interfaz.
- Cobertura global mínima del 80 %; dominio y aplicación, 95 %; decisiones críticas de navegación y SMS, 100 %.
- Pruebas instrumentadas Android y validación manual guiada en tablet real para SMS, TTS offline y pulsación mantenida.
- TypeScript estricto, `angular-eslint`, Prettier y `dependency-cruiser` para impedir dependencias contrarias a la arquitectura.
- Pre-commit rápido sobre archivos modificados; comprobación completa de tipos, lint, arquitectura, pruebas y cobertura antes de integrar cambios.

## Compatibilidad Android confirmada

- Android mínimo: Android 8.0 (API 26).
- Android objetivo de compilación: Android 16 (API 36).
- Orientación obligatoria del MVP: horizontal.
- Dispositivos: móvil desde 5,5 pulgadas y tablet entre 8 y 13 pulgadas.
- Dispositivo de referencia para diseño y pruebas: tablet de 10 pulgadas.

## Comandos de calidad

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm arch
pnpm test:ci
pnpm coverage
pnpm build
```

`pnpm run ci` ejecuta la puerta local completa, incluyendo sincronización Capacitor y `./gradlew assembleDebug` dentro de `android`. Playwright queda fuera hasta que existan flujos de interfaz reales.

## Documentación

- [Definición del proyecto](docs/DEFINICION_PROYECTO.md)
- [Análisis de requisitos](docs/ANALISIS_REQUISITOS.md)
- [Guía de desarrollo](docs/GUIA_DESARROLLO.md)

## Referencias iniciales

- [Modelos generales de comunicador Asterics AAC](https://aulaabierta.arasaac.org/asterics_grid_modelos_comunicador)
- [Materiales CAA de ARASAAC](https://aulaabierta.arasaac.org/materiales-caa-tableros-de-comunicacion)
- [Tablero para dolores y molestias](https://static.arasaac.org/materials/3460/es/Tablero_de_comunicacion_para_dolores_y_molestias_Color.pdf)
- [Tablero de comunicación de UCI](https://static.arasaac.org/materials/3826/es/Tablero_Comunicacion_UCI_Hospital_Alicante.pdf)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Accesibilidad en aplicaciones Android](https://developer.android.com/guide/topics/ui/accessibility/apps.html)

## Licencias de pictogramas

ARASAAC será el catálogo principal de pictogramas. Los recursos utilizados se descargarán al dispositivo y conservarán su autoría, procedencia y licencia CC BY-NC-SA. El cuidador también podrá añadir fotografías o pictogramas propios, que quedarán asociados exclusivamente al perfil local.
