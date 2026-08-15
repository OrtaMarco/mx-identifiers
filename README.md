# mx-identifiers

Validate and generate Mexican identifiers — **RFC**, **CURP**, **CLABE** and **NSS** —
with check digits verified against public vectors. Zero dependencies, one package,
works in Node and in the browser.

> 🚧 This README is a stub. Full documentation (API tables, error codes, Spanish
> version) lands before the 1.0.0 release.

```bash
npm install mx-identifiers
```

```ts
import { validateRfc, generatePerson } from 'mx-identifiers';

validateRfc('GODE561231GR8');
// → { valid: true, kind: 'fisica', birthDate: '1956-12-31', ... }

generatePerson();
// → a fictional person whose RFC, CURP, CLABE and NSS all pass validation
```

## What it does

- **Validate** RFC (individuals and companies), CURP, CLABE and NSS: shape, embedded
  date, check digit, and catalog lookups (state, bank).
- **Generate** structurally valid test data: coherent fictional people and companies
  whose RFC and CURP derive from the same name and birth date.
- **Catalogs** included: CURP states, CLABE banks, RENAPO's inconvenient-word list and
  the SAT's CFDI catalogs.

## Fictional data warning

Generated identifiers are structurally valid — they pass any format and check-digit
validation — but they correspond to **no real person** and to no record at SAT, RENAPO,
IMSS or Banxico. They are for development environments, test suites and fixtures.

## License

MIT © [Marco Orta](https://ortamarco.me)
