# Análisis de requisitos

## 1. Alcance del documento

Este documento define los requisitos funcionales, de accesibilidad, datos, seguridad y calidad para la primera versión de Tree Communicator. Los identificadores se utilizarán posteriormente para historias de usuario, pruebas y trazabilidad.

Prioridades:

- **MUST:** imprescindible para el MVP.
- **SHOULD:** importante, puede entrar al final del MVP.
- **COULD:** evolución posterior.

## 2. Requisitos funcionales

El sistema debe cubrir comunicación general. Los requisitos de salud y SMS son un subconjunto especializado y no limitarán el vocabulario del resto del árbol.

### 2.1 Comunicación y navegación

| ID | Prioridad | Requisito | Criterio de aceptación |
|---|---|---|---|
| RF-001 | MUST | La aplicación mostrará hasta cuatro opciones de comunicación por página. | Ninguna página del modo comunicador presenta más de cuatro celdas principales. |
| RF-002 | MUST | Cada opción admitirá texto, descripción de voz, pictograma y color. | El editor permite asignar y guardar los cuatro atributos. |
| RF-003 | MUST | Una pulsación breve enfocará y leerá la opción sin activarla. | Tras una pulsación breve se oye la descripción y no cambia el nivel. |
| RF-004 | MUST | Una pulsación mantenida sobre la opción enfocada la confirmará. | Al completar el tiempo configurado se ejecuta exactamente la acción definida para el nodo. |
| RF-005 | MUST | Soltar antes de completar el tiempo cancelará la confirmación; tocar otra opción cambiará el foco. | No se ejecuta ninguna acción hasta completar la duración configurada. |
| RF-005a | MUST | La duración de confirmación será configurable mediante PIN. | El cuidador modifica el valor y el cambio se aplica a nuevas confirmaciones. |
| RF-006 | MUST | El usuario podrá volver al nivel anterior. | `Atrás` restaura la página y el contexto anteriores. |
| RF-007 | MUST | El usuario podrá regresar al inicio y cancelar el mensaje actual. | `Inicio` solicita/ejecuta la cancelación según la configuración de seguridad. |
| RF-008 | MUST | El usuario podrá repetir la opción enfocada o la frase actual. | `Repetir` produce voz sin modificar el árbol. |
| RF-009 | MUST | Los controles de navegación y `Otras opciones` no ocuparán ninguna de las cuatro celdas. | La cuadrícula conserva sus cuatro espacios independientemente de las barras. |
| RF-010 | MUST | La aplicación paginará niveles con más de cuatro opciones. | `Otras opciones` muestra el siguiente bloque de cuatro elementos del mismo nivel y `Atrás` recupera el anterior. |
| RF-010a | MUST | Cuando no queden más alternativas, el control se convertirá en `No encuentro mi opción`. | El usuario accede a opciones locales de rescate y, si está habilitada, a la ayuda de IA. |
| RF-010b | MUST | `Me encuentro mal` permanecerá siempre visible en la primera celda de la pantalla principal. | El aprendizaje, edición y reinicio de estadísticas no desplazan ni ocultan la categoría. |
| RF-011 | MUST | Un nodo podrá marcarse como frase válida independientemente de su profundidad. | Confirmar un nodo final pronuncia la frase aunque tenga hijos opcionales. |
| RF-012 | MUST | La aplicación compondrá una frase con las partes seleccionadas. | La ruta `Me encuentro mal → Me duele → Barriga` produce una frase configurada coherente. |
| RF-013 | MUST | Una frase final se mostrará en tamaño grande y se pronunciará. | La pantalla final ofrece resultado visual y sonoro. |
| RF-014 | SHOULD | Un nodo final podrá ofrecer detalles opcionales. | El usuario puede terminar o elegir `Añadir detalle`. |
| RF-015 | SHOULD | Existirá una salida local `No encuentro mi opción`. | La opción ofrece alternativas generales aun sin conexión. |
| RF-016 | MUST | El árbol incluirá funciones comunicativas generales. | El catálogo inicial cubre deseos, necesidades, rechazo, emociones, personas, actividades, conversación cotidiana y salud. |
| RF-017 | MUST | La rama médica permanecerá separada del resto del vocabulario. | `Me encuentro mal` puede ampliarse sin convertir otras categorías en cuestionarios médicos. |

