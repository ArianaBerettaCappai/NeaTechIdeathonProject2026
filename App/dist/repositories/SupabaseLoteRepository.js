"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseLoteRepository = void 0;
function rowToLotePublicado(loteRow, animalRows) {
    return {
        id: loteRow.id,
        productorCuit: loteRow.productor_cuit,
        precioPorKg: Number(loteRow.precio_por_kg),
        animales: animalRows.map((a) => ({
            animalCodigo: a.animal_codigo,
            pesoKg: Number(a.peso_kg),
            esAptoUe: Boolean(a.es_apto_ue),
        })),
        pesoTotalKg: Number(loteRow.peso_total_kg),
        montoTotal: Number(loteRow.monto_total),
        publicadoAt: loteRow.publicado_at,
    };
}
class SupabaseLoteRepository {
    client;
    memoryLotesById = new Map();
    constructor(client) {
        this.client = client;
    }
    saveToMemory(lote) {
        const cloned = {
            ...lote,
            animales: lote.animales.map((a) => ({ ...a })),
        };
        this.memoryLotesById.set(cloned.id, cloned);
        return cloned;
    }
    async guardarLote(lote) {
        const memorySaved = this.saveToMemory(lote);
        if (!this.client) {
            return memorySaved;
        }
        try {
            const publicadoAt = lote.publicadoAt || new Date().toISOString();
            const lotePayload = {
                productor_cuit: lote.productorCuit,
                precio_por_kg: lote.precioPorKg,
                peso_total_kg: lote.pesoTotalKg,
                monto_total: lote.montoTotal,
                publicado_at: publicadoAt,
            };
            if (lote.id) {
                lotePayload.id = lote.id;
            }
            const { data: loteData, error: loteError } = await this.client
                .from("lotes")
                .upsert(lotePayload, { onConflict: "id" })
                .select("*")
                .single();
            if (loteError || !loteData) {
                return memorySaved;
            }
            const persistedLoteRow = loteData;
            if (lote.animales.length === 0) {
                const persisted = rowToLotePublicado(persistedLoteRow, []);
                return this.saveToMemory(persisted);
            }
            const animalesPayload = lote.animales.map((a) => ({
                lote_id: persistedLoteRow.id,
                animal_codigo: a.animalCodigo,
                productor_cuit: persistedLoteRow.productor_cuit,
                peso_kg: a.pesoKg,
                es_apto_ue: a.esAptoUe,
            }));
            const { data: animalesData, error: animalesError } = await this.client
                .from("lote_animales")
                .upsert(animalesPayload, { onConflict: "lote_id,animal_codigo" })
                .select("*");
            if (animalesError || !animalesData) {
                return memorySaved;
            }
            const persisted = rowToLotePublicado(persistedLoteRow, animalesData);
            return this.saveToMemory(persisted);
        }
        catch {
            return memorySaved;
        }
    }
}
exports.SupabaseLoteRepository = SupabaseLoteRepository;
//# sourceMappingURL=SupabaseLoteRepository.js.map