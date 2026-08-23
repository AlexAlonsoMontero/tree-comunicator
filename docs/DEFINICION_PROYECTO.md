# Definición del proyecto

## 1. Identificación

- **Nombre provisional:** Tree Communicator
- **Tipo de producto:** aplicación Android de comunicación aumentativa y alternativa
- **Plataformas iniciales:** tablet y móvil Android; tablet en orientación horizontal como experiencia prioritaria
- **Compatibilidad mínima:** Android 8.0 (API 26)
- **API objetivo:** Android 16 (API 36)
- **Referencia de diseño y pruebas:** tablet de 10 pulgadas en horizontal; móvil desde 5,5 pulgadas y tablet entre 8 y 13 pulgadas
- **Tecnología confirmada para interfaz:** Ionic Angular y TypeScript
- **Integración nativa confirmada:** Capacitor
- **Base de datos local confirmada:** SQLite
- **Estado:** definición funcional inicial

## 2. Problema

Las personas con dificultades graves de habla pueden necesitar comunicar necesidades básicas, dolor o malestar con rapidez. Una interfaz con demasiadas opciones, texto pequeño, navegación impredecible o dependencia de Internet puede impedir la comunicación precisamente cuando más se necesita.

Los cuidadores también necesitan adaptar el vocabulario a cada persona y recoger información adicional sin convertir la pantalla principal en un cuestionario complejo.

## 3. Objetivo

Construir una aplicación sencilla, predecible, accesible y personalizable que permita:

- Participar en conversaciones y expresar deseos, preferencias, emociones e ideas cotidianas.
- Comunicar necesidades mediante texto, pictogramas y voz.
- Navegar por un árbol de decisiones con cuatro opciones por pantalla.
- Finalizar una frase tan pronto como exprese un mensaje válido.
- Avisar al cuidador por SMS ante dolor o malestar.
- Profundizar posteriormente en una valoración guiada.
- Funcionar sin conexión para todas las funciones esenciales.
- Ampliar opcionalmente el árbol con ayuda de IA.

La aplicación es un comunicador general. La comunicación médica constituye una rama especializada dentro del árbol, no el propósito único ni la estructura dominante del producto.

## 4. Usuarios y roles

### 4.1 Persona comunicadora

Usuario principal de la interfaz accesible. No necesita autenticarse y puede:

- Explorar y confirmar opciones.
- Volver atrás o comenzar de nuevo.
- Escuchar y repetir una opción o frase.
- Enviar alertas configuradas mediante la selección de nodos.
- Solicitar más opciones o ayuda opcional de IA.

El perfil prioritario presenta baja visión y dificultad para pulsar con precisión. Por ello, el sistema debe combinar texto grande, pictogramas y voz, y prevenir activaciones accidentales.

### 4.2 Cuidador o administrador

Accede mediante PIN y puede:

- Modificar el árbol y su contenido.
- Configurar alertas y contactos.
- Gestionar pictogramas, voz, tema y nivel de asistencia.
- Consultar y aprobar sugerencias de prioridad.
- Realizar una valoración guiada a partir de un mensaje.
- Gestionar copias de seguridad locales sin contraseña: árbol, pictogramas, ajustes y contactos SMS, sin historial de uso ni de alertas.

## 5. Principios del producto

1. **Comunicación primero:** una acción importante debe requerir el menor esfuerzo posible.
2. **Funcionamiento offline:** el árbol, la voz instalada, los pictogramas y los datos esenciales son locales.
3. **Prioridad segura:** `Me encuentro mal` permanece fija; los otros accesos principales pueden adaptarse al uso sin ocultar categorías.
4. **Confirmación comprensible:** una pulsación breve anuncia y una pulsación mantenida confirma.
5. **Salida segura:** siempre están disponibles `Atrás`, `Inicio` y `Repetir`.
6. **Final flexible:** un nodo puede completar una frase y ofrecer detalles opcionales.
7. **IA subordinada:** ayuda a comunicar o configurar, pero no diagnostica ni toma decisiones críticas.
8. **Privacidad por defecto:** los datos personales y de salud permanecen localmente salvo consentimiento explícito.

## 6. Experiencia principal

