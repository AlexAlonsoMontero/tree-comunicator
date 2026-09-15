# Flujo de trabajo con GitHub

## Objetivo

Mantener cada cambio pequeño, revisable, trazable a los requisitos y listo para integrarse sin acumular trabajo no comprobado. El flujo de este documento complementa las reglas obligatorias de `AGENTS.md`.

## Ramas

- `main` es la rama integrada y debe permanecer comprobada y potencialmente instalable. No se permite hacer *push* directo.
- Cada issue tiene una rama que nace de la versión actual de `main`:
  - `feature/<numero>-<descripcion-corta>` para funcionalidades.
  - `fix/<numero>-<descripcion-corta>` para correcciones.
  - `docs/<numero>-<descripcion-corta>` para documentación.
- Usar nombres en minúsculas, con guiones y una descripción breve. Ejemplo: `feature/12-navegacion-arbol`.
- No se crea una rama permanente por versión. Una versión se identifica mediante un hito de GitHub, una entrada de `CHANGELOG.md` y una etiqueta Git.
- Solo se creará `release/<version>` durante la estabilización de una versión relevante, como `release/1.0.0`. En ella solo se aceptan correcciones de estabilización, documentación de release y validaciones finales.

## Ciclo de una issue

1. Crear una issue pequeña que describa el resultado, criterios de aceptación, requisitos afectados y riesgos.
2. Asignarla a un hito de versión y aplicar etiquetas de tipo, área, prioridad y riesgo cuando correspondan.
3. Crear la rama desde `main`.
4. Implementar el cambio y las pruebas proporcionadas por la estrategia de pruebas del proyecto.
5. Actualizar la documentación afectada y añadir una entrada breve a `CHANGELOG.md`, dentro de `Unreleased`, si el cambio modifica el producto para sus usuarios o cuidadores.
6. Abrir una pull request que use la plantilla, enlace y cierre la issue, y describa las comprobaciones realizadas.
7. Integrar mediante *squash merge* solo cuando la PR esté revisada y pasen todas las comprobaciones obligatorias.
8. Eliminar la rama remota una vez integrada.

Una issue de exploración puede no requerir una entrada en el changelog si no modifica el producto. Debe explicar explícitamente que no hay cambio publicado.

## Pull requests y comprobaciones

Cada pull request debe:

- Cerrar la issue mediante `Closes #<numero>`.
- Identificar los requisitos `RF`, `RA`, `RD`, `RS` o `RNF` afectados, o declarar que no aplica.
- Incluir pruebas proporcionales al riesgo y mantener la trazabilidad necesaria.
- Pasar tipos, lint, comprobación arquitectónica, pruebas y cobertura antes de integrarse.
- No enviar SMS reales durante pruebas automatizadas.
- Actualizar los documentos de definición o requisitos cuando cambie una decisión funcional o técnica ya confirmada.

La configuración recomendada en GitHub para `main` es requerir pull request y comprobaciones correctas antes de permitir la fusión. La revisión humana se aplicará cuando haya más de una persona colaborando; mientras tanto, la PR conserva el historial y la lista de comprobación.

## Issues, etiquetas e hitos

Etiquetas iniciales recomendadas:

- Tipo: `tipo: funcionalidad`, `tipo: corrección`, `tipo: documentación`, `tipo: investigación`.
- Área: `área: dominio`, `área: aplicación`, `área: infraestructura`, `área: interfaz`, `área: Android`.
- Prioridad: `prioridad: MUST`, `prioridad: SHOULD`, `prioridad: COULD`.
- Riesgo: `riesgo: crítico` para navegación, confirmación, SMS y privacidad.

Los primeros hitos orientativos son `v0.1.0 — Fundamentos`, `v0.2.0 — Comunicación`, `v0.3.0 — Cuidador`, `v0.4.0 — Alertas` y `v1.0.0 — MVP`. La composición exacta de cada hito se confirmará antes de crear sus issues.

## Versiones y changelog

El proyecto comienza sus versiones publicables en `v0.1.0`; `0.0.0` no se usa como rama de desarrollo.

Durante el trabajo normal, todas las entradas se acumulan bajo `## [Unreleased]` en `CHANGELOG.md`. Al completar un hito:

1. Verificar que sus issues estén cerradas y que las comprobaciones completas pasen.
2. Cambiar `Unreleased` por una sección versionada con fecha, por ejemplo `## [0.1.0] - 2026-08-23`.
3. Crear la etiqueta Git anotada `v0.1.0` en el commit integrado de `main`.
4. Publicar la release correspondiente en GitHub.

Para `v1.0.0`, se puede abrir `release/1.0.0` al comenzar la estabilización. Tras validarla, se integra en `main`, se etiqueta `v1.0.0` y se crea la release. Cualquier corrección aplicada durante la estabilización debe quedar también en `main`.

## Definición de terminado

Una issue está terminada cuando su PR está integrada en `main`, cierra la issue, cumple los criterios de aceptación, contiene las pruebas necesarias, actualiza la documentación y el changelog cuando corresponde, y supera todas las comprobaciones exigidas.

## Uso de agentes y skills

Antes de crear o recomendar agentes, subagentes o skills, se avisará al usuario indicando la tarea concreta, el coste y el beneficio esperado. No se crearán sin su solicitud o confirmación expresa.