### 2.2 Configuración y árbol

| ID | Prioridad | Requisito | Criterio de aceptación |
|---|---|---|---|
| RF-020 | MUST | La configuración estará protegida por un PIN numérico de seis dígitos para prevenir cambios accidentales. | Ningún dato configurable puede modificarse sin PIN válido. |
| RF-021 | MUST | El botón visible de configuración estará fuera de las cuatro opciones principales y exigirá una pulsación mantenida para iniciar el acceso. | No se abre mediante una pulsación breve ni ocupa una celda de comunicación. |
| RF-022 | MUST | La sesión de configuración se bloqueará tras dos minutos sin actividad o al seleccionar «Salir de configuración». | Después del bloqueo vuelve a solicitar PIN. |
| RF-022a | SHOULD | Si se olvida el PIN, se podrá restablecer localmente para volver a configurar el acceso. | El PIN anterior no se recupera ni se muestra. |
| RF-023 | MUST | El cuidador podrá crear, editar, ordenar, duplicar y desactivar nodos. | Los cambios persisten tras reiniciar la aplicación. |
| RF-024 | MUST | El editor distinguirá categoría, mensaje final y acción de alerta. | Cada comportamiento puede configurarse y probarse. |
| RF-025 | MUST | El cuidador podrá fijar categorías adicionales y activar o desactivar la adaptación. | La priorización no desplaza un nodo fijado y respeta la preferencia guardada. |
| RF-026 | MUST | El cuidador podrá previsualizar y escuchar una rama antes de publicarla. | La previsualización no modifica estadísticas ni envía SMS. |
| RF-027 | SHOULD | El cuidador podrá configurar un tema y el tamaño de texto. | Los cambios se aplican sin perder contenido ni controles. |
| RF-029 | MUST | El cuidador podrá configurar el tiempo de pulsación mantenida. | El ajuste requiere PIN y ofrece una prueba antes de guardarse. |
| RF-028 | SHOULD | El cuidador podrá importar y exportar una copia local sin contraseña. | La copia incluye árbol, pictogramas, ajustes y contactos SMS; excluye los historiales de uso y alertas. |

### 2.3 Alertas SMS

| ID | Prioridad | Requisito | Criterio de aceptación |
|---|---|---|---|
| RF-030 | MUST | Un nodo podrá configurarse para enviar el primer SMS tras su confirmación. | Confirmar `Me duele` envía un aviso sin exigir más navegación. |
| RF-031 | MUST | El primer SMS incluirá mensaje, fecha y hora. | El destinatario recibe la plantilla con los valores resueltos. |
| RF-032 | MUST | La aplicación enviará un segundo SMS si aparecen detalles relevantes. | Añadir zona o intensidad genera una única actualización relacionada. |
| RF-033 | MUST | Un episodio de alerta durará 30 minutos. | El mismo aviso no abre un nuevo episodio durante ese intervalo. |
| RF-033a | MUST | Cada episodio enviará un único SMS inicial y una única actualización. | Las selecciones posteriores equivalentes no generan más mensajes. |
| RF-033b | MUST | Un síntoma diferente podrá abrir un episodio independiente. | Confirmar una alerta distinta permite enviar su SMS inicial aunque exista un episodio activo. |
| RF-034 | MUST | El resultado del envío se comunicará visualmente y por voz. | Éxito y error tienen mensajes distintos y comprensibles. |
| RF-035 | MUST | Los destinatarios solo podrán editarse con PIN. | El modo comunicador no permite cambiar números. |
| RF-035a | MUST | Cada alerta tendrá como máximo dos destinatarios: cuidador principal y contacto de respaldo. | El editor no permite configurar un tercer destinatario activo. |
| RF-035b | MUST | El MVP requerirá una SIM activa configurada para SMS. | La configuración detecta la capacidad de SMS y permite enviar un mensaje de prueba. |
| RF-035c | MUST | El MVP no gestionará doble SIM. | El plugin usa la suscripción SMS predeterminada del dispositivo sin solicitar permisos para enumerar SIM. |
| RF-036 | MUST | El sistema detectará si el dispositivo no admite SMS. | La interfaz informa del problema y no confirma falsamente el envío. |
| RF-037 | MUST | La IA no podrá iniciar un envío de SMS. | Solo la confirmación de un nodo local configurado activa la acción. |
| RF-039 | MUST | El envío SMS se implementará mediante un plugin Capacitor propio en Kotlin. | La interfaz TypeScript expone envío, comprobación de capacidad y estado sin depender de un plugin de terceros. |

