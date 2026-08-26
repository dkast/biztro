# Preset: conciso

Directo y económico. El preset para documentación de ayuda, guías técnicas y
referencia.

## Características de voz

- Directo y económico, preservando el registro de la fuente.
- Concreto cuando la fuente aporta hechos concretos.
- Suficientemente variado para evitar fragmentos telegráficos o una plantilla de
  oración repetida.
- Seguro solo hasta donde lo permite la fuente.

## Reglas

1. **Una instrucción, una acción** — cada paso hace una cosa y se puede verificar.
2. **Imperativo directo** — "Abre Ajustes > Facturación", no "El usuario debería
   proceder a abrir..."
3. **Segunda persona consistente** — elige "tú" o impersonal ("se recomienda") según
   el tono del sitio y no lo mezcles.
4. **Sin preámbulos** — el lector llegó buscando una respuesta; dala primero.
5. **Listas solo cuando el orden o el conteo importan** — si son pasos, numerados;
   si son opciones, viñetas.
6. **Hechos suministrados únicamente** — nunca inventes valores de menú, nombres de
   botones ni rutas que no estén en la fuente.

## Edición preferida

- Elimina el opener formulístico cuando la oración funciona sin él.
- Reemplaza abstracción inflada por el hecho concreto de la fuente.
- Verbo simple antes que perífrasis ("usar" antes de "hacer uso de").
- Reemplaza boilerplate competitivo por su significado literal.
- Conserva hedges intencionales, transiciones, párrafos y lenguaje de dominio.
- No impongas longitud de oración, voz activa ni párrafos cortos a prosa ya natural.

## Patrones estructurales

### Apertura (docs)

```
[Qué hace esta página en una oración]. [Requisito si existe].
```

No:

```
En el mundo actual de los negocios digitales, gestionar [X] es fundamental...
```

### Desarrollo (procedimiento)

```
1. [Acción]. 2. [Acción]. 3. [Resultado verificable].
```

No:

```
Primero, procederemos a... A continuación, es importante destacar...
Finalmente, como último paso...
```

### Cierre (resultado)

```
[Estado final verificable]. [Enlace a siguiente tarea si aplica].
```

No:

```
¡Y eso es todo! Espero que esta guía te haya resultado útil.
```

## Ejemplos

### Antes (IA)

> Cabe mencionar que, con el fin de poder llevar a cabo la configuración inicial de tu
> tienda, será necesario que, en primer lugar, accedas a la sección correspondiente,
> siendo este un paso fundamental para el correcto funcionamiento del sistema.

### Después (conciso)

> Para configurar tu tienda, ve a Ajustes > Tienda. Necesitas permiso de administrador.

---

### Antes (IA)

> Si bien el proceso de integración puede parecer complejo al principio, no te
> preocupes: siguiendo estos sencillos pasos, tendrás todo listo en un abrir y cerrar
> de ojos.

### Después (conciso)

> La integración tiene tres pasos y tarda unos diez minutos.

## Checklist de calidad

- [ ] Cada paso es accionable y verificable
- [ ] Imperativos directos, sin rodeos de cortesía
- [ ] Rutas de UI exactas y consistentes (Ajustes > Facturación)
- [ ] Sin preámbulo antes de la respuesta
- [ ] Sin cierre de chatbot
- [ ] Terminología consistente en todo el documento
