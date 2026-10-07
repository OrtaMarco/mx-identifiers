/**
 * Catálogos CFDI 4.0 — contraste con el catCFDI del SAT (catCFDI_V_4_23032023.xls, el que
 * enlaza la página oficial del Anexo 20, consultado el 2026-10-06):
 * http://omawww.sat.gob.mx/tramitesyservicios/Paginas/documentos/catCFDI_V_4_23032023.xls
 *
 * Las claves de cada catálogo son exactamente las del xls; las descripciones de los
 * catálogos cortos también. c_UsoCFDI solo se compara por clave: el SAT termina cada
 * descripción con punto y la librería no.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
    CFDI_REGIMEN, CFDI_USO, CFDI_FORMA_PAGO, CFDI_METODO_PAGO, CFDI_TIPO, CFDI_OBJETO_IMP, CFDI_IMPUESTOS,
} from '../dist/index.js';

const claves = (obj) => Object.keys(obj).sort();

describe('catálogos CFDI 4.0 contra catCFDI del SAT', () => {
    it('c_RegimenFiscal: 19 claves', () => {
        assert.deepEqual(claves(CFDI_REGIMEN), [
            '601', '603', '605', '606', '607', '608', '610', '611', '612', '614',
            '615', '616', '620', '621', '622', '623', '624', '625', '626',
        ]);
        assert.equal(CFDI_REGIMEN['626'], 'Régimen Simplificado de Confianza');
        assert.equal(CFDI_REGIMEN['616'], 'Sin obligaciones fiscales');
    });

    it('c_UsoCFDI: 24 claves', () => {
        assert.deepEqual(claves(CFDI_USO), [
            'CN01', 'CP01', 'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10',
            'G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08', 'S01',
        ]);
    });

    it('c_FormaPago: 22 claves', () => {
        assert.deepEqual(claves(CFDI_FORMA_PAGO), [
            '01', '02', '03', '04', '05', '06', '08', '12', '13', '14', '15',
            '17', '23', '24', '25', '26', '27', '28', '29', '30', '31', '99',
        ]);
        assert.equal(CFDI_FORMA_PAGO['03'], 'Transferencia electrónica de fondos');
        assert.equal(CFDI_FORMA_PAGO['99'], 'Por definir');
    });

    it('c_MetodoPago, c_TipoDeComprobante y c_Impuesto', () => {
        assert.deepEqual(CFDI_METODO_PAGO, { PUE: 'Pago en una sola exhibición', PPD: 'Pago en parcialidades o diferido' });
        assert.deepEqual(CFDI_TIPO, { I: 'Ingreso', E: 'Egreso', T: 'Traslado', N: 'Nómina', P: 'Pago' });
        assert.deepEqual(CFDI_IMPUESTOS, { '001': 'ISR', '002': 'IVA', '003': 'IEPS' });
    });

    it('c_ObjetoImp: 01-04 son las del xls', () => {
        assert.equal(CFDI_OBJETO_IMP['01'], 'No objeto de impuesto');
        assert.equal(CFDI_OBJETO_IMP['02'], 'Sí objeto de impuesto');
        assert.equal(CFDI_OBJETO_IMP['03'], 'Sí objeto del impuesto y no obligado al desglose');
        assert.equal(CFDI_OBJETO_IMP['04'], 'Sí objeto del impuesto y no causa impuesto');
    });
});
