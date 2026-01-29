// src/types/signalement.ts
export type SignalementStatut = "signale" | "valide" | "en_cours" | "collecte" | "refuse";

export type TypeEncombrant = 
    | "meuble" 
    | "electromenager" 
    | "dechets_verts" 
    | "plastiques" 
    | "bois" 
    | "verre";

export type Signalement = {
    _id: string;
    description?: string;
    typeEncombrant?: TypeEncombrant | string;
    statut?: SignalementStatut | string;
    dateSignalement?: string;
    adresse?: string;
    ville?: string;
    codePostal?: string;
    lat?: number | null;
    lon?: number | null;
    photoFilename?: string | null;
    pointsAttribues?: number;
    createdAt?: string;
    updatedAt?: string;
};

// Labels français pour l'affichage
export const TYPE_ENCOMBRANT_LABELS: Record<TypeEncombrant, string> = {
    meuble: "Meuble",
    electromenager: "Électroménager",
    dechets_verts: "Déchets verts",
    plastiques: "Plastiques",
    bois: "Bois",
    verre: "Verre",
};

export const STATUT_LABELS: Record<SignalementStatut, string> = {
    signale: "Signalé",
    valide: "Validé",
    en_cours: "En cours",
    collecte: "Collecté",
    refuse: "Refusé",
};