El árbol raíz combinará vocabulario general y funcional: conversación, personas, emociones, deseos, necesidades, actividades, entorno, vida diaria y salud. Los modelos generales de Asterics AAC servirán como referencia de organización y vocabulario. Los tableros de UCI y dolor se utilizarán únicamente para completar la rama `Me encuentro mal`.

### 6.1 Distribución de pantalla

```text
┌─────────────────────────────────────────┐
│ Atrás        Frase actual        Inicio │
├─────────────────────────────────────────┤
│                                         │
│        Opción 1          Opción 2       │
│                                         │
│        Opción 3          Opción 4       │
│                                         │
├─────────────────────────────────────────┤
│ Repetir     Otras opciones  Configuración│
└─────────────────────────────────────────┘
```

La cuadrícula central contiene exclusivamente cuatro opciones de comunicación. La navegación y configuración se sitúan en barras independientes.

`Otras opciones` es un control fijo fuera de la cuadrícula. Permite indicar que ninguna de las cuatro alternativas visibles es adecuada y cargar el siguiente bloque de cuatro opciones del mismo nivel.

En la pantalla principal, `Me encuentro mal` ocupa permanentemente la celda superior izquierda. Las otras tres celdas muestran inicialmente `Necesito algo`, `Baño e higiene` y `Ayuda`; con el uso podrán mostrar las tres categorías más utilizadas. Todas las categorías desplazadas permanecen accesibles mediante `Otras opciones`.

El MVP se diseñará y validará primero para orientación horizontal. La interfaz de móvil reutilizará el mismo modelo y mantendrá los cuatro botones; el soporte específico de orientación vertical se decidirá después de validar el uso principal.

El control de **Configuración** será visible, fuera de las cuatro opciones de comunicación. Para abrirlo será necesaria una pulsación mantenida y un PIN numérico de seis dígitos. Su propósito es evitar cambios accidentales del usuario, no proteger información sensible. La sesión se bloqueará automáticamente tras dos minutos sin actividad y podrá cerrarse manualmente mediante «Salir de configuración».

### 6.2 Interacción con un botón

```text
Pulsación breve
→ foco visual
→ lectura de etiqueta o descripción

Pulsación mantenida sobre el botón enfocado
→ confirmación
→ navegación, finalización de frase o alerta según el nodo
```

La duración de confirmación se configura mediante PIN. Durante la pulsación se mostrará un progreso visual de alto contraste; soltar antes de completar el tiempo cancela la confirmación. Si el usuario toca otro botón antes de confirmar, el foco cambia y se lee la nueva opción.

### 6.3 Ejemplo de árbol

```text
Me encuentro mal
├── Me duele                         [SMS inicial]
│   ├── Cabeza                       [frase válida]
│   ├── Barriga                      [frase válida]
│   │   └── Añadir detalle
│   │       ├── Mucho                [SMS de actualización]
│   │       ├── Poco
│   │       ├── Desde hace horas
│   │       └── No lo sé
│   └── Piernas                      [frase válida]
├── Tengo malestar                   [SMS inicial]
├── Me pica mucho                    [SMS inicial]
└── [existen más categorías accesibles con «Otras opciones»]
```

### 6.4 Final de una comunicación

La profundidad no determina el final. Cada nodo define si:

- Solo agrupa otras opciones.
- Ya forma una frase válida.
- Forma una frase válida y permite detalles opcionales.
- Ejecuta una alerta después de la confirmación.

Al llegar a una frase válida, la aplicación la muestra y la pronuncia. El usuario puede terminar, repetirla, comenzar otro mensaje o añadir detalles.

### 6.5 Otras opciones

Cuando un nivel tenga más de cuatro alternativas, el control fijo `Otras opciones` mostrará cuatro elementos adicionales del mismo nivel sin consumir una celda de comunicación. La aplicación conservará el contexto; `Atrás` permitirá regresar al bloque anterior. Cuando ya no queden alternativas configuradas, el control pasará a `No encuentro mi opción` y ofrecerá el rescate comunicativo local o mediante IA opcional.

## 7. Sistema de alertas SMS

### 7.1 Primer aviso

Al confirmar una opción marcada como dolor o malestar, la aplicación envía inmediatamente un SMS general. El usuario no está obligado a continuar.

