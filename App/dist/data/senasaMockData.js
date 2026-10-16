"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CUIT_ALIASES = exports.ANIMALES_MOCK = exports.LOTES = exports.DTES = exports.PARCELAS = exports.FECHA_CORTE_EUDR = exports.FORMA = exports.FRIGORIFICOS = exports.ESTABLECIMIENTOS = exports.E5 = exports.E4 = exports.E3 = exports.E6 = exports.E2 = exports.E1 = exports.PRODUCTORES = void 0;
exports.kmOffsetToPolygon = kmOffsetToPolygon;
exports.rfid = rfid;
exports.normalizeCuit = normalizeCuit;
exports.buildMockSyncForCuit = buildMockSyncForCuit;
exports.PRODUCTORES = [
    {
        id: "PRD-01",
        cuit: "20-99999901-1",
        nombre: "Hermanos Benítez (ficticio)",
        provincia: "Corrientes",
    },
    {
        id: "PRD-02",
        cuit: "30-99999902-2",
        nombre: "La Aguará S.R.L. (ficticio)",
        provincia: "Corrientes",
    },
    {
        id: "PRD-03",
        cuit: "20-99999903-3",
        nombre: "Teodoro Villalba (ficticio)",
        provincia: "Chaco",
    },
    {
        id: "PRD-04",
        cuit: "30-99999904-4",
        nombre: "Lapacho Porá S.A. (ficticio)",
        provincia: "Formosa",
    },
    {
        id: "PRD-05",
        cuit: "20-99999905-5",
        nombre: "Cooperativa Yerbal Chico (ficticio)",
        provincia: "Misiones",
    },
];
exports.E1 = "18.012.0.00417/00";
exports.E2 = "18.036.0.00982/00";
exports.E6 = "18.044.0.00540/00";
exports.E3 = "22.058.0.01355/00";
exports.E4 = "34.021.0.00268/00";
exports.E5 = "54.012.0.00731/00";
// Nota: orden de tuplas E1, E2, E6, E3, E4, E5
exports.ESTABLECIMIENTOS = [
    {
        renspa: exports.E1,
        productorId: "PRD-01",
        nombre: "Estancia Los Ñandubay",
        provincia: "Corrientes",
        departamento: "Mercedes",
        localidad: "Mercedes",
        actividad: "CRIA",
        supDeclaradaHa: 620,
        habilitadoUe: true,
        fechaAlta: "2012-05-14",
    },
    {
        renspa: exports.E2,
        productorId: "PRD-02",
        nombre: "La Aguará",
        provincia: "Corrientes",
        departamento: "Curuzú Cuatiá",
        localidad: "Curuzú Cuatiá",
        actividad: "RECRIA_ENGORDE",
        supDeclaradaHa: 540,
        habilitadoUe: true,
        fechaAlta: "2015-03-02",
    },
    {
        renspa: exports.E6,
        productorId: "PRD-01",
        nombre: "Recría El Mburucuyá",
        provincia: "Corrientes",
        departamento: "Esquina",
        localidad: "Esquina",
        actividad: "RECRIA",
        supDeclaradaHa: 310,
        habilitadoUe: true,
        fechaAlta: "2019-08-21",
    },
    {
        renspa: exports.E3,
        productorId: "PRD-03",
        nombre: "Campo Don Teodoro",
        provincia: "Chaco",
        departamento: "General Güemes (ficticio)",
        localidad: "Juan José Castelli",
        actividad: "CRIA",
        supDeclaradaHa: 1450,
        habilitadoUe: false,
        fechaAlta: "2010-11-09",
    },
    {
        renspa: exports.E4,
        productorId: "PRD-04",
        nombre: "Lapacho Porá",
        provincia: "Formosa",
        departamento: "Patiño",
        localidad: "Ibarreta",
        actividad: "INVERNADA",
        supDeclaradaHa: 980,
        habilitadoUe: true,
        fechaAlta: "2017-06-30",
    },
    {
        renspa: exports.E5,
        productorId: "PRD-05",
        nombre: "Chacra Yerbal",
        provincia: "Misiones",
        departamento: "Eldorado",
        localidad: "Eldorado",
        actividad: "CRIA",
        supDeclaradaHa: 45,
        habilitadoUe: false,
        fechaAlta: "2021-02-11",
    },
];
exports.FRIGORIFICOS = [
    {
        id: "FRI-01",
        nombre: "Frigorífico Costa Grande S.A. (ficticio)",
        codigo: "FICT-0001",
        localidad: "Goya",
        provincia: "Corrientes",
        habilitadoUe: true,
        vigenciaHasta: "2027-03-31",
    },
];
exports.FORMA = [
    [-1.0, -0.7],
    [1.1, -0.8],
    [1.2, 0.6],
    [0.1, 0.9],
    [-1.0, 0.5],
];
exports.FECHA_CORTE_EUDR = "2020-12-31";
function kmOffsetToPolygon(centroLat, centroLng, escala) {
    const latRad = (centroLat * Math.PI) / 180;
    const kmPerDegLat = 111.0;
    const kmPerDegLng = 111.0 * Math.cos(latRad);
    const vertices = exports.FORMA.map(([dxKm, dyKm]) => {
        const lat = Number((centroLat + (dyKm * escala) / kmPerDegLat).toFixed(6));
        const lng = Number((centroLng + (dxKm * escala) / kmPerDegLng).toFixed(6));
        return [lat, lng];
    });
    // Cerrar el poligono repitiendo el primer vertice
    if (vertices.length > 0) {
        vertices.push([vertices[0][0], vertices[0][1]]);
    }
    return vertices;
}
const PARCELAS_DEF = [
    {
        id: "PAR-01",
        renspa: exports.E1,
        centro: [-29.215, -58.085],
        escala: 1.0,
        metodo: "AGRIMENSOR",
        nivelConfianza: "registrado",
        zonaDeforestadaPre2020: false,
    },
    {
        id: "PAR-02",
        renspa: exports.E2,
        centro: [-29.82, -57.98],
        escala: 0.9,
        metodo: "AGRIMENSOR",
        nivelConfianza: "registrado",
        zonaDeforestadaPre2020: false,
    },
    {
        id: "PAR-03",
        renspa: exports.E3,
        centro: [-25.94, -60.7],
        escala: 1.4,
        metodo: "AGRIMENSOR",
        nivelConfianza: "registrado",
        zonaDeforestadaPre2020: true,
    },
    {
        id: "PAR-04",
        renspa: exports.E4,
        centro: [-25.23, -59.9],
        escala: 1.2,
        metodo: "PRODUCTOR_DIBUJO",
        nivelConfianza: "declarado",
        zonaDeforestadaPre2020: false,
    },
    {
        id: "PAR-05",
        renspa: exports.E5,
        centro: [-26.43, -54.68],
        escala: 0.35,
        metodo: "PRODUCTOR_DIBUJO",
        nivelConfianza: "declarado",
        zonaDeforestadaPre2020: false,
    },
    {
        id: "PAR-06",
        renspa: exports.E6,
        centro: [-30.015, -59.52],
        escala: 0.7,
        metodo: "AGRIMENSOR",
        nivelConfianza: "registrado",
        zonaDeforestadaPre2020: false,
    },
];
exports.PARCELAS = PARCELAS_DEF.map((def) => ({
    id: def.id,
    renspa: def.renspa,
    centroLat: def.centro[0],
    centroLng: def.centro[1],
    escala: def.escala,
    metodo: def.metodo,
    nivelConfianza: def.nivelConfianza,
    poligono: kmOffsetToPolygon(def.centro[0], def.centro[1], def.escala),
    zonaDeforestadaPre2020: def.zonaDeforestadaPre2020,
    fechaCorteEudr: exports.FECHA_CORTE_EUDR,
}));
function rfid(n) {
    return "032000000000" + String(n).padStart(3, "0");
}
exports.DTES = [
    {
        id: "DTE-1001",
        origenRenspa: exports.E1,
        destinoTipo: "ESTABLECIMIENTO",
        destinoId: exports.E2,
        fechaEmision: "2026-03-09",
        fechaCierre: "2026-03-10",
        motivo: "RECRIA_ENGORDE",
        animalesIds: ["A001", "A002"],
    },
    {
        id: "DTE-1002",
        origenRenspa: exports.E1,
        destinoTipo: "ESTABLECIMIENTO",
        destinoId: exports.E2,
        fechaEmision: "2025-06-04",
        fechaCierre: "2025-06-05",
        motivo: "RECRIA_ENGORDE",
        animalesIds: ["A003", "A004"],
    },
    {
        id: "DTE-1003",
        origenRenspa: exports.E2,
        destinoTipo: "FRIGORIFICO",
        destinoId: "FRI-01",
        fechaEmision: "2026-10-07",
        fechaCierre: "2026-10-07",
        motivo: "FAENA",
        animalesIds: ["A001", "A002", "A003", "A004"],
    },
    {
        id: "DTE-1004",
        origenRenspa: exports.E3,
        destinoTipo: "ESTABLECIMIENTO",
        destinoId: exports.E4,
        fechaEmision: "2025-07-14",
        fechaCierre: "2025-07-15",
        motivo: "INVERNADA",
        animalesIds: ["A005", "A006"],
    },
    {
        id: "DTE-1005",
        origenRenspa: exports.E4,
        destinoTipo: "FRIGORIFICO",
        destinoId: "FRI-01",
        fechaEmision: "2026-10-08",
        fechaCierre: "2026-10-08",
        motivo: "FAENA",
        animalesIds: ["A005", "A006", "A007", "A008"],
    },
    {
        id: "DTE-1006",
        origenRenspa: exports.E5,
        destinoTipo: "ESTABLECIMIENTO",
        destinoId: exports.E6,
        fechaEmision: "2026-04-01",
        fechaCierre: "2026-04-02",
        motivo: "RECRIA",
        animalesIds: ["A009", "A010"],
    },
    {
        id: "DTE-1007",
        origenRenspa: exports.E6,
        destinoTipo: "FRIGORIFICO",
        destinoId: "FRI-01",
        fechaEmision: "2026-10-10",
        fechaCierre: "2026-10-10",
        motivo: "FAENA",
        animalesIds: ["A009", "A010", "A012"],
    },
    {
        id: "DTE-1008",
        origenRenspa: exports.E1,
        destinoTipo: "ESTABLECIMIENTO",
        destinoId: exports.E2,
        fechaEmision: "2025-08-19",
        fechaCierre: "2025-08-20",
        motivo: "RECRIA_ENGORDE",
        animalesIds: ["A011"],
    },
    {
        id: "DTE-1009",
        origenRenspa: exports.E2,
        destinoTipo: "FRIGORIFICO",
        destinoId: "FRI-01",
        fechaEmision: "2026-10-10",
        fechaCierre: "2026-10-10",
        motivo: "FAENA",
        animalesIds: ["A011"],
    },
];
exports.LOTES = [
    {
        id: "LOT-2026-0101",
        frigorificoId: "FRI-01",
        fechaFaena: "2026-10-08",
        cantidadAnimales: 4,
        producto: "Carne bovina refrigerada",
        destino: "UE (Países Bajos)",
        animalesIds: ["A001", "A002", "A003", "A004"],
    },
    {
        id: "LOT-2026-0102",
        frigorificoId: "FRI-01",
        fechaFaena: "2026-10-09",
        cantidadAnimales: 4,
        producto: "Carne bovina refrigerada",
        destino: "UE (Alemania)",
        animalesIds: ["A005", "A006", "A007", "A008"],
    },
    {
        id: "LOT-2026-0103",
        frigorificoId: "FRI-01",
        fechaFaena: "2026-10-12",
        cantidadAnimales: 5,
        producto: "Carne bovina refrigerada",
        destino: "UE (Italia)",
        animalesIds: ["A009", "A010", "A011", "A012"],
    },
];
const ANIMALES_SEED = [
    {
        animalCodigo: "A001",
        tipoIdentificacion: "RFID",
        caravana: rfid(1),
        sexo: "M",
        categoria: "novillito",
        raza: "Braford",
        fechaNacimiento: "2025-09-01",
        establecimientoNacimientoRenspa: exports.E1,
        fechaIdentificacion: "2026-02-20",
        pesoKg: 340,
        estadoSanitario: "Apto",
        motivoObservacion: null,
    },
    {
        animalCodigo: "A002",
        tipoIdentificacion: "RFID",
        caravana: rfid(2),
        sexo: "M",
        categoria: "novillito",
        raza: "Braford",
        fechaNacimiento: "2025-09-01",
        establecimientoNacimientoRenspa: exports.E1,
        fechaIdentificacion: "2026-02-20",
        pesoKg: 352,
        estadoSanitario: "Apto",
        motivoObservacion: null,
    },
    {
        animalCodigo: "A003",
        tipoIdentificacion: "ANALOGICA",
        caravana: "CUIG1741-0003",
        sexo: "M",
        categoria: "novillo",
        raza: "Braford",
        fechaNacimiento: "2024-09-01",
        establecimientoNacimientoRenspa: exports.E1,
        fechaIdentificacion: "2025-04-10",
        pesoKg: 445,
        estadoSanitario: "Apto",
        motivoObservacion: null,
    },
    {
        animalCodigo: "A004",
        tipoIdentificacion: "ANALOGICA",
        caravana: "CUIG1741-0004",
        sexo: "M",
        categoria: "novillo",
        raza: "Braford",
        fechaNacimiento: "2024-09-01",
        establecimientoNacimientoRenspa: exports.E1,
        fechaIdentificacion: "2025-04-10",
        pesoKg: 458,
        estadoSanitario: "Apto",
        motivoObservacion: null,
    },
    {
        animalCodigo: "A005",
        tipoIdentificacion: "ANALOGICA",
        caravana: "CUIG2210-0005",
        sexo: "M",
        categoria: "novillo",
        raza: "Brangus",
        fechaNacimiento: "2024-10-01",
        establecimientoNacimientoRenspa: exports.E3,
        fechaIdentificacion: "2025-04-15",
        pesoKg: 435,
        estadoSanitario: "Observado",
        motivoObservacion: "Animal en estado Observado: vacunación antiaftosa vencida, establecimiento de origen sin habilitación UE y superposición con polígono de desmonte pre-2020",
    },
    {
        animalCodigo: "A006",
        tipoIdentificacion: "ANALOGICA",
        caravana: "CUIG2210-0006",
        sexo: "M",
        categoria: "novillo",
        raza: "Brangus",
        fechaNacimiento: "2024-10-01",
        establecimientoNacimientoRenspa: exports.E3,
        fechaIdentificacion: "2025-04-15",
        pesoKg: 440,
        estadoSanitario: "Observado",
        motivoObservacion: "Animal en estado Observado: establecimiento de cría no habilitado UE y alerta ambiental en zona de crianza",
    },
    {
        animalCodigo: "A007",
        tipoIdentificacion: "ANALOGICA",
        caravana: "CUIG3402-0007",
        sexo: "M",
        categoria: "novillo",
        raza: "Brangus",
        fechaNacimiento: "2024-11-01",
        establecimientoNacimientoRenspa: exports.E4,
        fechaIdentificacion: "2025-05-10",
        pesoKg: 462,
        estadoSanitario: "Apto",
        motivoObservacion: null,
    },
    {
        animalCodigo: "A008",
        tipoIdentificacion: "RFID",
        caravana: rfid(8),
        sexo: "H",
        categoria: "vaquillona",
        raza: "Brangus",
        fechaNacimiento: "2025-08-01",
        establecimientoNacimientoRenspa: exports.E4,
        fechaIdentificacion: "2026-01-25",
        pesoKg: 335,
        estadoSanitario: "Apto",
        motivoObservacion: null,
    },
    {
        animalCodigo: "A009",
        tipoIdentificacion: "RFID",
        caravana: rfid(9),
        sexo: "M",
        categoria: "novillito",
        raza: "Criollo x Brahman",
        fechaNacimiento: "2025-09-01",
        establecimientoNacimientoRenspa: exports.E5,
        fechaIdentificacion: "2026-02-10",
        pesoKg: 325,
        estadoSanitario: "Apto",
        motivoObservacion: null,
    },
    {
        animalCodigo: "A010",
        tipoIdentificacion: "RFID",
        caravana: rfid(10),
        sexo: "M",
        categoria: "novillito",
        raza: "Criollo x Brahman",
        fechaNacimiento: "2025-09-01",
        establecimientoNacimientoRenspa: exports.E5,
        fechaIdentificacion: "2026-02-10",
        pesoKg: 330,
        estadoSanitario: "Apto",
        motivoObservacion: null,
    },
    {
        animalCodigo: "A011",
        tipoIdentificacion: "ANALOGICA",
        caravana: "CUIG1741-0011",
        sexo: "M",
        categoria: "novillo",
        raza: "Braford",
        fechaNacimiento: "2024-10-01",
        establecimientoNacimientoRenspa: exports.E1,
        fechaIdentificacion: "2025-04-20",
        pesoKg: 450,
        estadoSanitario: "Apto",
        motivoObservacion: null,
    },
    {
        animalCodigo: "A012",
        tipoIdentificacion: "ANALOGICA",
        caravana: "CUIG1830-0012",
        sexo: "M",
        categoria: "novillo",
        raza: "Braford",
        fechaNacimiento: "2024-09-01",
        establecimientoNacimientoRenspa: exports.E2,
        fechaIdentificacion: "2025-04-25",
        pesoKg: 465,
        estadoSanitario: "Apto",
        motivoObservacion: null,
    },
];
function buildGeolocalizacionCrianza(renspa, indexOffset) {
    const est = exports.ESTABLECIMIENTOS.find((e) => e.renspa === renspa) ?? exports.ESTABLECIMIENTOS[0];
    const parcela = exports.PARCELAS.find((p) => p.renspa === renspa) ?? exports.PARCELAS[0];
    // Pequeña variacion deterministica dentro del poligono de crianza
    const dLat = ((indexOffset % 3) - 1) * 0.0012 * parcela.escala;
    const dLng = (((indexOffset >> 1) % 3) - 1) * 0.0012 * parcela.escala;
    const latitud = Number((parcela.centroLat + dLat).toFixed(6));
    const longitud = Number((parcela.centroLng + dLng).toFixed(6));
    const deforestada = parcela.zonaDeforestadaPre2020;
    return {
        latitud,
        longitud,
        establecimientoRenspa: est.renspa,
        establecimientoNombre: est.nombre,
        provincia: est.provincia,
        departamento: est.departamento,
        localidad: est.localidad,
        parcelaId: parcela.id,
        poligono: parcela.poligono,
        metodoGeolocalizacion: parcela.metodo,
        confianzaGeolocalizacion: parcela.nivelConfianza,
        dentroDePoligono: true,
        zonaDeforestadaPre2020: deforestada,
        fechaCorteEudr: parcela.fechaCorteEudr,
        nivelRiesgoEudr: deforestada ? "alto_observado" : "bajo",
        detalleAmbiental: deforestada
            ? `Alerta EUDR: la parcela ${parcela.id} (${est.nombre}, ${est.provincia}) presenta superposición con registro de desmonte / deforestación anterior al corte ${parcela.fechaCorteEudr} y el establecimiento no cuenta con habilitación UE.`
            : `Cumplimiento EUDR verificado: parcela ${parcela.id} (${est.nombre}, ${est.provincia}) libre de deforestación verificada en referencia a ${parcela.fechaCorteEudr}.`,
    };
}
function resolveEstablecimientoActual(animalCodigo, nacimientoRenspa) {
    let actual = nacimientoRenspa;
    for (const dte of exports.DTES) {
        if (dte.animalesIds.includes(animalCodigo) &&
            dte.destinoTipo === "ESTABLECIMIENTO") {
            actual = dte.destinoId;
        }
    }
    return actual;
}
const DEFAULT_SYNCED_AT = "2026-10-16T18:00:00.000Z";
exports.ANIMALES_MOCK = ANIMALES_SEED.map((seed, idx) => {
    const estNacimiento = exports.ESTABLECIMIENTOS.find((e) => e.renspa === seed.establecimientoNacimientoRenspa) ?? exports.ESTABLECIMIENTOS[0];
    const productor = exports.PRODUCTORES.find((p) => p.id === estNacimiento.productorId) ??
        exports.PRODUCTORES[0];
    const movimientosIds = exports.DTES.filter((d) => d.animalesIds.includes(seed.animalCodigo)).map((d) => d.id);
    const lote = exports.LOTES.find((l) => l.animalesIds.includes(seed.animalCodigo));
    return {
        id: `senasa-animal-${seed.animalCodigo.toLowerCase()}`,
        animalCodigo: seed.animalCodigo,
        productorId: productor.id,
        productorCuit: productor.cuit,
        caravana: seed.caravana,
        tipoIdentificacion: seed.tipoIdentificacion,
        sexo: seed.sexo,
        categoria: seed.categoria,
        raza: seed.raza,
        peso: seed.pesoKg,
        pesoKg: seed.pesoKg,
        estadoSanitario: seed.estadoSanitario,
        motivoObservacion: seed.motivoObservacion,
        fechaNacimiento: seed.fechaNacimiento,
        establecimientoNacimientoRenspa: seed.establecimientoNacimientoRenspa,
        establecimientoActualRenspa: resolveEstablecimientoActual(seed.animalCodigo, seed.establecimientoNacimientoRenspa),
        fechaIdentificacion: seed.fechaIdentificacion,
        geolocalizacionCrianza: buildGeolocalizacionCrianza(seed.establecimientoNacimientoRenspa, idx),
        movimientosIds,
        loteId: lote ? lote.id : null,
        syncedAt: DEFAULT_SYNCED_AT,
    };
});
exports.CUIT_ALIASES = {
    "20-00000000-0": "20-99999903-3",
    "20-99999999-9": "20-99999903-3",
};
function normalizeCuit(cuit) {
    const digits = String(cuit ?? "").replace(/\D/g, "");
    if (digits.length === 11) {
        return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
    }
    return String(cuit ?? "").trim();
}
function buildMockSyncForCuit(cuitInput, persistencia = "memory_fallback") {
    const normalizedInput = normalizeCuit(cuitInput);
    const resolvedCuit = exports.CUIT_ALIASES[normalizedInput] ?? normalizedInput;
    const targetProductor = exports.PRODUCTORES.find((p) => p.cuit === resolvedCuit);
    if (!targetProductor) {
        return null;
    }
    // Si se consulto usando el CUIT de prueba (ej. 20-00000000-0), preservamos el CUIT solicitado
    // en el objeto productor y animales sincronizados para que coincida con la consulta/persistencia.
    const productor = {
        ...targetProductor,
        cuit: normalizedInput,
    };
    const establecimientos = exports.ESTABLECIMIENTOS.filter((e) => e.productorId === targetProductor.id);
    const renspasProductor = new Set(establecimientos.map((e) => e.renspa));
    const animalesIdsEnDtesDelProductor = new Set();
    for (const dte of exports.DTES) {
        const tocaOrigen = renspasProductor.has(dte.origenRenspa);
        const tocaDestino = dte.destinoTipo === "ESTABLECIMIENTO" &&
            renspasProductor.has(dte.destinoId);
        if (tocaOrigen || tocaDestino) {
            for (const animalId of dte.animalesIds) {
                animalesIdsEnDtesDelProductor.add(animalId);
            }
        }
    }
    const syncedAt = new Date().toISOString();
    const animales = exports.ANIMALES_MOCK.filter((animal) => animal.productorId === targetProductor.id ||
        renspasProductor.has(animal.establecimientoNacimientoRenspa) ||
        renspasProductor.has(animal.establecimientoActualRenspa) ||
        animalesIdsEnDtesDelProductor.has(animal.animalCodigo)).map((animal) => ({
        ...animal,
        productorId: productor.id,
        productorCuit: productor.cuit,
        syncedAt,
    }));
    const totalAnimales = animales.length;
    const aptos = animales.filter((a) => a.estadoSanitario === "Apto").length;
    const observados = animales.filter((a) => a.estadoSanitario === "Observado").length;
    const conAlertaDeforestacionPre2020 = animales.filter((a) => a.geolocalizacionCrianza.zonaDeforestadaPre2020).length;
    const flujoDemo = observados > 0 || conAlertaDeforestacionPre2020 > 0
        ? "negativo_observado"
        : "positivo";
    return {
        productor,
        establecimientos,
        animales,
        resumen: {
            totalAnimales,
            aptos,
            observados,
            conAlertaDeforestacionPre2020,
            flujoDemo,
        },
        persistencia,
        syncedAt,
    };
}
//# sourceMappingURL=senasaMockData.js.map