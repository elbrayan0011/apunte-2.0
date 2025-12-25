import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Trophy } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useScoreboard } from "@/contexts/ScoreboardContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MatchDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { gameHistory, backgroundGradient } = useScoreboard();
  const { t, language } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();

  const game = gameHistory.find((g) => g.id === id);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (!game) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={backgroundGradient as [string, string, ...string[]]}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={28} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.headerTitle}>{t("matchDetails")}</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{t("matchNotFound")}</Text>
          </View>
        </View>
      </View>
    );
  }

  const maxRounds = Math.max(...game.players.map((p) => p.scoreHistory.length));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={backgroundGradient as [string, string, ...string[]]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={28} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>{t("matchDetails")}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.matchInfoCard}>
            <Text style={styles.matchDate}>{formatDate(game.date)}</Text>
            
            {game.winnerIndex !== null && (
              <View style={styles.winnerBanner}>
                <Trophy size={24} color="#FFD700" />
                <Text style={styles.winnerBannerText}>
                  {game.players[game.winnerIndex]?.name || `Player ${game.winnerIndex + 1}`} {t("wins")}!
                </Text>
              </View>
            )}

            <View style={styles.finalScoresContainer}>
              {game.players.map((player, index) => (
                <View key={`final-${index}`} style={styles.finalScoreItem}>
                  <Text style={styles.playerNameFinal}>{player.name}</Text>
                  <View style={styles.finalScoreBox}>
                    <Text style={[
                      styles.finalScoreValue,
                      game.winnerIndex === index && styles.finalScoreValueWinner
                    ]}>
                      {player.finalScore}
                    </Text>
                    <Text style={styles.finalScoreLimit}>/{game.limit}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.roundsSection}>
            <Text style={styles.sectionTitle}>{t("roundByRound")}</Text>
            
            <View style={styles.roundsTable}>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.roundHeaderCell}>{t("round")}</Text>
                {game.players.map((player, index) => (
                  <Text key={`header-${index}`} style={styles.playerHeaderCell} numberOfLines={1}>
                    {player.name}
                  </Text>
                ))}
              </View>

              {Array.from({ length: maxRounds }).map((_, roundIndex) => (
                <View key={`round-${roundIndex}`} style={styles.tableRow}>
                  <View style={styles.roundNumberCell}>
                    <Text style={styles.roundNumberText}>{roundIndex + 1}</Text>
                  </View>
                  {game.players.map((player, playerIndex) => {
                    const points = player.scoreHistory[roundIndex] || 0;
                    const runningTotal = player.scoreHistory.slice(0, roundIndex + 1).reduce((sum, p) => sum + p, 0);
                    
                    return (
                      <View key={`round-${roundIndex}-player-${playerIndex}`} style={styles.scoreCell}>
                        <Text style={styles.scoreCellPoints}>
                          {points === 0 ? "0" : `+${points}`}
                        </Text>
                        <Text style={styles.scoreCellRunningTotal}>({runningTotal})</Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>{t("summary")}</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("totalRounds")}:</Text>
                <Text style={styles.summaryValue}>{maxRounds}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("goal")}:</Text>
                <Text style={styles.summaryValue}>{game.limit}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("players")}:</Text>
                <Text style={styles.summaryValue}>{game.playerCount}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 2,
    borderColor: "#8B0000",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    textAlign: "center",
  },
  placeholder: {
    width: 48,
  },
  scrollView: {
    flex: 1,
  },
  matchInfoCard: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#8B0000",
    padding: 20,
    marginBottom: 20,
  },
  matchDate: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#999",
    textAlign: "center",
    marginBottom: 16,
  },
  winnerBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  winnerBannerText: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#FFD700",
    textTransform: "uppercase",
  },
  finalScoresContainer: {
    gap: 12,
  },
  finalScoreItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  playerNameFinal: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    flex: 1,
  },
  finalScoreBox: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  finalScoreValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  finalScoreValueWinner: {
    color: "#FFD700",
  },
  finalScoreLimit: {
    fontSize: 18,
    fontWeight: "400" as const,
    color: "#666",
  },
  roundsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  roundsTable: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#8B0000",
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "rgba(139, 0, 0, 0.3)",
    borderBottomWidth: 2,
    borderBottomColor: "#8B0000",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  roundHeaderCell: {
    width: 60,
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    textAlign: "center",
  },
  playerHeaderCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  roundNumberCell: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  roundNumberText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#DC143C",
  },
  scoreCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  scoreCellPoints: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  scoreCellRunningTotal: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "#666",
    marginTop: 2,
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#8B0000",
    padding: 20,
    gap: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#999",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#999",
  },
});
