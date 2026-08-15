/**
 * Catálogos oficiales mexicanos: entidades de la CURP, bancos de la CLABE, palabras
 * altisonantes de RENAPO y los catálogos del CFDI 4.0 del SAT.
 *
 * Todo lo de aquí es data pura y sin dependencias: se importa igual desde el
 * navegador que desde el servidor.
 */

/** Claves de entidad federativa usadas en las posiciones 12-13 de la CURP. */
export const CURP_STATES: Record<string, string> = {
    AS: 'Aguascalientes',
    BC: 'Baja California',
    BS: 'Baja California Sur',
    CC: 'Campeche',
    CL: 'Coahuila',
    CM: 'Colima',
    CS: 'Chiapas',
    CH: 'Chihuahua',
    DF: 'Ciudad de México',
    DG: 'Durango',
    GT: 'Guanajuato',
    GR: 'Guerrero',
    HG: 'Hidalgo',
    JC: 'Jalisco',
    MC: 'México',
    MN: 'Michoacán',
    MS: 'Morelos',
    NT: 'Nayarit',
    NL: 'Nuevo León',
    OC: 'Oaxaca',
    PL: 'Puebla',
    QT: 'Querétaro',
    QR: 'Quintana Roo',
    SP: 'San Luis Potosí',
    SL: 'Sinaloa',
    SR: 'Sonora',
    TC: 'Tabasco',
    TS: 'Tamaulipas',
    TL: 'Tlaxcala',
    VZ: 'Veracruz',
    YN: 'Yucatán',
    ZS: 'Zacatecas',
    NE: 'Nacido en el extranjero',
};

/**
 * Palabras altisonantes que RENAPO no permite en las primeras cuatro letras de la
 * CURP. Cuando el nombre las produce, la segunda letra se sustituye por «X».
 */
export const INCONVENIENT_WORDS = new Set([
    'BACA', 'BAKA', 'BUEI', 'BUEY', 'CACA', 'CACO', 'CAGA', 'CAGO', 'CAKA', 'CAKO',
    'COGE', 'COGI', 'COJA', 'COJE', 'COJI', 'COJO', 'COLA', 'CULO', 'FALO', 'FETO',
    'GETA', 'GUEI', 'GUEY', 'JOTO', 'KACA', 'KACO', 'KAGA', 'KAGO', 'KAKA', 'KAKO',
    'KOGE', 'KOGI', 'KOJA', 'KOJE', 'KOJI', 'KOJO', 'KOLA', 'KULO', 'LILO', 'LOCA',
    'LOCO', 'LOKA', 'LOKO', 'MAME', 'MAMO', 'MEAR', 'MEAS', 'MEON', 'MIAR', 'MION',
    'MOCO', 'MOKO', 'MULA', 'MULO', 'NACA', 'NACO', 'PEDA', 'PEDO', 'PENE', 'PIPI',
    'PITO', 'POPO', 'PUTA', 'PUTO', 'QULO', 'RATA', 'ROBA', 'ROBE', 'ROBO', 'RUIN',
    'SENO', 'TETA', 'VACA', 'VAGA', 'VAGO', 'VAKA', 'VUEI', 'VUEY', 'WUEI', 'WUEY',
]);

/**
 * Principales instituciones del catálogo de participantes de Banxico, indexadas por
 * los tres primeros dígitos de la CLABE. No es el catálogo completo: los códigos que
 * no aparezcan aquí se reportan como «no identificado» en vez de inventar un nombre.
 */
export const CLABE_BANKS: Record<string, string> = {
    '002': 'Banamex',
    '006': 'Bancomext',
    '009': 'Banobras',
    '012': 'BBVA México',
    '014': 'Santander',
    '019': 'Banjército',
    '021': 'HSBC',
    '030': 'Banco del Bajío',
    '036': 'Inbursa',
    '042': 'Mifel',
    '044': 'Scotiabank',
    '058': 'Banregio',
    '059': 'Invex',
    '060': 'Bansi',
    '062': 'Afirme',
    '072': 'Banorte',
    '106': 'Bank of America',
    '108': 'MUFG',
    '110': 'JP Morgan',
    '112': 'BMonex',
    '113': 'Ve por Más',
    '127': 'Azteca',
    '128': 'Autofin',
    '129': 'Barclays',
    '130': 'Compartamos',
    '132': 'Multiva',
    '133': 'Actinver',
    '135': 'Nafin',
    '136': 'Intercam Banco',
    '137': 'BanCoppel',
    '140': 'Consubanco',
    '141': 'Volkswagen Bank',
    '143': 'CIBanco',
    '145': 'Banco Base',
    '166': 'Banco del Bienestar',
    '168': 'Hipotecaria Federal',
    '600': 'Monexcb',
    '602': 'Masari',
    '605': 'Value',
    '608': 'Vector',
    '616': 'Finamex',
    '617': 'Valmex',
    '618': 'Única',
    '620': 'Profuturo',
    '630': 'Intercam Casa de Bolsa',
    '631': 'CI Casa de Bolsa',
    '634': 'Fincomún',
    '646': 'STP',
    '648': 'Evercore',
    '652': 'Credicapital',
    '653': 'Kuspit',
    '656': 'Unagra',
    '659': 'Asp Integra Opciones',
    '670': 'Libertad',
    '677': 'Caja Popular Mexicana',
    '710': 'NVIO',
    '723': 'Cuenca',
    '812': 'Bineo',
};