```text
ALERTA: la persona indica dolor y necesita atención.
Hora: 15:30.
```

### 7.2 Segundo aviso

Si el usuario continúa y aporta información relevante, se envía un segundo SMS relacionado con la misma alerta.

```text
ACTUALIZACIÓN: indica dolor fuerte en la barriga.
Hora: 15:31.
```

El sistema evita duplicados y limita las actualizaciones según la configuración del cuidador.

Cada alerta puede dirigirse como máximo a dos destinatarios configurados mediante PIN: un cuidador principal y un contacto de respaldo.

El MVP requiere una única SIM activa con capacidad de SMS. La aplicación utilizará la SIM predeterminada del dispositivo y no ofrecerá gestión de doble SIM.

Los historiales de alertas y valoraciones se mantendrán solo 30 días en el dispositivo y se eliminarán automáticamente al superar ese plazo.

Un episodio de alerta dura 30 minutos. Durante ese período se envía un único SMS inicial y, si se añade información relevante, una única actualización. Una repetición del mismo aviso no genera otro SMS, pero un síntoma diferente —por ejemplo, dificultad para respirar después de dolor— puede iniciar un episodio independiente. Al concluir los 30 minutos, una nueva confirmación puede abrir otro episodio.

### 7.3 Estados

Cada intento debe ofrecer confirmación visual y por voz:

- SMS enviado.
- SMS pendiente.
- No se ha podido enviar.
- Dispositivo sin capacidad de telefonía o sin cobertura.

El envío necesita una SIM o servicio de telefonía compatible y puede generar costes según el contrato del usuario. La publicación en Google Play requerirá validar las restricciones vigentes sobre permisos SMS.

## 8. Valoración guiada del cuidador

Tras recibir el aviso, el cuidador puede usar la tablet para ampliar la información:

```text
Mensaje inicial: «Me duele la barriga»

Zona       → superior / centro / inferior / no lo sé
Lado       → izquierdo / derecho / centro / todo
Intensidad → leve / moderado / fuerte / no puede indicarlo
Inicio     → ahora / hace horas / ayer / no lo sé
```

El resultado es un resumen estructurado, fechado y editable. Esta función recopila información comunicada u observada; no realiza diagnóstico médico.

## 9. Personalización y aprendizaje local

El dispositivo registra las frases finalizadas, su frecuencia y su uso reciente. A partir de estos datos calcula prioridades sin necesidad de IA. Solo cuentan selecciones confirmadas que formen parte de una comunicación completada; el foco, las pulsaciones canceladas y la previsualización del cuidador no alteran el resultado.

En la pantalla principal:

- `Me encuentro mal` está fijada permanentemente en la primera posición.
- Las otras tres posiciones se asignan a las categorías con mayor prioridad de uso.
- Las estadísticas se guardan inmediatamente al completar cada comunicación.
- La prioridad se recalcula al arrancar la aplicación o al regresar después de 30 minutos de inactividad.
- La adaptación comienza cuando existen al menos cinco comunicaciones completadas.
- Una categoría candidata debe superar en un 25 % la puntuación de la categoría que sustituiría.
- Solo puede producirse una sustitución por sesión.
- Los cambios se aplican antes de mostrar la pantalla principal, nunca mientras el usuario está comunicándose.
- `Otras opciones` conserva acceso al catálogo completo.

El sistema también puede proponer:

- Convertir una frase frecuente en favorita.
- Acercar una ruta profunda mediante un acceso rápido.
- Revisar opciones que nunca se utilizan.

El cuidador puede fijar otras categorías, desactivar la adaptación, reiniciar las estadísticas o ejecutar `Recalcular ahora`. Los valores iniciales de 30 minutos, cinco comunicaciones y 25 % podrán revisarse tras las pruebas de uso.

## 10. Inteligencia artificial opcional

### 10.1 Configuración

La IA puede proponer una rama inicial a partir de una petición del cuidador, como «añade opciones para problemas respiratorios». El cuidador revisa y aprueba cada cambio antes de guardarlo localmente.

### 10.2 Rescate comunicativo

