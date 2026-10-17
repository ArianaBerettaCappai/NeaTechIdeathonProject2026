import { LotePublicado } from "../models/Lote";

export interface LoteRepository {
  guardarLote(lote: LotePublicado): Promise<LotePublicado>;
}