### 2.4 Valoración del cuidador

| ID | Prioridad | Requisito | Criterio de aceptación |
|---|---|---|---|
| RF-040 | SHOULD | El cuidador podrá ampliar una comunicación de dolor. | Desde la frase se abre una valoración tras introducir el PIN. |
| RF-041 | SHOULD | La valoración admitirá zona, lado, intensidad, inicio y observaciones. | Los campos pueden completarse o marcarse como desconocidos. |
| RF-042 | SHOULD | Se generará un resumen fechado y editable. | El resultado diferencia datos comunicados de observaciones del cuidador. |
| RF-043 | MUST | La función no presentará diagnósticos médicos. | No existe salida que afirme enfermedad o causa clínica. |

### 2.5 Priorización y estadísticas

| ID | Prioridad | Requisito | Criterio de aceptación |
|---|---|---|---|
| RF-050 | MUST | Se registrarán localmente las comunicaciones completadas. | Cada registro incluye ruta y fecha, sin contabilizar focos, cancelaciones ni previsualizaciones. |
| RF-051 | MUST | Se calculará prioridad por frecuencia y uso reciente. | El cálculo funciona sin Internet y puede explicarse en configuración. |
| RF-052 | MUST | `Me encuentro mal` no podrá ser desplazada por la priorización. | Permanece en la celda superior izquierda con cualquier historial de uso. |
| RF-053 | MUST | Las otras tres celdas principales podrán mostrar automáticamente las categorías más utilizadas. | La adaptación ocurre fuera de una comunicación activa y todas las categorías desplazadas siguen en `Otras opciones`. |
| RF-053a | MUST | La adaptación se recalculará al arrancar o al regresar después de 30 minutos de inactividad. | No cambia durante una comunicación activa ni en retornos inferiores al tiempo definido. |
| RF-053b | MUST | La adaptación exigirá al menos cinco comunicaciones completadas y una ventaja mínima del 25 %. | Con una muestra o diferencia inferior no se sustituye ninguna categoría. |
| RF-053c | MUST | Solo podrá sustituirse una categoría principal por sesión. | Un recálculo produce cero o una sustitución, nunca más. |
| RF-054 | SHOULD | Las estadísticas podrán borrarse. | Tras confirmar con PIN desaparece el historial de uso. |
| RF-055 | MUST | El cuidador podrá fijar categorías adicionales, desactivar la adaptación o ejecutar `Recalcular ahora`. | La configuración requiere PIN y se conserva después de reiniciar. |

### 2.6 Inteligencia artificial

