# Catálogo de patrones IA en español

Patrones predecibles del texto generado por IA en español, organizados por familia.
Severidad: `hard` = siempre un tell; `soft` = guardián de registro que la voz real puede
justificar. Las citas entrecomilladas, blockquotes y bloques de código están exentos por
defecto (ver contrato núcleo).

## Tabla de contenidos

1. [Aperturas de despeje](#aperturas-de-despeje)
2. [Muletillas de énfasis](#muletillas-de-énfasis)
3. [Inflación de significancia](#inflación-de-significancia)
4. [Agencia falsa](#agencia-falsa)
5. [Paralelismos negativos](#paralelismos-negativos)
6. [Definiciones contrastivas](#definiciones-contrastivas)
7. [Preguntas retóricas autorespondidas](#preguntas-retóricas-autorespondidas)
8. [Residuos de chatbot](#residuos-de-chatbot)
9. [Atribución vaga](#atribución-vaga)
10. [Concesiones falsas](#concesiones-falsas)
11. [Conclusiones genéricas positivas](#conclusiones-genéricas-positivas)
12. [Gerundios de análisis superficial](#gerundios-de-análisis-superficial)
13. [Jerga corporativa y anglicismos](#jerga-corporativa-y-anglicismos)
14. [Vocabulario típico de IA](#vocabulario-típico-de-ia)
15. [Relleno y muletillas](#relleno-y-muletillas)
16. [Variación elegante](#variación-elegante)
17. [Estructura macro](#estructura-macro)
18. [Puntuación](#puntuación)
19. [Encabezados y ritmo](#encabezados-y-ritmo)
20. [Protecciones antifalsos positivos](#protecciones-antifalsos-positivos)

---

## Aperturas de despeje

Retrasan llegar al punto. Cortarlas por completo.

| Frase | Por qué es mala | Severidad |
|-------|-----------------|-----------|
| "En el mundo actual/de hoy" | Relleno de época | hard |
| "En la era digital" | Igual | hard |
| "En un mundo donde..." | Calco de "In a world where" | hard |
| "Cabe destacar/cabe mencionar/cabe señalar" | Solo destaca; no anuncies | hard |
| "Es importante destacar/resaltar/mentionar que" | Si importa, se nota | hard |
| "Vale la pena señalar que" | Señálalo directamente | hard |
| "La verdad incómoda es que" | Drama innecesario | hard |
| "Seamos claros" / "Permíteme ser claro" | Posicionamiento defensivo | hard |
| "La realidad es que" / "La verdad es que" | Implica engaño previo | hard |
| "Resulta que" | Cobertura hedging | soft |
| "Profundicemos en..." / "Exploremos..." / "Analicemos en detalle" | Relleno de taller | hard |
| "Vamos a sumergirnos" | Calco de "let's dive in" | hard |
| "Aquí está la clave:" | Retrasa el contenido | hard |
| "Sin más preámbulos" (tras tres párrafos de preámbulo) | Autocontradictorio | hard |
| "Hoy en día" | Muy común también en habla natural; solo si se repite o abre el texto | soft |

## Muletillas de énfasis

Fabrican importancia. El contenido debería bastar.

| Frase | Por qué es mala | Severidad |
|-------|-----------------|-----------|
| "Punto." / "Y punto." | Finalidad performativa | hard |
| "Deja que eso resuene." | Condescendiente | hard |
| "Que eso quede claro." | Igual | hard |
| "Vuelve a leerlo." | Condescendiente | hard |
| "No te equivoques" / "No me malinterpretes" | Posicionamiento dramático | hard |
| "Esto no se puede subestimar/sobreestimar" | Sobreenfatiza lo obvio | hard |
| "Esto es importante." | Delata inseguridad en el contenido | hard |
| "sin duda alguna" / "sin lugar a dudas" | Intensificador vacío (si se repite) | soft |

## Inflación de significancia

Gravedad fabricada. Si algo es realmente significativo, los hechos lo muestran.

| Frase | Reemplazo | Severidad |
|-------|-----------|-----------|
| "se erige como un testimonio/ejemplo de" | usa "es", o muestra el hecho | hard |
| "constituye un testimonio de" | igual | hard |
| "momento crucial/histórico/decisivo/de inflexión" | casi nunca lo es; di qué cambió | soft |
| "legado perdurable/duradero" | di qué persistió concretamente | hard |
| "rico tapiz de" / "diverso mosaico de" | metáfora cliché de IA | hard |
| "piedra angular/fundamental de" | inflación (salvo uso literal en construcción) | hard |
| "desempeña/juega un papel crucial/vital/fundamental" | el marco académico canónico de IA; di qué hace | hard |
| "deja una huella imborrable" | gravitas cliché | hard |
| "enorme potencial" / "gran promesa" | promesa vacía sin especificar | soft |
| "a pasos agigantados" | cliché de crecimiento | soft |
| "revolucionario" / "innovador" / "vanguardista" | superlativos no ganados | soft |

## Agencia falsa

Da agencia retórica a cosas inanimadas para afirmar significancia sin hacer la afirmación.

| Frase | Arreglo | Severidad |
|-------|---------|-----------|
| "los números hablan por sí solos" | di qué muestran los números | hard |
| "los datos cuentan una historia" / "pintan un panorama claro" | enuncia el hallazgo | hard |
| "los resultados hablan por sí mismos" | interpreta tú: "Los ingresos se duplicaron" > "los resultados hablan..." | hard |
| "el mercado ha hablado" | igual | soft |
| Antropomorfismo de herramienta: "la plataforma decide", "el sistema quiere" | nombra el mecanismo: qué hace, a qué | soft |

Excepción: roles humanos ("el juez decide el caso") no son tool-nouns.

## Paralelismos negativos

"No es X, sino Y": simulan insight fabricando contraste.

| Patrón | Arreglo | Severidad |
|--------|---------|-----------|
| "no se trata solo de X, sino de Y" | di directamente de qué se trata | hard |
| "no es X, es Y" (como estructura retórica) | enuncia Y sin el andamiaje | hard |
| "no solo... sino también..." | enuncia ambos puntos directamente | soft |
| "más que una X, es una Y" | di qué es | hard |
| "Sin X, sin Y. Solo Z." | negaciones apiladas para drama falso | hard |
| "No X. Más bien Y." | evitación de cópula + contraste binario | hard |

Ver excepciones legítimas en [Definiciones contrastivas](#definiciones-contrastivas).

## Definiciones contrastivas

El molde "afirmar negando un contrincante". Correcciones factuales genuinas pueden
parecer iguales, así que quedan exentas:

- Imperativas: "Usa pnpm, no npm."
- Numéricas: "La latencia bajó 40%, no 4%."
- Autenticación: "El cuadro es auténtico, no una copia."

| Patrón | Arreglo |
|--------|---------|
| "X no es una Y, es una Z" | di qué es Z directamente |
| "El problema no es X, es Y" | "el problema es Y" |

Severidad: soft (por las exenciones).

## Preguntas retóricas autorespondidas

Frenan en lugar de avanzar.

| Patrón | Arreglo | Severidad |
|--------|---------|-----------|
| "¿Por qué es esto importante? Porque..." | di la respuesta directamente | hard |
| "¿Qué significa esto para...?" | díselo al lector | hard |
| "¿Por qué deberías importarte?" | cebo de engagement | hard |
| "¿Y ahora qué?" | transición vacía (salvo sección deliberada) | soft |

## Residuos de chatbot

Frases de interacción con chatbot que no pertenecen a texto publicado.

| Frase | Severidad |
|-------|-----------|
| "¡Espero que esto te ayude!" / "Espero que esta información sea útil" | hard |
| "¡Por supuesto!" / "¡Claro!" / "¡Cierto!" como apertura de compliance | hard |
| "¡Excelente pregunta!" / "Buena observación" | hard |
| "No dudes en preguntar si necesitas algo más" | hard |
| "Como modelo de lenguaje de IA" / "hasta donde llega mi conocimiento" | hard |
| "basándome en la información disponible" | hard |
| "Estoy encantado de ayudarte" | hard |

## Atribución vaga

Atribuyen afirmaciones a fuentes sin nombre, creando ilusión de autoridad.

| Frase | Arreglo | Severidad |
|-------|---------|-----------|
| "Los expertos afirman/sostienen" | ¿qué expertos? Nómbralos o corta | hard |
| "Los estudios demuestran/señalan que" | cita el estudio | hard |
| "Algunos críticos argumentan" | ¿quiénes? | hard |
| "Según expertos" | nómbralos | hard |
| "Cada vez más voces aseguran" | weasel wording | hard |
| "Investigaciones indican que" (sin fuente) | atribuye o corta; "nuestra investigación indica" sí vale | soft |
| "se considera ampliamente que" | ¿por quién? | soft |

## Concesiones falsas

Simulan equilibrio sin decir nada preciso.

| Patrón | Arreglo | Severidad |
|--------|---------|-----------|
| "Si bien X es prometedor, Y sigue siendo un desafío" | nombra el tradeoff real | hard |
| "Aunque X ha avanzado mucho, aún queda camino por recorrer" | igual | hard |
| "no está exento de desafíos" / "no obstante, quedan retos pendientes" | concesión mecánica | soft |
| "como todo, tiene sus pros y sus contras" | both-sidesism vacío | hard |

## Conclusiones genéricas positivas

La IA cierra con optimismo vacío.

| Frase | Severidad |
|-------|-----------|
| "El futuro parece brillante/prometedor" | hard |
| "Solo el tiempo dirá" | hard |
| "Una cosa es segura/cierta" | hard |
| "continúa evolucionando" / "sigue transformando" | hard |
| "está llamado a convertirse en" | hard |
| "las posibilidades son infinitas" | hard |
| "Emocionantes tiempos nos esperan" | hard |

Arreglo: cierra con implicación práctica, dato o imagen concreta.

## Gerundios de análisis superficial

Cláusulas de gerundio pegadas al final de la oración fingiendo análisis. El tell más
frecuente de la traducción desde inglés (-ing). El español culto lo llama cacografía
gerundial cuando el gerundio expresa consecuencia, no acción simultánea.

| Patrón | Arreglo | Severidad |
|--------|---------|-----------|
| ", destacando..." / ", subrayando..." / ", evidenciando..." | oración propia con razonamiento real | hard |
| ", demostrando..." / ", reflejando..." / ", mostrando..." | igual | hard |
| ", allanando el camino para..." | cliché + falso análisis | hard |
| "..., lo que destaca/subraya la importancia de..." | di el hecho, no su supuesta importancia | hard |
| "siendo uno de los..." como apertura | reestructura | hard |

Arreglo: elimina la cláusula. Si el análisis importa, dale su propia oración.

Correcto (acción simultánea real): "Llegó corriendo." — eso queda.

## Jerga corporativa y anglicismos

| Evitar | Usar en su lugar | Severidad |
|--------|------------------|-----------|
| "navegar desafíos/navegar la complejidad" | afrontar, gestionar | hard |
| "aprovechar sinergias" / "apalancar" | usar, combinar | hard |
| "llevar/algo al siguiente nivel" | mejorar, ampliar (o el dato concreto) | hard |
| "hacer un deep dive" | analizar a fondo, examinar | hard |
| "desbloquear tu potencial" (calco de unlock) | reescribe con sentido real | hard |
| "empoderar" | dar herramientas a, fortalecer | soft |
| "impactar" (= afectar) | afectar, influir | soft |
| "accionable" | aplicable, práctico | soft |
| "robusto" (fuera de ingeniería) | sólido, completo | soft |
| "disruptivo" | nuevo, distinto (o el cambio concreto) | soft |
| "frutos de bajo colgado" / calcos literales de idioms | reescribe en español natural | hard |

Nota: "profundizar en" es uso académico normal en español — NO es tell. "Hacer un deep
dive" sí lo es.

## Vocabulario típico de IA

Palabras con frecuencia desproporcionada en texto IA en español.

| Palabra | Problema | Severidad |
|---------|----------|-----------|
| intrincado/intrincada | descriptor favorito de IA | hard |
| multifacético/plurifacético | IA-formal para "complejo" | hard |
| matizado/con matices (repetido) | calificador IA sobreusado | soft |
| miríada de / plétora de | IA-formal para "muchos" | hard |
| incontables/infinitas | hiperbólico | soft |
| panorama (metafórico, repetido) | sustantivo inflado | soft |
| telón de fondo de | metáfora cliché | hard |
| imborrable / ineludible / apremiante | inflación | hard |
| en el ámbito de | casi siempre reemplazable por "en" | hard |
| en aras de | formalismo inflado | soft |
| holístico | IA-formal | soft |
| crucial (repetido) | intensificador IA | soft |
| fundamental (repetido) | igual | soft |
| además/asimismo/no obstante/en este sentido abriendo párrafos sistemáticamente | andamiaje conectivo; métrica a nivel documento | soft |

## Relleno y muletillas

| Frase | Acción | Severidad |
|-------|--------|-----------|
| "En este sentido," (apertura recurrente) | corta; conecta con contenido real | hard si ≥2 |
| "Por otro lado," (sin "por un lado" previo real) | corta o contrasta de verdad | soft |
| "Dicho esto," / "Dicho de otro modo" | meta-comentario; corta | hard |
| "Dicho sea de paso" | igual | soft |
| "al final del día" | corta | hard |
| "en términos de X" | "en X" o reescribe | soft |
| "debido al hecho de que" | "porque" | hard |
| "con el fin de / con el objetivo de" | "para" | soft |
| "en relación con" | "sobre" | soft |
| "a la hora de" | "al" o reescribe | soft |
| "cabe recalcar/recalcar que" | recalca directamente | hard |
| "no cabe duda de que" | performativo | soft |
| "como es bien sabido" | entonces no lo digas | hard |
| "obviamente" / "lógicamente" | si es obvio, no hace falta decirlo | soft |

## Variación elegante

La IA rota sinónimos para evitar repetir, produciendo prosa poco natural:

- Ciclo de entidad: "la empresa... la compañía... la organización... la firma"
- Rotación verbal: "dijo... afirmó... señaló... comentó... manifestó"
- Intercambio adjetival: "significativo... notable... considerable..."

**Importante cultural**: en español periodístico evitar repeticiones es más aceptado que
en inglés, así que esto es `soft`. Pero el ciclo forzado de 3+ sinónimos para un mismo
referente sigue leyendo artificial.

Arreglo: repite la palabra natural. La repetición de términos clave es esperable y preferible.

## Estructura macro

Tells a nivel documento (juicio del agente, no escaneables):

| Tell | Nota |
|------|------|
| Plantilla ensayo: historia → significancia → desafíos → perspectivas de futuro | Secciones tipo "Retos y oportunidades", "Perspectivas futuras", "Mirando hacia adelante" como encabezados son tells |
| Both-sidesism | "por un lado... por otro lado..." que nunca concluye cuando el texto debe concluir |
| Arco de redención plantilla | caída → lección → transformación demasiado limpia |
| Simetría anticipo/recapitulación | la intro anuncia, cada sección cumple, el cierre repite; abstracts y TL;DR legítimos exceptuados |
| Sobredeterminación | explicar explícitamente lo que el lector debe inferir ("esto demuestra que...") |
| Registro emocional uniforme | cada párrafe aterriza al mismo nivel de confianza pulida |
| Tríadas sistemáticas | listas de tres ("calidad, rapidez y precio") elegidas por forma, no por contenido |

## Puntuación

### Raya (—)

En español la raya tiene usos legítimos que en inglés no existen:

- **Diálogos narrativos** (raya de diálogo): EXENTA siempre.
- **Incisos literarios**: permitidos con moderación.

Regla adaptada: máximo 1 raya por párrafo en prosa no narrativa. Dos o más en un párrafo =
flag duro. Uso dramático antes de revelación ("Y entonces—lo vio.") = flag duro.

### Dos puntos de revelación

| Patrón | Severidad |
|--------|-----------|
| "La clave es:" / "La respuesta es:" antes de revelación | hard |
| "El resultado:" / "La conclusión:" | hard |
| Múltiples dos puntos por párrafo | soft |

### Exclamaciones

| Patrón | Severidad |
|--------|-----------|
| Múltiples exclamaciones por párrafo (¡...!) | hard |
| Exclamación tras cada frase en listas | hard |
| Entusiasmo manufacturado: "¡Increíble!", "¡Genial!" | hard |

### Negritas

Negrita en cada término clave = flag. Reserva para lo verdaderamente crítico, 1-2 por
sección máximo.

## Encabezados y ritmo

| Tell | Nota | Severidad |
|------|------|-----------|
| Title Case calcado: "Guía Definitiva Para Dominar El Marketing" | el español usa minúscula inicial salvo nombres propios | hard |
| Encabezados-slogan: oraciones cortas apiladas ("Un comando. Todo listo.") en 3+ encabezados del documento | cadencia publicitaria | soft |
| Ráfagas estacato: párrafos de una línea encadenados fuera de copy social | ritmo uniforme | soft |
| Oraciones de longitud uniforme en todo el documento | burstiness nula; varía 8–25 palabras | hard |
| Cierre moralizante: "Al final, esto nos recuerda que..." | coda moralizante | hard |

## Protecciones antifalsos positivos

Mitad del producto es no hacer daño. Estas categorías quedan intactas:

- **Registro legal/médico/técnico**: hedges, negaciones y absolutos portan significado.
  "nunca almacenes secretos", "podría causar somnolencia", "no establece causalidad",
  "no obstante lo anterior" (legal). Perder uno de estos es fallo grave.
- **Uso literal de dominio**: construcción, mecánica, derecho, medicina, náutica.
  "piedra angular" literal en arquitectura; "tapiz" textil real; "erigirse" constructivo;
  "profundizar" en cualquier registro culto.
- **Citas y ejemplos**: comillas, blockquotes y código exentos por defecto.
- **Hechos con magnitud**: cifras, unidades, fechas y nombres sobreviven; `$47.3M`
  ≠ `$47.3 mil millones`, `150 km` ≠ `150 millas`.
- **Correcciones imperativas/numéricas**: "Usa pnpm, no npm." queda limpio.
- **Género carve-outs**: listas bold-label son correctas en documentación de referencia;
  el estacato es correcto en copy social; tuteo es correcto en blog, usted en legal.
- **Registro regional**: "dar seguimiento", "retomar el tema" son normales en español
  empresarial latinoamericano. No marcar regionalismos naturales.