Cuando el usuario selecciona `No encuentro mi opción`, la aplicación puede solicitar ayuda remota si hay conexión y consentimiento. La respuesta debe ser estructurada, limitada a cuatro alternativas y compatible con el sistema de voz.

Si no hay conexión, se ofrecen rutas locales como `Volver`, `Necesito ayuda`, `No sé explicarlo` o una frase general configurable.

### 10.3 Límites

- La IA no diagnostica.
- La IA no envía alertas autónomamente.
- La IA no modifica el árbol sin aprobación.
- La aplicación es de uso privado y puede consultar directamente al proveedor de IA con una clave aportada por el cuidador. La clave se guarda solo en almacenamiento seguro nativo de Android, no en el código, SQLite ni copias de seguridad.
- Si la aplicación se distribuyera a terceros en el futuro, el consumo directo se sustituirá por un backend intermedio para proteger una clave gestionada por el proyecto.
- La comunicación principal continúa funcionando si el servicio falla.

### 10.4 Proveedor pendiente de selección

La IA no forma parte del núcleo del MVP. Cuando se incorpore, se evaluarán Qwen, MiniMax y DeepSeek con el mismo conjunto de peticiones y un esquema JSON limitado a cuatro alternativas. Qwen será el primer candidato de prueba por su compatibilidad con APIs de estilo OpenAI y su soporte de salida JSON estructurada. No se seleccionará proveedor, modelo ni límite de consumo hasta realizar esa evaluación.

## 11. Identidad visual y accesibilidad gráfica

### 11.0 Catálogo gráfico

ARASAAC será el catálogo principal de pictogramas. Cada recurso incorporado conservará metadatos de autoría, procedencia y licencia. La aplicación permitirá además añadir fotografías y pictogramas propios desde Configuración; estos archivos permanecerán en el almacenamiento local y no se atribuirán a ARASAAC.

### 11.1 Dirección visual

El producto utilizará un tema oscuro y cálido para reducir el deslumbramiento sin caer en fondos negros absolutos. La paleta principal confirmada es:

- Fondo general: `#1A1412`.
- Texto principal: `#FFF7ED`.
- Borde de botones: `#F2E5D5`.
- Foco y progreso de pulsación mantenida: `#FFD166`.
- Fondos de botones: ámbar `#7A3E00`, verde azulado `#005F61`, berenjena `#5A386B` y burdeos `#7C2D2D`.

Los botones mantienen bordes claros y gruesos para separarlos incluso si el usuario no distingue su color de relleno.

El color no identificará por sí solo una función: cada opción incluirá texto, pictograma y descripción sonora.

### 11.2 Legibilidad

- Texto principal grande, de trazo sencillo y peso seminegrita.
- Escala de texto configurable sin romper la cuadrícula.
- Toda opción de comunicación muestra texto grande y pictograma; la voz complementa ambos elementos.
- En la tablet de referencia, los botones principales usan 36 sp seminegrita, los controles fijos 24 sp seminegrita y la frase comunicada 48 sp negrita.
- El modo ampliado aumenta estos valores sin recortar etiquetas ni ocultar controles.
- Frases cortas y vocabulario directo.
- Máximo contraste posible sin deslumbramiento.
- Pictogramas simples, con fondo limpio y contorno visible.

### 11.3 Contraste y separación

- Texto normal: objetivo mínimo 4,5:1 frente al fondo.
- Texto grande: objetivo mínimo 3:1, buscando 4,5:1 cuando sea posible.
- Iconos, bordes y estados esenciales: mínimo 3:1.
- Botones contiguos: contraste suficiente o borde separador de alto contraste.
- El foco se identifica con borde amarillo `#FFD166`, cambio de grosor/escala y audio, no solo con color.

### 11.4 Tamaño e interacción

Android recomienda un objetivo táctil mínimo de 48 × 48 dp. Al ser una aplicación de accesibilidad, los cuatro botones centrales ocuparán una parte sustancial de la pantalla y superarán ampliamente ese mínimo. Los controles de navegación también mantendrán áreas táctiles amplias y separadas.

## 12. Arquitectura prevista