| ID | Prioridad | Requisito | Criterio de aceptación |
|---|---|---|---|
| RF-060 | COULD | La IA ayudará a proponer nuevas ramas en configuración. | Devuelve un borrador editable que no se activa automáticamente. |
| RF-061 | COULD | La IA podrá ofrecer hasta cuatro opciones de rescate comunicativo. | La respuesta remota se valida y representa como máximo cuatro botones. |
| RF-062 | MUST | El fallo o ausencia de IA no bloqueará la comunicación principal. | Sin red siguen disponibles árbol, voz local y alertas SMS. |
| RF-063 | MUST | La clave privada de API no se incluirá en el código, SQLite ni copias de seguridad. | El cuidador la introduce y se guarda mediante un plugin Capacitor propio en Kotlin respaldado por Android Keystore. |
| RF-064 | MUST | La IA no diagnosticará ni decidirá alertas. | Las instrucciones, validación y UI excluyen esas acciones. |
| RF-065 | COULD | Una propuesta aprobada podrá guardarse como rama local. | Después de aprobarla funciona sin conexión. |
| RF-066 | COULD | Antes de elegir proveedor se evaluarán Qwen, MiniMax y DeepSeek con el mismo conjunto de pruebas. | La comparación valida respuesta JSON, límite de cuatro alternativas, idioma español, latencia, coste y fallos. |

## 3. Requisitos gráficos y de accesibilidad

| ID | Prioridad | Requisito | Criterio de aceptación |
|---|---|---|---|
| RA-001 | MUST | La interfaz principal utilizará una cuadrícula 2 × 2. | Los cuatro botones aprovechan el espacio disponible sin desplazamiento. |
| RA-002 | MUST | El diseño principal será oscuro y cálido. | Usa `#1A1412` como fondo, `#FFF7ED` como texto y `#F2E5D5` como borde principal. |
| RA-003 | MUST | El texto normal tendrá contraste mínimo 4,5:1. | Una herramienta automática valida todas las combinaciones activas. |
| RA-004 | MUST | Texto grande, iconos, bordes y estados esenciales tendrán contraste mínimo 3:1. | Todas las variantes y estados cumplen el umbral. |
| RA-005 | MUST | Los botones adyacentes serán distinguibles. | Tienen contraste suficiente entre sí o un borde separador ≥ 3:1 con ambos fondos. |
| RA-006 | MUST | El color no será la única señal. | Cada función usa texto/pictograma y los estados incorporan borde, forma o audio. |
| RA-007 | MUST | La opción enfocada tendrá un indicador inequívoco. | Se aplica borde `#FFD166`, cambio visual adicional y lectura sonora. |
| RA-008 | MUST | La opción confirmada se diferenciará del simple foco. | La animación/estado y el mensaje de voz no pueden confundirse. |
| RA-008a | MUST | La pulsación mantenida mostrará el progreso de confirmación. | Un indicador de alto contraste crece durante la pulsación y se cancela al soltar. |
| RA-009 | MUST | Los botones centrales superarán 48 × 48 dp. | La inspección de layout confirma objetivos mucho mayores al mínimo Android. |
| RA-010 | MUST | Los controles secundarios tendrán como mínimo 48 × 48 dp táctiles. | Las áreas no se solapan y pasan la comprobación de accesibilidad. |
| RA-011 | MUST | La tipografía será grande, sencilla y ajustable. | En tablet de referencia: 36 sp seminegrita en botones principales, 24 sp en controles y 48 sp negrita en la frase comunicada. |
| RA-011a | MUST | Existirá un modo de texto ampliado. | Al aumentar los tamaños no se recortan etiquetas ni se ocultan acciones. |
| RA-012 | MUST | Cada opción de comunicación incluirá pictograma, texto grande y alternativa sonora. | La comunicación es posible si el pictograma no se distingue. |
| RA-013 | MUST | La posición de navegación será consistente. | `Atrás`, `Inicio` y `Repetir` no cambian entre niveles. |
| RA-014 | MUST | La interfaz no dependerá de gestos complejos. | Todos los flujos principales se completan tocando controles visibles. |
| RA-015 | SHOULD | El usuario podrá seleccionar alto contraste reforzado. | El tema alternativo mantiene el layout y aumenta la separación luminosa. |
| RA-016 | MUST | El MVP funcionará correctamente en orientación horizontal. | En tablet horizontal no se solapan controles, no se requiere desplazamiento y se mantienen cuatro opciones principales. |
| RA-017 | SHOULD | La orientación vertical se evaluará tras las pruebas iniciales. | Si se incorpora, mantiene las funciones esenciales sin alterar la navegación. |
| RA-018 | SHOULD | El diseño se validará con TalkBack y Switch Access. | Los controles tienen nombre, rol, estado y orden coherente. |
| RA-019 | MUST | ARASAAC será el catálogo principal de pictogramas. | Cada recurso conserva autoría, procedencia y licencia en sus metadatos. |
| RA-020 | MUST | El cuidador podrá añadir imágenes propias. | La imagen se copia al almacenamiento privado de la aplicación y queda disponible sin conexión aunque se borre el original. |
| RA-020a | MUST | La importación de imágenes propias usará `@capacitor/camera` para seleccionar desde la galería. | La captura con cámara podrá habilitarse como opción adicional. |

