---
name: unslop-es
description: Quita los patrones de escritura por IA de textos en español (blog posts, documentación, artículos) y reconstruye la prosa en voz humana, con presets de voz (conciso, cálido, experto, relato). Úsalo cuando el usuario pida "humaniza", "quita el tono de IA", "suena robótico", "suena a ChatGPT", "des-slop", "reescribe más natural", o al revisar/publicar contenido del blog o documentación que contenga tells obvios como "cabe destacar que", "en el mundo actual", "no se trata solo de X, sino de Y". Inspirado en theclaymethod/unslop.
license: MIT
user-invocable: true
argument-hint: "[auditar · reescribir · imitar] [--preset conciso|calido|experto|relato] [texto o archivo]"
metadata:
  inspired-by: theclaymethod/unslop
  version: 1.0.0
---

# unslop-es

Humaniza prosa generada por IA **en español**. Audita primero. Reescribe solo cuando se pide.

El contrato núcleo manda sobre todo lo demás: presets y catálogos aportan voz y
detección, pero ninguno puede anularlo.

## Contrato núcleo

1. **Corta lo que no aporta significado.** Si eliminarlo no cambia el significado, fuera.
2. **Confía en el lector.** No necesita "cabe destacar que" ni "deja que eso resuene".
3. **Los hechos son sagrados.** Números, nombres, fechas, citas textuales, unidades y
   referencias sobreviven intactos. Consciente de magnitud: `$47.3M` no puede convertirse
   en `$47.3 mil millones`, ni `150 km` en `150 millas`.
4. **No hacer daño.** Matices de registro legal/médico/técnico ("podría causar somnolencia",
   "no establece causalidad"), usos literales ("piedra angular" en construcción) y prosa
   ya humana quedan intactos.
5. **Citas exentas por defecto.** Texto entre comillas, blockquotes y bloques de código no
   se escanean: un tutorial que documenta malas escrituras no se marca a sí mismo.
6. **La voz opera bajo este contrato.** Un texto con buena voz que reintroduce un tell es
   un fallo.
7. **Español únicamente.** Si el texto está mayoritariamente en otro idioma, declínalo.

## Routing

Invocación sin comando → `reescribir` (por defecto).

| Comando | Propósito |
|---------|-----------|
| `reescribir` | Dos pasadas: diagnóstico → reconstrucción bajo las reglas → validación. Por defecto. |
| `auditar` | Solo marcar: informe de hallazgos sin tocar el texto. También con "solo revísalo", "antes de publicar", "no cambies nada". |
| `imitar` | Redactar o reescribir siguiendo muestras de escritura propias + preset. |

## Interface

| Argumento | Descripción | Default |
|-----------|-------------|---------|
| `--preset` | Voz: `conciso`, `calido`, `experto`, `relato` | según destino (ver tabla) |
| `--strict` | Fallar si la rúbrica < 32/40 | false |
| Input | Texto a transformar (argumento, ruta de archivo, o pegado) | requerido |

Preset por tipo de contenido cuando no se especifica:

| Contenido | Preset |
|-----------|--------|
| Post de blog | `calido` |
| Documentación de ayuda / guía técnica | `conciso` |
| Artículo de opinión / thought leadership | `experto` |
| Caso de éxito / post personal | `relato` |

Lee el archivo del preset elegido antes de escribir una sola palabra:

- [presets/conciso.md](presets/conciso.md) — directo y económico; docs técnicas
- [presets/calido.md](presets/calido.md) — cercano y conversacional; blog posts
- [presets/experto.md](presets/experto.md) — autoridad ganada; artículos
- [presets/relato.md](presets/relato.md) — narrativo; casos y posts personales

## Flujo reescribir

Dos pasadas separadas. Nunca edites línea a línea durante el diagnóstico.

**Pasada 1 — Diagnóstico.** Lee [references/patrones.md](references/patrones.md) y lista
los hallazgos por familia con severidad (`hard`/`soft`) y cita exacta. Verifica también,
a nivel documento:

- Ritmo uniforme: oraciones todas de longitud parecida; ráfagas de párrafos de una línea.
- Puntuación estructural acumulada: dos puntos como muletilla de empalme (>1 cada ~120
  palabras, salvo enumeraciones legítimas), rayas y exclamaciones repetidas.
- Aperturas conectivas repetidas: párrafos que empiezan sistemáticamente con
  "Además," / "Por otro lado," / "En este sentido," / "Asimismo,".
- Estructura plantilla: historia → significancia → desafíos → perspectivas de futuro;
  simetría anticipo/recapitulación donde el cierre no añade nada.
- Consistencia de registro: mezcla incoherente de "tú"/"usted" o formal/informal.

**Pasada 2 — Reconstrucción.** Reescribe completo bajo el contrato núcleo y el preset.
Reglas mínimas:

- Elimina todo `hard`; elimina `soft` salvo que la voz o el dominio lo justifiquen.
- Sustituye inflación por hechos concretos ya presentes en el original. No inventes datos,
  ejemplos ni citas para "rellenar".
- Varía longitud de oraciones y forma de abrir párrafos.
- Conserva intencionalmente hedges, negaciones y vocabulario de dominio.
- Mantén encabezados en minúscula inicial (salvo nombres propios); español no usa Title Case.

**Validación.** Antes de entregar:

- [ ] Cero tells `hard` restantes
- [ ] Todos los hechos originales preservados (números, nombres, unidades)
- [ ] Ningún dato nuevo inventado
- [ ] Registro coherente de principio a fin
- [ ] Pasa la rúbrica ≥ 32/40 si `--strict`

## Flujo auditar

No modifiques nada. Entrega el informe del formato de abajo: cita exacta, categoría,
severidad, por qué suena a IA, y propuesta concreta. Separa problemas claros de juicios
contextuales.

## Flujo imitar

Cuando el usuario aporta muestras de su escritura (posts previos, correos, notas):

1. Extrae rasgos observables: distribución de longitud de oración, vocabulario recurrente,
   hábitos de puntuación, cómo abre y cierra párrafos, uso de tuteo/usted, anécdotas.
2. Escribe un perfil breve y muéstraselo al usuario para confirmarlo.
3. Redacta/reescribe siguiendo ese perfil + el preset elegido + el contrato núcleo.
4. Un borrador que puntúa bien en voz pero dispara un gate `hard` se rechaza: la voz
   nunca compra exención del contrato.

## Output formats

Reescritura rápida: devuelve solo el texto limpio.

Auditoría (`auditar`):

```markdown
## Hallazgos

- ["cita exacta", categoría, severidad, por qué suena a IA]

## Valoración

- [Problemas claros]
- [Juicios contextuales o dependientes del dominio]
```

Análisis estricto o solicitado:

```markdown
## Texto transformado

[versión humanizada]

## Validación

- Hechos preservados: [X]/[Y]
- Patrones IA restantes: [N] (antes [M])
- Registro: [coherente/incoherente]
- Cambio: [X]% respecto al original
- Rúbrica: [X]/40
```

## Referencias

| Archivo | Cuándo leer |
|---------|-------------|
| [references/patrones.md](references/patrones.md) | Siempre en diagnóstico: catálogo completo de tells en español + protecciones antifalsos positivos. |
| `presets/*.md` | Antes de reescribir: características de voz, patrones estructurales, ejemplos antes/después. |

## Filosofía

- El texto de IA sigue patrones predecibles; no basta con cambiar palabras, hay que
  reestructurar para que lea humano.
- La repetición natural de términos clave es preferible a la variación elegante forzada.
- Si algo es realmente significativo, los hechos lo demuestran solos.
