<!-- English: README.md -->

# mx-identifiers

[![ci](https://github.com/OrtaMarco/mx-identifiers/actions/workflows/ci.yml/badge.svg)](https://github.com/OrtaMarco/mx-identifiers/actions/workflows/ci.yml)
[![licencia: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Valida **y genera** identificadores mexicanos —**RFC**, **CURP**, **CLABE** y **NSS**—
con los dígitos verificadores comprobados contra vectores públicos.

Un paquete en vez de cuatro. Sin dependencias. El mismo código en Node y en el navegador.
Escrito en TypeScript, se publica en ESM y CJS.

📖 [Read me in English](README.md)

```bash
npm install mx-identifiers
```

## Empezar

```ts
import { validateRfc, generatePerson } from 'mx-identifiers';

validateRfc('GODE561231GR8');
// {
//   valid: true,
//   normalized: 'GODE561231GR8',
//   kind: 'fisica',
//   parts: { iniciales: 'GODE', fecha: '561231', homoclave: 'GR', digito: '8' },
//   birthDate: '1956-12-31',
//   expectedCheckDigit: '8',
//   errors: []
// }

generatePerson();
// Una persona ficticia pero coherente consigo misma: el RFC y la CURP salen del mismo
// nombre y la misma fecha, y cada identificador pasa su propio validador.
// { nombre: 'DANIELA', apellidoPaterno: 'RIVERA', rfc: 'RIRD870412...', curp: '...', clabe: '...', nss: '...', ... }
```

Los validadores nunca lanzan excepciones: devuelven un objeto cuyo arreglo `errors`
explica qué falló, para que tú pongas el mensaje que quieras en el idioma que quieras.

## Por qué existe

En npm hay un paquete para la CLABE, otro para la CURP, y ninguno que cubra los cuatro
identificadores que pide de verdad un formulario mexicano de facturación, nómina u
onboarding —mucho menos uno que además **genere** datos de prueba válidos. Este es el
módulo que mueve las [herramientas de ortamarco.me](https://ortamarco.me/herramientas/),
extraído tal cual.

## Validación

Cada validador recibe una cadena, la normaliza (mayúsculas, y fuera espacios, guiones,
puntos y guiones bajos) y devuelve un objeto. `valid` es verdadero sólo cuando `errors`
está vacío.

| Función | Devuelve | Notas |
|---|---|---|
| `validateRfc(input)` | `RfcResult` | Persona física (13 caracteres) y moral (12) |
| `validateCurp(input)` | `CurpResult` | 18 caracteres, resuelve entidad y sexo |
| `validateClabe(input)` | `ClabeResult` | 18 dígitos, resuelve el banco |
| `validateNss(input)` | `NssResult` | 11 dígitos, Luhn |

```ts
const r = validateCurp('BOXW310820HNERXN09');
r.valid;        // true
r.birthDate;    // '1931-08-20'
r.sexLabel;     // 'H'
r.stateName;    // 'Nacido en el extranjero'
```

Cada resultado trae las piezas que componen el identificador (`parts`), el dígito que el
algoritmo esperaba (`expectedCheckDigit`) y, donde aplica, la fecha decodificada
(`birthDate`). Dos comportamientos que conviene conocer: **`parts` es `null` cuando la
validación falla temprano** (cadena vacía, longitud o forma incorrecta) y también en los
RFC genéricos del SAT, que no tienen partes con significado; y **un banco desconocido no
invalida una CLABE** —`bankName` simplemente queda en `null`.

### Códigos de error

`errors` trae códigos estables e independientes del idioma. Tradúcelos a tu copy.

| Código | Significado | Aparece en |
|---|---|---|
| `empty` | No queda nada después de normalizar | todos |
| `length` | Número de caracteres incorrecto | todos |
| `shape` | No encaja con el patrón estructural | RFC, CURP |
| `digits` | Contiene algo que no es un dígito | CLABE, NSS |
| `date` | La fecha embebida no existe en el calendario | RFC, CURP |
| `state` | La clave de entidad no está en el catálogo oficial | CURP |
| `inconvenient` | Las cuatro primeras letras forman una palabra que RENAPO no permite | RFC, CURP |
| `checksum` | El dígito verificador no coincide | todos |

## Generación

Datos de prueba estructuralmente válidos. Sirven para sembrar bases de datos de
desarrollo, llenar suites de tests y armar fixtures.

| Función | Devuelve |
|---|---|
| `generatePerson()` | Una persona ficticia completa: nombre, RFC, CURP, CLABE, NSS, banco, código postal, teléfono, email |
| `generateCompany()` | Una empresa ficticia: razón social, RFC moral, CLABE, fecha de constitución |
| `buildRfcFisica(persona)` | RFC de persona física, a partir de nombre y fecha |
| `buildRfcMoral(razonSocial, fecha)` | RFC de persona moral, a partir de una razón social |
| `buildCurp(persona)` | CURP de 18 caracteres |
| `buildClabe(codigoBanco?)` | CLABE, opcionalmente de un banco dado |
| `buildNss(anioNacimiento)` | NSS de alguien nacido ese año |

```ts
import { buildCurp, buildRfcFisica } from 'mx-identifiers';

const persona = {
    nombre: 'JOSÉ LUIS',
    apellidoPaterno: 'DE LA CRUZ',
    apellidoMaterno: 'MUÑOZ',
    fechaNacimiento: '1985-06-15', // ISO
    sexo: 'H',                     // 'H' | 'M'
    entidad: 'DF',                 // clave de entidad de la CURP
};

buildRfcFisica(persona); // acentos, Ñ y partículas resueltos según las reglas públicas
buildCurp(persona);
```

Los constructores aplican las reglas públicas de formación: quitan acentos, pasan la `Ñ`
a `X`, ignoran las partículas (`de`, `la`, `del`, `los`…), usan el segundo nombre cuando
el primero es José o María, y sustituyen la segunda letra por `X` cuando las iniciales
forman una palabra que RENAPO no permite. Los caracteres que el SAT asigna con su
algoritmo interno (la homoclave) se generan al azar y el dígito verificador se recalcula
encima —así el resultado es consistente consigo mismo, no una predicción de lo que el
SAT emitiría de verdad.

La generación usa `Math.random()`, así que no es reproducible. La generación con semilla
está en la hoja de ruta.

> ### ⚠️ Los datos generados son ficticios
>
> Estos identificadores pasan cualquier validación de formato y de dígito verificador,
> pero **no corresponden a ninguna persona real** ni a ningún registro del SAT, RENAPO,
> IMSS o Banxico. Son para entornos de desarrollo, suites de tests y fixtures. No
> presentes un dato generado como de alguien, ni lo uses para llenar un trámite.

## Catálogos

Se exportan como objetos planos, así que puedes alimentar un `<select>` directamente.

| Export | Contenido |
|---|---|
| `CURP_STATES` | Las 32 entidades más la clave de nacido en el extranjero |
| `CLABE_BANKS` | Principales participantes de Banxico, por los tres primeros dígitos |
| `INCONVENIENT_WORDS` | `Set` de las palabras que RENAPO no permite en las primeras cuatro letras |
| `CFDI_REGIMEN`, `CFDI_USO`, `CFDI_TIPO`, `CFDI_METODO_PAGO`, `CFDI_FORMA_PAGO`, `CFDI_OBJETO_IMP`, `CFDI_IMPUESTOS` | Catálogos del SAT para CFDI 4.0 |

`CLABE_BANKS` no es el catálogo completo de Banxico a propósito: un código que no esté
ahí se reporta como desconocido en vez de inventarle un nombre.

## Dos cosas que casi todo el mundo cuenta mal

Las dos estaban mal en los comentarios de este mismo código hasta que la suite de tests
las cazó. Si vas a escribir tu propia implementación, valen el minuto.

**Los dos RFC genéricos del SAT no se comportan igual.** `XAXX010101000` (público en
general) **no** satisface el dígito verificador —el módulo 11 pide `4` donde el SAT puso
`0`—, así que cualquier validador tiene que aceptarlo explícitamente o rechazará lo que
lleva toda factura al público en general. `XEXX010101000` (residentes en el extranjero)
**sí** lo satisface por su cuenta; aquí está en la lista sólo para que se reporte como
genérico y no como una persona física cualquiera.

**El dígito de la CLABE toma cada producto módulo 10; no es Luhn.** Reducir cada producto
antes de sumar o sumar y reducir al final son operaciones equivalentes, así que esa
distinción no demuestra nada. La que importa: de `9 × 7 = 63` se toma `63 mod 10 = 3`,
**no** la suma de sus cifras `6 + 3 = 9`. Una implementación que copió Luhn saca otro
dígito.

## Ejemplos

En [`examples/`](examples/) hay dos scripts que puedes correr tal cual:

```bash
node examples/validate.mjs                  # valida una tanda y explica cada fallo
node examples/validate.mjs GODE561231GR8    # o lo que tú le pases
node examples/seed-fixtures.mjs 100 20      # 100 personas y 20 empresas en JSON
```

## Compatibilidad

- **Node** 18 en adelante (probado en CI con 18, 20, 22 y 24).
- **Navegadores** —no usa ninguna API de Node; empaquétalo directo.
- **ESM y CommonJS**, los dos con declaraciones de tipos. Los tests ejercitan ambos.
- **Cero dependencias en runtime.**

## Desarrollo

```bash
npm install
npm test          # construye y corre la suite contra dist/
npm run typecheck
```

La suite corre contra el paquete construido y no contra las fuentes, así que verifica
exactamente lo que recibe quien lo instala. Los vectores vienen del SAT, de
python-stdnum, de Banxico y de cálculos a mano documentados en cada test.

## Licencia

MIT © [Marco Orta](https://ortamarco.me)