```text
Presentación: Ionic Angular
├── Modo comunicador
├── Modo cuidador
├── Editor del árbol
└── Valoración guiada
        ↓
Aplicación TypeScript
├── Casos de uso: árbol, frases, alertas y priorización
└── Puertos: persistencia, voz, SMS, archivos y reloj
        ↓
Dominio TypeScript puro
├── Entidades, reglas y políticas
└── Sin dependencias de Angular ni Capacitor
        ↓
Infraestructura: adaptadores Capacitor / Android
├── SQLite local (`@capacitor-community/sqlite` 8.x)
├── Text-to-Speech offline (`@capacitor-community/text-to-speech` 8.x)
├── Sistema de archivos local (`@capacitor/filesystem`)
├── Importación de imágenes (`@capacitor/camera`)
├── Plugin SMS propio en Kotlin
├── Plugin propio de almacenamiento seguro con Android Keystore
└── Archivos locales
        ↓ opcional
Consulta directa al proveedor de IA
        (clave privada en almacenamiento seguro Android)
```

Los contratos se definen solo en fronteras reales entre capas, evitando interfaces artificiales. El dominio y los casos de uso no dependen de Ionic, Angular, Capacitor ni de las implementaciones Android.

### 12.1 Estrategia de calidad

- Cobertura global mínima: 80 %.
- Dominio y casos de uso: mínimo 95 %.
- Decisiones y escenarios críticos —pulsación mantenida, atrás/inicio, composición de frases y episodios SMS—: 100 %.
- Vitest para pruebas unitarias y de aplicación; Playwright para los flujos críticos de interfaz.
- Pruebas instrumentadas Android y validación manual guiada en tablet real para SMS, voz offline y pulsación mantenida.
- TypeScript estricto, `angular-eslint` y Prettier para calidad estática y formato.
- `dependency-cruiser` para impedir que dominio o aplicación importen presentación, Capacitor o adaptadores de infraestructura.
- El pre-commit solo verificará formato y lint de los archivos modificados. Antes de integrar cambios se ejecutarán tipos, lint, arquitectura, pruebas y cobertura completos.

## 13. Alcance del MVP

Incluido:

- Aplicación Android instalable para tablet y móvil, priorizando tablet horizontal.
- Cuadrícula de cuatro opciones.
- Árbol local editable.
- Texto, pictogramas y voz offline.
- Pulsación breve de lectura y pulsación mantenida de confirmación.
- Navegación atrás, inicio y repetir.
- PIN de configuración.
- Frases finales y detalles opcionales.
- Primer y segundo SMS.
- Plugin Capacitor propio en Kotlin para SMS, permisos y estado de envío.
- Estadísticas locales básicas.
- Importación y exportación local sin contraseña de árbol, pictogramas, ajustes y contactos SMS; se excluyen historiales, PIN y clave de IA.

Posterior al MVP:

- IA para configuración y rescate comunicativo.
- Valoración corporal gráfica avanzada.
- Barrido automático y pulsadores externos.
- Perfiles múltiples y sincronización opcional.

## 14. Fuera de alcance actual

- WhatsApp.
- Llamadas telefónicas.
- Diagnóstico médico.
- Dependencia obligatoria de la nube.
- Reordenación automática de botones esenciales.
- Envío de SMS decidido por IA.

## 15. Riesgos principales

| Riesgo | Tratamiento inicial |
|---|---|
| Pulsaciones accidentales | Lectura con pulsación breve y confirmación mediante pulsación mantenida configurable |
| Desorientación por cambios | `Me encuentro mal` fija, actualización controlada, umbral de cambio y posibilidad de bloquear categorías |
| Fallo de SMS | Estado hablado/visual, registro del intento y reintento controlado; comprobar SIM activa |
| Falta de Internet | Funciones principales locales y salida offline para IA |
| Interfaz sobrecargada | Cuatro opciones, paginación y detalles opcionales |
| Uso indebido de datos de salud | Datos locales, PIN y exportación explícita |
| Licencia de pictogramas | Conservar autoría, procedencia y licencia de ARASAAC; separar claramente los recursos propios |

## 16. Criterio general de éxito

Una persona debe poder comunicar una necesidad frecuente o lanzar una alerta con pocas confirmaciones, comprender en todo momento qué opción está enfocada y recuperarse de un error sin ayuda externa.
