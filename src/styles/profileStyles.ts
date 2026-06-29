// src/styles/profileStyles.ts
// Styles pour la page profil

import { StyleSheet } from "react-native";
import { COLORS } from "./colors";

export const profileStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    padding: 16,
    gap: 14,
    paddingBottom: 30,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.muted,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.title,
  },

  // Messages
  errorBox: {
    backgroundColor: "rgba(176,0,32,0.1)",
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    color: COLORS.danger,
    fontWeight: "700",
  },
  successBox: {
    backgroundColor: "rgba(112,190,85,0.15)",
    padding: 12,
    borderRadius: 12,
  },
  successText: {
    color: COLORS.green,
    fontWeight: "700",
  },

  // Header card (avatar)
  headerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 999,
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.card,
  },
  avatarEditIcon: {
    fontSize: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.title,
  },
  userEmail: {
    marginTop: 4,
    color: COLORS.muted,
    fontWeight: "600",
  },
  locationBadge: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(112,190,85,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  locationIcon: {
    fontSize: 14,
  },
  locationText: {
    color: COLORS.green,
    fontWeight: "700",
    fontSize: 13,
  },
  // Ancien badge de rôle (gardé pour compatibilité)
  roleBadge: {
    marginTop: 10,
    backgroundColor: "rgba(6,102,140,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  roleText: {
    color: COLORS.blue,
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
  },

  // Stats card
  statsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.title,
  },
  statLabel: {
    marginTop: 4,
    color: COLORS.muted,
    fontWeight: "600",
    fontSize: 13,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },

  // Card générique
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.title,
  },
  editLink: {
    color: COLORS.blue,
    fontWeight: "800",
  },

  // Info list (mode lecture)
  infoList: {},
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    color: COLORS.muted,
    fontWeight: "600",
  },
  infoValue: {
    color: COLORS.text,
    fontWeight: "700",
  },

  // Form (mode édition)
  form: {},
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.title,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  editActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  cancelBtnText: {
    color: COLORS.muted,
    fontWeight: "800",
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: COLORS.green,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "800",
  },

  // Actions card
  actionsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    color: COLORS.text,
    fontWeight: "700",
  },
  actionArrow: {
    color: COLORS.muted,
    fontSize: 16,
  },

  // Logout button
  logoutBtn: {
    backgroundColor: "rgba(176,0,32,0.1)",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  logoutBtnText: {
    color: COLORS.danger,
    fontWeight: "800",
  },

  // Version
  version: {
    textAlign: "center",
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 8,
  },

  // Équipe
  teamInfo: {
    padding: 16,
    alignItems: "center",
  },
  teamLeaderText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.blue,
    marginBottom: 4,
  },
  teamZoneText: {
    fontSize: 14,
    color: COLORS.muted,
  },
});
