<!-- Español: README.es.md -->

# mx-identifiers

[![ci](https://github.com/OrtaMarco/mx-identifiers/actions/workflows/ci.yml/badge.svg)](https://github.com/OrtaMarco/mx-identifiers/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Validate **and generate** Mexican identifiers — **RFC**, **CURP**, **CLABE** and **NSS** —
with check digits verified against public vectors.

One package instead of four. Zero dependencies. Same code in Node and in the browser.
Written in TypeScript, ships ESM and CJS.

📖 [Léeme en español](README.es.md)

```bash
npm install mx-identifiers
```

## Quick start

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
// A fictional but internally coherent person: the RFC and the CURP derive from the
// same name and birth date, and every identifier passes its own validator.
// { nombre: 'DANIELA', apellidoPaterno: 'RIVERA', rfc: 'RIRD870412...', curp: '...', clabe: '...', nss: '...', ... }
```

Validators never throw. They return a result object whose `errors` array explains what
failed, so you can surface your own message in your own language.

## Why this package

The npm ecosystem has a package for CLABE, another for CURP, and nothing that covers the
four identifiers a Mexican invoicing, payroll or onboarding form actually needs — let
alone one that also **generates** valid test data. This is the module that backs the
[developer tools at ortamarco.me](https://ortamarco.me/herramientas/), extracted as-is.

## Validation

Every validator takes a string, normalizes it (uppercase, strips spaces, hyphens, dots
and underscores) and returns a result object. `valid` is true only when `errors` is empty.

| Function | Returns | Notes |
|---|---|---|
| `validateRfc(input)` | `RfcResult` | Individuals (13 chars) and companies (12) |
| `validateCurp(input)` | `CurpResult` | 18 chars, resolves state and sex |
| `validateClabe(input)` | `ClabeResult` | 18 digits, resolves the bank |
| `validateNss(input)` | `NssResult` | 11 digits, Luhn |

```ts
const r = validateCurp('BOXW310820HNERXN09');
r.valid;        // true
r.birthDate;    // '1931-08-20'
r.sexLabel;     // 'H'
r.stateName;    // 'Nacido en el extranjero'
```

Each result carries the pieces the identifier is made of (`parts`), the check digit the
algorithm expected (`expectedCheckDigit`) and, where it applies, a decoded `birthDate`.
Two behaviors worth knowing: **`parts` is `null` when validation fails early** (empty
input, wrong length, wrong shape) and also for the SAT's generic RFCs, which have no
meaningful parts; and **an unknown bank does not invalidate a CLABE** — `bankName` is
simply `null`.

### Error codes

`errors` holds stable, language-neutral codes. Map them to your own copy.

| Code | Meaning | Appears in |
|---|---|---|
| `empty` | Nothing left after normalizing | all |
| `length` | Wrong number of characters | all |
| `shape` | Does not match the structural pattern | RFC, CURP |
| `digits` | Contains something other than digits | CLABE, NSS |
| `date` | The embedded date does not exist in the calendar | RFC, CURP |
| `state` | The state key is not in the official catalog | CURP |
| `inconvenient` | The first four letters spell a word RENAPO forbids | RFC, CURP |
| `checksum` | The check digit does not match | all |

## Generation

Structurally valid test data. Useful for seeding development databases, filling test
suites and building fixtures.

| Function | Returns |
|---|---|
| `generatePerson()` | A full fictional person: name, RFC, CURP, CLABE, NSS, bank, postal code, phone, email |
| `generateCompany()` | A fictional company: legal name, company RFC, CLABE, incorporation date |
| `buildRfcFisica(person)` | RFC for an individual, from a name and birth date |
| `buildRfcMoral(legalName, date)` | RFC for a company, from a legal name |
| `buildCurp(person)` | 18-character CURP |
| `buildClabe(bankCode?)` | CLABE, optionally for a given bank |
| `buildNss(birthYear)` | NSS for someone born that year |

```ts
import { buildCurp, buildRfcFisica } from 'mx-identifiers';

const person = {
    nombre: 'JOSÉ LUIS',
    apellidoPaterno: 'DE LA CRUZ',
    apellidoMaterno: 'MUÑOZ',
    fechaNacimiento: '1985-06-15', // ISO
    sexo: 'H',                     // 'H' | 'M'
    entidad: 'DF',                 // CURP state key
};

buildRfcFisica(person); // accents, Ñ and particles handled per the public rules
buildCurp(person);
```

The builders apply the public naming rules: they strip accents, map `Ñ` to `X`, skip
particles (`de`, `la`, `del`, `los`…), use the second given name when the first is José
or María, and replace the second letter with `X` when the initials spell a word RENAPO
forbids. The characters that the SAT assigns with its own internal algorithm (the
homoclave) are random, and the check digit is recomputed on top — so results are
self-consistent, not a prediction of what the SAT would actually issue.

Generation uses `Math.random()` and is therefore not reproducible. Seeded generation is
on the roadmap.

> ### ⚠️ Generated data is fictional
>
> These identifiers pass any format and check-digit validation, but they correspond to
> **no real person** and to no record at SAT, RENAPO, IMSS or Banxico. They are for
> development environments, test suites and fixtures. Do not present generated data as
> belonging to anyone, and do not use it to fill official filings.

## Catalogs

Exported as plain objects, so you can drive a `<select>` from them.

| Export | Contents |
|---|---|
| `CURP_STATES` | 32 states plus the foreign-born key, by CURP code |
| `CLABE_BANKS` | Main Banxico participants, by the CLABE's first three digits |
| `INCONVENIENT_WORDS` | `Set` of the words RENAPO forbids in the first four letters |
| `CFDI_REGIMEN`, `CFDI_USO`, `CFDI_TIPO`, `CFDI_METODO_PAGO`, `CFDI_FORMA_PAGO`, `CFDI_OBJETO_IMP`, `CFDI_IMPUESTOS` | SAT catalogs for CFDI 4.0 invoices |

`CLABE_BANKS` is deliberately not the complete Banxico list: a code that is not in it is
reported as unknown rather than given an invented name.

## Two things that are easy to get wrong

Both of these were wrong in this codebase's own comments until the test suite caught
them. If you are writing your own implementation, they are worth the minute.

**The SAT's two generic RFCs do not behave the same.** `XAXX010101000` (general public)
does **not** satisfy the check digit — the modulo-11 algorithm asks for `4` where the
SAT put `0` — so any validator must allowlist it explicitly or it will reject what every
consumer invoice in Mexico carries. `XEXX010101000` (foreign residents) **does** satisfy
it on its own; it is allowlisted here only so it is reported as generic rather than as an
ordinary individual.

**The CLABE check digit takes each product modulo 10 — it is not Luhn.** Reducing each
product before summing versus summing and reducing at the end are mathematically
equivalent, so that distinction proves nothing. The one that matters: from `9 × 7 = 63`
you take `63 mod 10 = 3`, **not** the digit sum `6 + 3 = 9`. An implementation that
copied Luhn produces a different check digit.

## Examples

Two runnable scripts live in [`examples/`](examples/):

```bash
node examples/validate.mjs                  # validate a batch and explain each failure
node examples/validate.mjs GODE561231GR8    # or your own inputs
node examples/seed-fixtures.mjs 100 20      # 100 people + 20 companies as JSON
```

## Compatibility

- **Node** 18 and up (tested in CI on 18, 20, 22 and 24).
- **Browsers** — no Node APIs are used; bundle it directly.
- **ESM and CommonJS**, both with type declarations. Tests exercise both entry points.
- **Zero runtime dependencies.**

## Development

```bash
npm install
npm test          # builds, then runs the suite against dist/
npm run typecheck
```

The suite runs against the built package rather than the sources, so it verifies exactly
what consumers receive. Vectors come from the SAT, python-stdnum, Banxico and hand
calculations documented in each test.

## License

MIT © [Marco Orta](https://ortamarco.me)