## 4. Requisitos de datos y funcionamiento offline

| ID | Prioridad | Requisito | Criterio de aceptación |
|---|---|---|---|
| RD-001 | MUST | Árbol, configuración, estadísticas e historial residirán en SQLite local mediante `@capacitor-community/sqlite` 8.x. | La aplicación navega y edita en modo avión. |
| RD-002 | MUST | Los pictogramas activos estarán almacenados localmente. | Todas las rutas configuradas muestran sus imágenes sin red. |
| RD-002a | MUST | Los pictogramas, imágenes propias y copias de seguridad usarán el sistema de archivos privado mediante `@capacitor/filesystem`. | No requieren permisos amplios de almacenamiento y permanecen disponibles sin conexión; SQLite conserva un identificador o ruta relativa interna, nunca la URI original de galería. |
| RD-003 | MUST | La voz esencial funcionará con el motor offline de Android mediante `@capacitor-community/text-to-speech` 8.x. | Las frases se reproducen en modo avión tras preparar el dispositivo. |
| RD-004 | MUST | Cada nodo tendrá un identificador estable. | Reordenar o renombrar no rompe relaciones ni estadísticas. |
| RD-005 | MUST | Las migraciones de base de datos conservarán la configuración. | Una prueba de actualización mantiene árbol, contactos y preferencias. |
| RD-006 | SHOULD | La copia exportada tendrá versión de esquema. | La importación detecta versiones incompatibles y no corrompe los datos; la copia contiene árbol, pictogramas, ajustes y contactos SMS, sin historiales. |
| RD-007 | MUST | Los intentos y resultados de alerta se registrarán localmente. | El cuidador puede comprobar hora y estado sin guardar el contenido indefinidamente. |
| RD-008 | MUST | El historial de alertas y valoraciones se conservará durante 30 días. | Al superar el plazo, los registros se eliminan automáticamente del dispositivo. |

## 5. Requisitos de seguridad y privacidad

| ID | Prioridad | Requisito | Criterio de aceptación |
|---|---|---|---|
| RS-001 | MUST | El PIN no se almacenará en texto claro. | Se guarda una derivación criptográfica con sal y parámetros apropiados; es una medida funcional contra cambios accidentales. |
| RS-002 | MUST | Los números de teléfono estarán protegidos por el área de configuración. | No son editables ni visibles innecesariamente en modo comunicador. |
| RS-003 | MUST | La exportación requerirá acción explícita del cuidador. | No existe sincronización automática en el MVP. |
| RS-004 | MUST | La aplicación solicitará únicamente permisos necesarios. | Cada permiso está asociado a una función y tiene explicación contextual. |
| RS-005 | MUST | Los datos enviados a IA se minimizarán. | No se envían nombre, teléfono ni historial completo salvo configuración explícita. |
| RS-006 | MUST | El borrado de datos requerirá PIN y confirmación. | No puede activarse desde el modo comunicador. |
| RS-007 | MUST | La clave de IA se excluirá de las exportaciones. | Una copia restaurada exige volver a introducir la clave. |
| RS-008 | MUST | Las copias de seguridad no incluirán el PIN. | Una restauración no revela ni reutiliza el secreto anterior y no requiere contraseña de respaldo. |

## 6. Requisitos no funcionales

