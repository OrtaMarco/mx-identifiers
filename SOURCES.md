# Fuentes

Toda regla o catálogo que cambie el comportamiento de la librería se apoya en una fuente
primaria (SAT, RENAPO/DOF, Banxico, IMSS). Las calculadoras, blogs y repos de terceros no
cuentan. Lo que no tiene fuente primaria queda marcado `TODO(verificar)` en el código.

## CURP

- RENAPO, *Instructivo Normativo para la asignación de la Clave Única de Registro de
  Población* (marzo 2006), consultado el 2026-10-06:
  http://www.ordenjuridico.gob.mx/Federal/PE/APF/APC/SEGOB/Instructivos/InstructivoNormativo.pdf
  - Anexo 2: 81 palabras inconvenientes (`INCONVENIENT_WORDS`); la 2ª letra pasa a «X».
  - Criterios de excepción: Ñ → X, partículas omitidas (DA, DAS, DE, DEL, DER, DI, DIE, DD,
    EL, LA, LOS, LAS, LE, LES, MAC, MC, VAN, VON, Y), José/María, X sin vocal o consonante
    interna, X en la posición 15 sin segundo apellido.
  - Anexo 4: 32 entidades + NE (`CURP_STATES`).
  - Posición 17: 1-9 hasta 1999, A-Z desde 2000.

## CLABE

- Banxico, listado de instituciones (clave de cinco cifras; la CLABE usa las tres últimas),
  consultado el 2026-10-06: https://www.banxico.org.mx/cep-scl-beta/listaInstituciones.do
  `node scripts/check-clabe-banks.mjs` repite la comparación (requiere red; no corre en CI).
  Pendientes de confirmar (en el catálogo, ausentes del listado): 143, 608, 618, 630, 648;
  el 631 aparece como «TRF», no como CI Casa de Bolsa.

## Catálogos CFDI 4.0

- SAT, catCFDI versión 4.0 (el que enlaza la página del Anexo 20), consultado el 2026-10-06:
  http://omawww.sat.gob.mx/tramitesyservicios/Paginas/documentos/catCFDI_V_4_23032023.xls
  c_RegimenFiscal, c_UsoCFDI, c_FormaPago, c_MetodoPago, c_TipoDeComprobante y c_Impuesto
  coinciden en claves; `test/cfdi-catalogos.test.mjs` lo fija. c_ObjetoImp: el xls solo trae
  01-04; las claves 05-08 de la librería siguen sin verificar (`TODO(verificar)`).

## RFC

- SAT, *Estructura de la clave en el RFC*
  (https://www.sat.gob.mx/cs/Satellite?blobcol=urldata&blobkey=id&blobtable=MungoBlobs&blobwhere=1461176322651&ssbinary=true):
  solo describe el formato; la homoclave la asigna el SAT.
- **Sin fuente primaria** para la lista de palabras inconvenientes del RFC, la letra que se
  sustituye, las partículas, la Ñ ni el algoritmo de la homoclave. El comportamiento actual
  no está verificado contra el SAT.
- El dígito verificador (módulo 11) está contrastado con vectores canónicos, no con un
  documento normativo.
