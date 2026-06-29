// src/types/user.ts
export type UserRole = "citoyen" | "agent" | "chef_agent" | "gestionnaire";

export type ChefAgentRef = {
  _id: string;
  name?: string;
  email?: string;
  perimetreVille?: string;
};

export type User = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;

  // Adresse
  adresse?: string;
  ville?: string;
  codePostal?: string;
  perimetreVille?: string | null;

  // Chef d'agent (pour les agents)
  chefAgent?: string | ChefAgentRef | null;

  // Points & Cashback
  pointsTotal: number;
  cashbackUsedTotal?: number;
  decheterieAccountNumber?: string | null;

  // Photo de profil
  profilePicture?: string | null;

  // État
  isActive?: boolean;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
};

// Pour l'affichage
export const ROLE_LABELS: Record<UserRole, string> = {
  citoyen: "Citoyen",
  agent: "Agent",
  chef_agent: "Chef d'agent",
  gestionnaire: "Gestionnaire",
};