| ID | Prioridad | Requisito | Criterio de aceptación |
|---|---|---|---|
| RNF-001 | MUST | La navegación local responderá inmediatamente. | Objetivo: respuesta visual en ≤ 100 ms y comienzo de voz en ≤ 500 ms en dispositivo de referencia. |
| RNF-002 | MUST | La aplicación será utilizable sin cuenta de usuario. | La primera configuración crea un perfil local. |
| RNF-003 | MUST | El modo comunicador no mostrará publicidad. | No existen SDK ni superficies publicitarias. |
| RNF-004 | MUST | Un fallo de IA no cerrará ni bloqueará la aplicación. | La petición se cancela y se presenta una salida local. |
| RNF-005 | MUST | Los errores se expresarán en lenguaje claro y por voz cuando afecten al usuario. | Los fallos de voz/SMS tienen mensajes accionables. |
| RNF-006 | SHOULD | La arquitectura permitirá pruebas del motor del árbol sin Android. | La lógica de dominio TypeScript no depende de componentes Ionic. |
| RNF-007 | MUST | La aplicación admitirá tablet y móvil Android en orientación horizontal. | Los layouts definidos no superponen controles en tamaños soportados. |
| RNF-008 | MUST | El proyecto mantendrá trazabilidad entre requisitos y pruebas. | Las pruebas referencian los identificadores RF/RA/RD/RS/RNF. |
| RNF-009 | MUST | La aplicación requerirá Android 8.0/API 26 o posterior. | No se instala en API inferiores y se prueba en API 26 y una versión reciente. |
| RNF-010 | MUST | La compilación se dirigirá a Android 16/API 36. | La configuración Gradle declara `targetSdk` y `compileSdk` 36. |
| RNF-011 | MUST | La referencia visual será una tablet de 10 pulgadas en horizontal. | Las pruebas de diseño incluyen este tamaño, móvil desde 5,5 pulgadas y tablet entre 8 y 13 pulgadas. |
| RNF-012 | MUST | La arquitectura seguirá un enfoque hexagonal pragmático. | Dominio y aplicación no dependen de Ionic, Angular, Capacitor ni adaptadores concretos; los servicios externos se consumen mediante puertos. |
| RNF-013 | MUST | El proyecto aplicará SOLID sin interfaces artificiales. | Los contratos se limitan a fronteras reales: persistencia, voz, SMS, archivos, almacenamiento seguro y reloj. |
| RNF-014 | MUST | La cobertura global será como mínimo del 80 %, y la del dominio y aplicación del 95 %. | El informe de Vitest cumple ambos umbrales en CI. |
| RNF-015 | MUST | Las decisiones críticas de navegación y alertas tendrán cobertura completa. | Las pruebas cubren el 100 % de decisiones y escenarios de pulsación mantenida, atrás/inicio, composición de frase y episodios SMS. |
| RNF-016 | MUST | Los adaptadores Android se validarán con pruebas instrumentadas y tablet real. | SMS, TTS offline y pulsación mantenida superan una lista de verificación en dispositivo. |
| RNF-017 | MUST | TypeScript usará configuración estricta. | Están activos `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` y `noImplicitOverride`. |
| RNF-018 | MUST | El proyecto usará `angular-eslint` y Prettier sin reglas de formato duplicadas. | El lint no informa conflictos de formato gracias a `eslint-config-prettier`. |
| RNF-019 | MUST | Las dependencias entre capas se comprobarán automáticamente. | `dependency-cruiser` impide que dominio o aplicación importen Ionic, Angular, Capacitor o infraestructura. |
| RNF-020 | MUST | Antes de integrar cambios se ejecutarán tipos, lint, arquitectura, pruebas y cobertura completos. | La comprobación falla si alguno de estos pasos o los umbrales de cobertura no se cumplen. |

## 7. Modelo conceptual mínimo