/** Régimen fiscal del emisor/receptor de un CFDI (catálogo c_RegimenFiscal). */
export const CFDI_REGIMEN: Record<string, string> = {
    '601': 'General de Ley Personas Morales',
    '603': 'Personas Morales con Fines no Lucrativos',
    '605': 'Sueldos y Salarios e Ingresos Asimilados a Salarios',
    '606': 'Arrendamiento',
    '607': 'Régimen de Enajenación o Adquisición de Bienes',
    '608': 'Demás ingresos',
    '610': 'Residentes en el Extranjero sin Establecimiento Permanente en México',
    '611': 'Ingresos por Dividendos (socios y accionistas)',
    '612': 'Personas Físicas con Actividades Empresariales y Profesionales',
    '614': 'Ingresos por intereses',
    '615': 'Régimen de los ingresos por obtención de premios',
    '616': 'Sin obligaciones fiscales',
    '620': 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos',
    '621': 'Incorporación Fiscal',
    '622': 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras',
    '623': 'Opcional para Grupos de Sociedades',
    '624': 'Coordinados',
    '625': 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
    '626': 'Régimen Simplificado de Confianza',
};

/** Uso que el receptor da al comprobante (catálogo c_UsoCFDI, versión 4.0). */
export const CFDI_USO: Record<string, string> = {
    G01: 'Adquisición de mercancías',
    G02: 'Devoluciones, descuentos o bonificaciones',
    G03: 'Gastos en general',
    I01: 'Construcciones',
    I02: 'Mobiliario y equipo de oficina por inversiones',
    I03: 'Equipo de transporte',
    I04: 'Equipo de cómputo y accesorios',
    I05: 'Dados, troqueles, moldes, matrices y herramental',
    I06: 'Comunicaciones telefónicas',
    I07: 'Comunicaciones satelitales',
    I08: 'Otra maquinaria y equipo',
    D01: 'Honorarios médicos, dentales y gastos hospitalarios',
    D02: 'Gastos médicos por incapacidad o discapacidad',
    D03: 'Gastos funerales',
    D04: 'Donativos',
    D05: 'Intereses reales efectivamente pagados por créditos hipotecarios',
    D06: 'Aportaciones voluntarias al SAR',
    D07: 'Primas por seguros de gastos médicos',
    D08: 'Gastos de transportación escolar obligatoria',
    D09: 'Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones',
    D10: 'Pagos por servicios educativos (colegiaturas)',
    S01: 'Sin efectos fiscales',
    CP01: 'Pagos',
    CN01: 'Nómina',
};

/** Tipo de comprobante (catálogo c_TipoDeComprobante). */
export const CFDI_TIPO: Record<string, string> = {
    I: 'Ingreso',
    E: 'Egreso',
    T: 'Traslado',
    N: 'Nómina',
    P: 'Pago',
};

/** Método de pago (catálogo c_MetodoPago). */
export const CFDI_METODO_PAGO: Record<string, string> = {
    PUE: 'Pago en una sola exhibición',
    PPD: 'Pago en parcialidades o diferido',
};

/** Forma de pago (catálogo c_FormaPago). */
export const CFDI_FORMA_PAGO: Record<string, string> = {
    '01': 'Efectivo',
    '02': 'Cheque nominativo',
    '03': 'Transferencia electrónica de fondos',
    '04': 'Tarjeta de crédito',
    '05': 'Monedero electrónico',
    '06': 'Dinero electrónico',
    '08': 'Vales de despensa',
    '12': 'Dación en pago',
    '13': 'Pago por subrogación',
    '14': 'Pago por consignación',
    '15': 'Condonación',
    '17': 'Compensación',
    '23': 'Novación',
    '24': 'Confusión',
    '25': 'Remisión de deuda',
    '26': 'Prescripción o caducidad',
    '27': 'A satisfacción del acreedor',
    '28': 'Tarjeta de débito',
    '29': 'Tarjeta de servicios',
    '30': 'Aplicación de anticipos',
    '31': 'Intermediario pagos',
    '99': 'Por definir',
};

/** Objeto de impuesto a nivel concepto (catálogo c_ObjetoImp). */
export const CFDI_OBJETO_IMP: Record<string, string> = {
    '01': 'No objeto de impuesto',
    '02': 'Sí objeto de impuesto',
    '03': 'Sí objeto del impuesto y no obligado al desglose',
    '04': 'Sí objeto del impuesto y no causa impuesto',
    '05': 'Sí objeto del impuesto, IVA crédito PODEBI',
    '06': 'Sí objeto del IVA, no traslado IVA',
    '07': 'No traslado del IVA, sí desglose IEPS',
    '08': 'No traslado del IVA, no desglose IEPS',
};

/** Impuestos del catálogo c_Impuesto. */
export const CFDI_IMPUESTOS: Record<string, string> = {
    '001': 'ISR',
    '002': 'IVA',
    '003': 'IEPS',
};