```ts
type NodeAction = 'none' | 'initial-sms' | 'update-sms';

interface CommunicationNode {
  id: string;
  parentId: string | null;
  label: string;
  speechText: string;
  phrasePart?: string;
  pictogramPath?: string;
  colorToken?: string;
  position: number;
  enabled: boolean;
  lockedPosition: boolean;
  canFinish: boolean;
  hasOptionalDetails: boolean;
  action: NodeAction;
}
```

El modelo definitivo deberá separar el árbol lógico de la paginación visual. `Otras opciones` es un control de navegación generado por la interfaz, no un nodo de contenido del árbol.

## 8. Reglas de negocio principales

1. Solo se registra uso cuando se confirma una opción o termina una frase.
2. Una pulsación breve nunca navega ni envía un SMS; la confirmación requiere mantener pulsado el tiempo configurado.
3. Un nodo final puede tener hijos opcionales.
4. El primer SMS se envía una sola vez por episodio de alerta.
5. El segundo SMS solo se envía si añade información configurada como relevante.
6. La IA nunca inicia alertas ni modifica datos activos sin aprobación.
7. `Me encuentro mal` conserva siempre su posición; los demás elementos fijados por el cuidador tampoco se desplazan.
8. `Atrás` debe recuperar el estado anterior sin perder información confirmada indebidamente.
9. El modo avión no impide construir ni pronunciar frases, siempre que la voz offline esté instalada.

## 9. Pruebas de aceptación prioritarias

### PA-001: comunicación básica

1. Abrir la aplicación sin Internet.
2. Realizar una pulsación breve sobre `Me encuentro mal`.
3. Verificar lectura sin navegación.
4. Mantener pulsado hasta confirmar.
5. Seleccionar `Me duele` y después `Barriga` del mismo modo.
6. Verificar que se muestra y pronuncia «Me duele la barriga».

### PA-002: corrección de error

1. Enfocar una opción incorrecta.
2. Enfocar y confirmar otra opción.
3. Pulsar `Atrás`.
4. Verificar que el usuario vuelve al nivel esperado y puede continuar.

### PA-003: alerta en dos tiempos

1. Confirmar `Me duele`.
2. Verificar el primer SMS y su confirmación por voz.
3. Confirmar `Barriga` y `Mucho`.
4. Verificar un único SMS de actualización con la nueva información.

### PA-004: contraste y foco

1. Validar tokens de los temas con herramienta de contraste.
2. Recorrer todos los estados de botones.
3. Verificar ratios RA-003 a RA-005.
4. Comprobar que foco y confirmación se distinguen sin depender del color.

### PA-005: protección de configuración

1. Intentar abrir configuración desde el modo comunicador.
2. Introducir un PIN incorrecto.
3. Verificar que no puede modificarse ningún dato.
4. Acceder con PIN correcto, editar una opción y bloquear la sesión.
5. Verificar que el cambio persiste y vuelve a solicitar PIN.
6. Verificar que, tras dos minutos sin actividad, la sesión queda bloqueada.

## 10. Decisiones pendientes

- Plugin o implementación nativa para SMS y compatibilidad con Google Play.
- Selección final de proveedor, modelo y límites de consumo de IA después de una prueba comparativa entre Qwen, MiniMax y DeepSeek.

## 11. Fuentes de referencia

- [Modelos generales de comunicador Asterics AAC](https://aulaabierta.arasaac.org/asterics_grid_modelos_comunicador)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Contraste mínimo de texto](https://www.w3.org/WAI/WCAG22/Techniques/general/G18)
- [Contraste no textual](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)
- [Separación entre colores adyacentes](https://www.w3.org/WAI/WCAG22/Techniques/general/G209.html)
- [Accesibilidad en aplicaciones Android](https://developer.android.com/guide/topics/ui/accessibility/apps.html)
- [Materiales CAA de ARASAAC](https://aulaabierta.arasaac.org/materiales-caa-tableros-de-comunicacion)
- [Tablero de comunicación de UCI](https://static.arasaac.org/materials/3826/es/Tablero_Comunicacion_UCI_Hospital_Alicante.pdf)
