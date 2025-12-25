import { LinearGradient } from "expo-linear-gradient";
import { Edit2, Globe, RotateCcw, Settings, Trophy, Users, X, Crown, ChevronRight } from "lucide-react-native";
import React from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { PlayerCount, useScoreboard } from "@/contexts/ScoreboardContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePremium } from "@/contexts/PremiumContext";
import { useAds } from "@/contexts/AdContext";
import { GRADIENTS } from "@/constants/colors";

function BannerAd({ onAdLoaded }: { onAdLoaded: (loaded: boolean) => void }) {
  React.useEffect(() => {
    onAdLoaded(false);
  }, [onAdLoaded]);

  return null;
}

export default function ScoreboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language, changeLanguage } = useLanguage();
  const { 
    isPremium, 
    offerings,
    purchasePackage, 
    restorePurchases,
    isPurchasing,
    isRestoring,
    getYearlyPackage,
  } = usePremium();
  const { initializeAds, showInterstitial, canShowAds } = useAds();
  const {
    limit,
    backgroundGradient,
    gameHistory,
    playerCount,
    players,
    incrementPlayer,
    removePlayerPoint,
    restart,
    saveGameToHistory,
    clearGameHistory,
    saveLimit,
    savePlayerCount,
    savePlayerName,
    saveBackgroundGradient,
  } = useScoreboard();

  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = React.useState<number>(0);
  const [pointsInput, setPointsInput] = React.useState<string>("");
  const [editingName, setEditingName] = React.useState(false);
  const [nameInput, setNameInput] = React.useState<string>("");
  const [winModalVisible, setWinModalVisible] = React.useState(false);
  const [winnerIndex, setWinnerIndex] = React.useState<number | null>(null);
  const [historyModalVisible, setHistoryModalVisible] = React.useState(false);
  const [playerCountModalVisible, setPlayerCountModalVisible] = React.useState(false);
  const [limitModalVisible, setLimitModalVisible] = React.useState(false);
  const [tempLimitInput, setTempLimitInput] = React.useState<string>(limit.toString());
  const [settingsMenuVisible, setSettingsMenuVisible] = React.useState(false);
  const [backgroundSelectorVisible, setBackgroundSelectorVisible] = React.useState(false);
  const [aboutModalVisible, setAboutModalVisible] = React.useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = React.useState(false);
  const [languageModalVisible, setLanguageModalVisible] = React.useState(false);
  const [premiumModalVisible, setPremiumModalVisible] = React.useState(false);
  const [purchaseResultVisible, setPurchaseResultVisible] = React.useState(false);
  const [purchaseResultMessage, setPurchaseResultMessage] = React.useState<string>("");
  const [purchaseResultTitle, setPurchaseResultTitle] = React.useState<string>("");

  const backgroundOptions = [
    { name: t("darkRed"), colors: GRADIENTS.redDark },
    { name: t("darkBlue"), colors: GRADIENTS.blueDark },
    { name: t("darkGreen"), colors: GRADIENTS.greenDark },
    { name: t("darkPurple"), colors: GRADIENTS.purpleDark },
    { name: t("darkOrange"), colors: GRADIENTS.orangeDark },
    { name: t("darkGray"), colors: GRADIENTS.grayDark },
  ];

  const scaleAnims = React.useRef(
    Array.from({ length: 4 }, () => new Animated.Value(1))
  ).current;

  const animateButton = (anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePlayerPress = (index: number) => {
    animateButton(scaleAnims[index]);
    setSelectedPlayerIndex(index);
    setNameInput(players[index].name);
    setModalVisible(true);
  };

  const handleAddPoints = () => {
    const points = parseInt(pointsInput, 10);
    if (!isNaN(points) && points > 0) {
      const newScore = Math.min(players[selectedPlayerIndex].score + points, limit);
      incrementPlayer(selectedPlayerIndex, points);
      if (newScore >= limit) {
        setWinnerIndex(selectedPlayerIndex);
        setWinModalVisible(true);
        saveGameToHistory(selectedPlayerIndex, points);
        console.log(`Game saved to history. Winner: ${players[selectedPlayerIndex].name}`);
        if (!isPremium && canShowAds) {
          showInterstitial();
        }
      }
    }
    setPointsInput("");
    setEditingName(false);
    setModalVisible(false);
  };

  const handleCancelModal = () => {
    setPointsInput("");
    setEditingName(false);
    setModalVisible(false);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      savePlayerName(selectedPlayerIndex, nameInput);
    }
    setEditingName(false);
  };

  const handleContinue = () => {
    setWinModalVisible(false);
    setWinnerIndex(null);
  };

  const handleRestartFromWin = () => {
    restart();
    setWinModalVisible(false);
    setWinnerIndex(null);
    if (!isPremium && canShowAds) {
      showInterstitial();
    }
  };

  const handleOpenHistory = () => {
    setHistoryModalVisible(true);
  };

  const handleCloseHistory = () => {
    setHistoryModalVisible(false);
  };

  const handleClearHistory = () => {
    clearGameHistory();
  };

  const handleSelectPlayerCount = (count: PlayerCount) => {
    savePlayerCount(count);
    setPlayerCountModalVisible(false);
  };

  const handleSaveLimit = () => {
    const newLimit = parseInt(tempLimitInput, 10);
    if (!isNaN(newLimit) && newLimit > 0) {
      saveLimit(newLimit);
    }
    setLimitModalVisible(false);
  };

  const handleSelectBackground = (gradient: string[]) => {
    saveBackgroundGradient(gradient);
    setBackgroundSelectorVisible(false);
    setSettingsMenuVisible(false);
  };

  React.useEffect(() => {
    if (!isPremium && Platform.OS !== "web") {
      initializeAds();
    }
  }, [isPremium, initializeAds]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleSelectLanguage = (lang: "en" | "es") => {
    changeLanguage(lang);
    setLanguageModalVisible(false);
    setSettingsMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={backgroundGradient as [string, string, ...string[]]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => setSettingsMenuVisible(true)}
            style={styles.settingsButton}
          >
            <Settings size={32} color="#FFFFFF" />
          </Pressable>

          <View style={styles.topRightButtons}>
            <Pressable
              onPress={() => setPlayerCountModalVisible(true)}
              style={styles.playerCountButton}
            >
              <Users size={24} color="#FFFFFF" />
              <Text style={styles.playerCountText}>{playerCount}</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setTempLimitInput(limit.toString());
                setLimitModalVisible(true);
              }}
              style={styles.limitBox}
            >
              <Text style={styles.limitText}>{limit}</Text>
              <Text style={styles.limitArrow}>›</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView 
          style={styles.scoresScrollContainer}
          contentContainerStyle={styles.scoresContainer}
        >
          <View style={[
            styles.playersGrid,
            playerCount === 3 && styles.playersGridThree,
            playerCount === 4 && styles.playersGridFour
          ]}>
            {players.slice(0, playerCount).map((player, index) => (
              <View key={`player-${index}`} style={styles.playerColumn}>
                <Animated.View
                  style={[
                    styles.teamButtonWrapper,
                    { transform: [{ scale: scaleAnims[index] }] },
                  ]}
                >
                  <Pressable onPress={() => handlePlayerPress(index)} style={styles.teamButton}>
                    <View style={styles.teamButtonGradient}>
                      <Text style={[
                        styles.teamLabel,
                        playerCount >= 3 && styles.teamLabelSmall
                      ]}>{player.name}</Text>
                      <Text style={[
                        styles.plusSign,
                        playerCount >= 3 && styles.plusSignSmall
                      ]}>+</Text>
                    </View>
                  </Pressable>
                </Animated.View>

                <View style={styles.scoreBox}>
                  <Text style={[
                    styles.scoreValue,
                    playerCount >= 3 && styles.scoreValueSmall
                  ]}>{player.score}</Text>
                  <Text style={[
                    styles.scoreLimit,
                    playerCount >= 3 && styles.scoreLimitSmall
                  ]}>/{limit}</Text>
                </View>
                
                {player.scoreHistory.length > 0 && (
                  <ScrollView 
                    horizontal={false}
                    showsVerticalScrollIndicator={false}
                    style={styles.historyScrollView}
                    contentContainerStyle={styles.historyColumn}
                  >
                    {player.scoreHistory.map((points, historyIndex) => (
                      <View key={`player-${index}-history-${historyIndex}`} style={styles.historyItemContainer}>
                        <Pressable
                          onPress={() => removePlayerPoint(historyIndex)}
                          style={styles.historyDeleteButton}
                        >
                          <X size={14} color="#DC143C" />
                        </Pressable>
                        <View style={styles.historyItem}>
                          <Text style={styles.historyText}>
                            {points === 0 ? "0" : `+${points}`}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.bottomControls}>
          <View style={styles.leftControls}>
            <Pressable onPress={handleOpenHistory} style={styles.historyButton}>
              <RotateCcw size={32} color="#FFFFFF" />
            </Pressable>

            <Pressable onPress={restart} style={styles.restartTextButton}>
              <Text style={styles.restartText}>{t("restart")}</Text>
            </Pressable>
          </View>

          {!isPremium && (
            <Pressable 
              style={styles.premiumButton}
              onPress={() => setPremiumModalVisible(true)}
            >
              <Crown size={20} color="#000000" />
              <Text style={styles.premiumText}>{t("premium")}</Text>
            </Pressable>
          )}
        </View>

        {!isPremium && Platform.OS !== "web" && (
          <BannerAd onAdLoaded={() => {}} />
        )}
      </View>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={handleCancelModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTitleContainer}>
              {!editingName ? (
                <>
                  <Text style={styles.modalTitle}>
                    {players[selectedPlayerIndex]?.name || `${t("playerLabel")} ${selectedPlayerIndex + 1}`}
                  </Text>
                  <Pressable
                    onPress={() => setEditingName(true)}
                    style={styles.editNameButton}
                  >
                    <Edit2 size={20} color="#FFFFFF" />
                  </Pressable>
                </>
              ) : (
                <View style={styles.nameEditContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={nameInput}
                    onChangeText={setNameInput}
                    placeholder={t("name")}
                    placeholderTextColor="#666"
                    autoFocus={true}
                    maxLength={20}
                  />
                  <Pressable
                    onPress={handleSaveName}
                    style={styles.saveNameButton}
                  >
                    <Text style={styles.saveNameText}>✓</Text>
                  </Pressable>
                </View>
              )}
            </View>
            
            {!editingName && (
              <>
                <Text style={styles.modalSubtitle}>
                  {t("howManyPointsWon")}
                </Text>

                <TextInput
                  style={styles.modalInput}
                  value={pointsInput}
                  onChangeText={setPointsInput}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="#666"
                  autoFocus={true}
                />

                <View style={styles.modalButtons}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.modalCancelButton,
                      pressed && styles.modalCancelButtonPressed,
                    ]}
                    onPress={handleCancelModal}
                  >
                    <Text style={styles.modalCancelText}>{t("cancel")}</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.modalConfirmButton,
                      pressed && styles.modalConfirmButtonPressed,
                    ]}
                    onPress={handleAddPoints}
                  >
                    <Text style={styles.modalConfirmText}>{t("add")}</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={winModalVisible}
        animationType="fade"
        onRequestClose={handleContinue}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.winModalContent}>
            <Text style={styles.winTitle}>🎉 {t("winner")} 🎉</Text>
            <Text style={styles.winTeamText}>
              {winnerIndex !== null ? players[winnerIndex].name.toUpperCase() : ""}
            </Text>
            <Text style={styles.winScoreText}>
              {winnerIndex !== null ? players[winnerIndex].score : 0} {t("points")}
            </Text>

            <View style={styles.winButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.winContinueButton,
                  pressed && styles.winContinueButtonPressed,
                ]}
                onPress={handleContinue}
              >
                <Text style={styles.winContinueText}>{t("continue")}</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.winRestartButton,
                  pressed && styles.winRestartButtonPressed,
                ]}
                onPress={handleRestartFromWin}
              >
                <Text style={styles.winRestartText}>{t("startOver")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={historyModalVisible}
        animationType="slide"
        onRequestClose={handleCloseHistory}
      >
        <View style={styles.historyModalOverlay}>
          <View style={styles.historyModalContent}>
            <View style={styles.historyModalHeader}>
              <Text style={styles.historyModalTitle}>{t("gameHistory")}</Text>
              <Pressable onPress={handleCloseHistory} style={styles.historyCloseButton}>
                <X size={28} color="#FFFFFF" />
              </Pressable>
            </View>

            {gameHistory.length === 0 ? (
              <View style={styles.emptyHistoryContainer}>
                <Trophy size={64} color="#666" />
                <Text style={styles.emptyHistoryText}>{t("noGamesRecorded")}</Text>
              </View>
            ) : (
              <>
                <ScrollView style={styles.historyList}>
                  {gameHistory.slice().reverse().map((game) => (
                    <Pressable
                      key={game.id}
                      style={({ pressed }) => [
                        styles.historyGameCard,
                        pressed && styles.historyGameCardPressed,
                      ]}
                      onPress={() => {
                        setHistoryModalVisible(false);
                        router.push(`/match-detail?id=${game.id}`);
                      }}
                    >
                      <View style={styles.historyGameHeader}>
                        <Text style={styles.historyGameDate}>
                          {formatDate(game.date)}
                        </Text>
                        {game.winnerIndex !== null && (
                          <View style={styles.winnerBadge}>
                            <Trophy size={16} color="#FFD700" />
                            <Text style={styles.winnerText}>
                              {game.players[game.winnerIndex]?.name || `Player ${game.winnerIndex + 1}`}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.historyGameScores}>
                        {game.players.map((player, index) => (
                          <View key={`${game.id}-player-${index}`} style={styles.historyPlayerScore}>
                            <Text style={styles.historyTeamName}>{player.name}</Text>
                            <Text style={[
                              styles.historyScore,
                              game.winnerIndex === index && styles.historyScoreWinner
                            ]}>
                              {player.finalScore}
                            </Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.historyGameFooter}>
                        <Text style={styles.historyGameLimit}>{t("goal")}: {game.limit}</Text>
                        <ChevronRight size={20} color="#666" />
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>

                <Pressable
                  style={({ pressed }) => [
                    styles.clearHistoryButton,
                    pressed && styles.clearHistoryButtonPressed,
                  ]}
                  onPress={handleClearHistory}
                >
                  <X size={20} color="#DC143C" />
                  <Text style={styles.clearHistoryText}>{t("clearHistory")}</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={playerCountModalVisible}
        animationType="fade"
        onRequestClose={() => setPlayerCountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("selectPlayers")}</Text>
            <Text style={styles.modalSubtitle}>
              {t("howManyPlayers")}
            </Text>

            <View style={styles.playerCountOptionsContainer}>
              {[2, 3, 4].map((count) => (
                <Pressable
                  key={count}
                  style={({ pressed }) => [
                    styles.playerCountOption,
                    pressed && styles.playerCountOptionPressed,
                    playerCount === count && styles.playerCountOptionActive,
                  ]}
                  onPress={() => handleSelectPlayerCount(count as PlayerCount)}
                >
                  <Text style={[
                    styles.playerCountOptionText,
                    playerCount === count && styles.playerCountOptionTextActive,
                  ]}>
                    {count}
                  </Text>
                  <Text style={styles.playerCountOptionLabel}>{t("players")}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.modalCancelButton,
                pressed && styles.modalCancelButtonPressed,
              ]}
              onPress={() => setPlayerCountModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>{t("close")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={limitModalVisible}
        animationType="fade"
        onRequestClose={() => setLimitModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("pointsLimit")}</Text>
            <Text style={styles.modalSubtitle}>
              {t("howManyPointsToWin")}
            </Text>

            <TextInput
              style={styles.modalInput}
              value={tempLimitInput}
              onChangeText={setTempLimitInput}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="#666"
              autoFocus={true}
            />

            <View style={styles.presetGrid}>
              {[50, 100, 200, 300, 500, 1000].map((preset) => (
                <Pressable
                  key={preset}
                  style={({ pressed }) => [
                    styles.presetButton,
                    pressed && styles.presetButtonPressed,
                    parseInt(tempLimitInput) === preset && styles.presetButtonActive,
                  ]}
                  onPress={() => setTempLimitInput(preset.toString())}
                >
                  <Text
                    style={[
                      styles.presetButtonText,
                      parseInt(tempLimitInput) === preset && styles.presetButtonTextActive,
                    ]}
                  >
                    {preset}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalCancelButton,
                  pressed && styles.modalCancelButtonPressed,
                ]}
                onPress={() => setLimitModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>{t("cancel")}</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.modalConfirmButton,
                  pressed && styles.modalConfirmButtonPressed,
                ]}
                onPress={handleSaveLimit}
              >
                <Text style={styles.modalConfirmText}>{t("save")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={settingsMenuVisible}
        animationType="fade"
        onRequestClose={() => setSettingsMenuVisible(false)}
      >
        <Pressable 
          style={styles.settingsModalOverlay}
          onPress={() => setSettingsMenuVisible(false)}
        >
          <View style={[styles.settingsMenu, { top: insets.top + 60 }]}>
            <Pressable
              style={({ pressed }) => [
                styles.settingsMenuItem,
                pressed && styles.settingsMenuItemPressed,
              ]}
              onPress={() => {
                setSettingsMenuVisible(false);
                setLanguageModalVisible(true);
              }}
            >
              <View style={styles.settingsMenuItemContent}>
                <Globe size={18} color="#FFFFFF" />
                <Text style={styles.settingsMenuItemText}>{t("language")}</Text>
              </View>
            </Pressable>

            <View style={styles.settingsMenuDivider} />

            <Pressable
              style={({ pressed }) => [
                styles.settingsMenuItem,
                pressed && styles.settingsMenuItemPressed,
              ]}
              onPress={() => {
                setSettingsMenuVisible(false);
                setBackgroundSelectorVisible(true);
              }}
            >
              <Text style={styles.settingsMenuItemText}>{t("changeBackground")}</Text>
            </Pressable>

            <View style={styles.settingsMenuDivider} />

            <Pressable
              style={({ pressed }) => [
                styles.settingsMenuItem,
                pressed && styles.settingsMenuItemPressed,
              ]}
              onPress={() => {
                setSettingsMenuVisible(false);
                setAboutModalVisible(true);
              }}
            >
              <Text style={styles.settingsMenuItemText}>{t("about")}</Text>
            </Pressable>

            <View style={styles.settingsMenuDivider} />

            <Pressable
              style={({ pressed }) => [
                styles.settingsMenuItem,
                pressed && styles.settingsMenuItemPressed,
              ]}
              onPress={() => {
                setSettingsMenuVisible(false);
                setPrivacyModalVisible(true);
              }}
            >
              <Text style={styles.settingsMenuItemText}>{t("privacy")}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        transparent={true}
        visible={languageModalVisible}
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("selectLanguage")}</Text>

            <View style={styles.languageOptionsContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.languageOption,
                  pressed && styles.languageOptionPressed,
                  language === "en" && styles.languageOptionActive,
                ]}
                onPress={() => handleSelectLanguage("en")}
              >
                <Text style={[
                  styles.languageOptionText,
                  language === "en" && styles.languageOptionTextActive,
                ]}>
                  {t("english")}
                </Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.languageOption,
                  pressed && styles.languageOptionPressed,
                  language === "es" && styles.languageOptionActive,
                ]}
                onPress={() => handleSelectLanguage("es")}
              >
                <Text style={[
                  styles.languageOptionText,
                  language === "es" && styles.languageOptionTextActive,
                ]}>
                  {t("spanish")}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.modalCancelButton,
                pressed && styles.modalCancelButtonPressed,
              ]}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>{t("close")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={backgroundSelectorVisible}
        animationType="fade"
        onRequestClose={() => setBackgroundSelectorVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.backgroundModalContent}>
            <View style={styles.backgroundModalHeader}>
              <Text style={styles.modalTitle}>{t("selectBackground")}</Text>
              <Pressable
                onPress={() => setBackgroundSelectorVisible(false)}
                style={styles.backgroundCloseButton}
              >
                <X size={24} color="#FFFFFF" />
              </Pressable>
            </View>

            <ScrollView style={styles.backgroundGrid}>
              {backgroundOptions.map((option) => (
                <Pressable
                  key={option.name}
                  style={({ pressed }) => [
                    styles.backgroundOption,
                    pressed && styles.backgroundOptionPressed,
                  ]}
                  onPress={() => handleSelectBackground(option.colors)}
                >
                  <LinearGradient
                    colors={option.colors as [string, string, ...string[]]}
                    locations={[0, 0.25, 0.5, 0.75, 1]}
                    style={styles.backgroundPreview}
                  />
                  <Text style={styles.backgroundOptionText}>{option.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={aboutModalVisible}
        animationType="fade"
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalContent}>
            <View style={styles.infoModalHeader}>
              <Text style={styles.modalTitle}>{t("aboutUs")}</Text>
              <Pressable
                onPress={() => setAboutModalVisible(false)}
                style={styles.backgroundCloseButton}
              >
                <X size={24} color="#FFFFFF" />
              </Pressable>
            </View>

            <ScrollView style={styles.infoScrollView}>
              <Text style={styles.infoText}>
                {t("aboutText")}
              </Text>

              <Text style={styles.infoSectionTitle}>{t("features")}</Text>
              <Text style={styles.infoText}>
                {t("featuresText")}
              </Text>

              <Text style={styles.infoSectionTitle}>{t("version")}</Text>
              <Text style={styles.infoText}>1.0.0</Text>

              <Text style={styles.infoSectionTitle}>{t("contact")}</Text>
              <Text style={styles.infoText}>
                {t("contactText")}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={privacyModalVisible}
        animationType="fade"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalContent}>
            <View style={styles.infoModalHeader}>
              <Text style={styles.modalTitle}>{t("privacyPolicy")}</Text>
              <Pressable
                onPress={() => setPrivacyModalVisible(false)}
                style={styles.backgroundCloseButton}
              >
                <X size={24} color="#FFFFFF" />
              </Pressable>
            </View>

            <ScrollView style={styles.infoScrollView}>
              <Text style={styles.infoSectionTitle}>{t("infoWeCollect")}</Text>
              <Text style={styles.infoText}>
                {t("infoWeCollectText")}
              </Text>

              <Text style={styles.infoSectionTitle}>{t("useOfInfo")}</Text>
              <Text style={styles.infoText}>
                {t("useOfInfoText")}
              </Text>

              <Text style={styles.infoSectionTitle}>{t("dataStorage")}</Text>
              <Text style={styles.infoText}>
                {t("dataStorageText")}
              </Text>

              <Text style={styles.infoSectionTitle}>{t("security")}</Text>
              <Text style={styles.infoText}>
                {t("securityText")}
              </Text>

              <Text style={styles.infoSectionTitle}>{t("dataControl")}</Text>
              <Text style={styles.infoText}>
                {t("dataControlText")}
              </Text>

              <Text style={styles.infoSectionTitle}>{t("policyChanges")}</Text>
              <Text style={styles.infoText}>
                {t("policyChangesText")}
              </Text>

              <Text style={styles.infoSectionTitle}>{t("privacyContact")}</Text>
              <Text style={styles.infoText}>
                {t("privacyContactText")}
              </Text>

              <Text style={styles.infoLastUpdate}>
                {t("lastUpdate")}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={premiumModalVisible}
        animationType="fade"
        onRequestClose={() => setPremiumModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.premiumModalContent}>
            <ScrollView 
              style={styles.premiumModalScroll}
              contentContainerStyle={styles.premiumModalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.premiumModalHeader}>
                <Crown size={48} color="#FFD700" />
                <Text style={styles.premiumModalTitle}>{t("premiumTitle")}</Text>
                <Text style={styles.premiumModalSubtitle}>{t("premiumSubtitle")}</Text>
              </View>

              <View style={styles.premiumFeaturesList}>
                <View style={styles.premiumFeature}>
                  <Text style={styles.premiumFeatureText}>{t("premiumFeature1")}</Text>
                </View>
                <View style={styles.premiumFeature}>
                  <Text style={styles.premiumFeatureText}>{t("premiumFeature2")}</Text>
                </View>
                <View style={styles.premiumFeature}>
                  <Text style={styles.premiumFeatureText}>{t("premiumFeature3")}</Text>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.premiumPurchaseButton,
                  pressed && styles.premiumPurchaseButtonPressed,
                ]}
                onPress={async () => {
                  const yearlyPackage = getYearlyPackage();
                  if (yearlyPackage) {
                    const success = await purchasePackage(yearlyPackage);
                    if (success) {
                      setPurchaseResultTitle(t("purchaseSuccess"));
                      setPurchaseResultMessage(t("purchaseSuccessMessage"));
                      setPremiumModalVisible(false);
                      setPurchaseResultVisible(true);
                    }
                  }
                }}
                disabled={isPurchasing || !offerings}
              >
                <Text style={styles.premiumPurchaseButtonText}>{t("purchase")}</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.premiumRestoreButton,
                  pressed && styles.premiumRestoreButtonPressed,
                ]}
                onPress={async () => {
                  const success = await restorePurchases();
                  if (success) {
                    setPurchaseResultTitle(t("restoreSuccess"));
                    setPurchaseResultMessage(t("purchaseSuccessMessage"));
                    setPremiumModalVisible(false);
                    setPurchaseResultVisible(true);
                  } else {
                    setPurchaseResultTitle(t("restoreFailed"));
                    setPurchaseResultMessage("");
                    setPurchaseResultVisible(true);
                  }
                }}
                disabled={isRestoring}
              >
                <Text style={styles.premiumRestoreButtonText}>{t("restorePurchase")}</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.modalCancelButton,
                  pressed && styles.modalCancelButtonPressed,
                ]}
                onPress={() => setPremiumModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>{t("close")}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={purchaseResultVisible}
        animationType="fade"
        onRequestClose={() => setPurchaseResultVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{purchaseResultTitle}</Text>
            {purchaseResultMessage ? (
              <Text style={styles.modalSubtitle}>{purchaseResultMessage}</Text>
            ) : null}
            <Pressable
              style={({ pressed }) => [
                styles.okButton,
                pressed && styles.okButtonPressed,
              ]}
              onPress={() => setPurchaseResultVisible(false)}
            >
              <Text style={styles.okButtonText}>{t("ok")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    alignItems: "flex-start",
    marginBottom: 40,
  },
  settingsButton: {
    padding: 8,
  },
  topRightButtons: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  playerCountButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 2,
    borderColor: "#8B0000",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  playerCountText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  limitBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 2,
    borderColor: "#8B0000",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  limitText: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  limitArrow: {
    fontSize: 24,
    fontWeight: "300" as const,
    color: "#FFFFFF",
  },
  playersGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  playersGridThree: {
    flexWrap: "wrap",
    gap: 10,
  },
  playersGridFour: {
    flexWrap: "wrap",
    gap: 8,
  },
  playerColumn: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
  },
  teamButtonWrapper: {
    width: "100%",
    marginBottom: 12,
  },
  teamButton: {
    height: 80,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  teamButtonGradient: {
    flex: 1,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  teamLabel: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    textTransform: "lowercase",
  },
  teamLabelSmall: {
    fontSize: 18,
  },
  plusSign: {
    fontSize: 28,
    fontWeight: "300" as const,
    color: "#FFFFFF",
  },
  plusSignSmall: {
    fontSize: 24,
  },
  scoresScrollContainer: {
    flex: 1,
  },
  scoresContainer: {
    paddingBottom: 20,
  },
  scoreBox: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  scoreValueSmall: {
    fontSize: 48,
  },
  scoreLimit: {
    fontSize: 28,
    fontWeight: "300" as const,
    color: "#FFFFFF",
    opacity: 0.7,
    marginLeft: 8,
  },
  scoreLimitSmall: {
    fontSize: 20,
  },
  historyScrollView: {
    width: "100%",
    maxHeight: 200,
  },
  historyColumn: {
    gap: 6,
    alignItems: "center",
    paddingVertical: 4,
  },
  historyItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  historyDeleteButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(220, 20, 60, 0.2)",
    borderWidth: 1,
    borderColor: "#DC143C",
    justifyContent: "center",
    alignItems: "center",
  },
  historyItem: {
    backgroundColor: "rgba(139, 0, 0, 0.4)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  historyText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  leftControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  historyButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#8B0000",
  },
  restartTextButton: {
    height: 60,
    paddingHorizontal: 24,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#8B0000",
  },
  restartText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  premiumButton: {
    flexDirection: "row",
    height: 60,
    paddingHorizontal: 24,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  premiumText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#000000",
  },
  premiumModalContent: {
    width: "90%",
    maxWidth: 400,
    maxHeight: "85%",
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#FFD700",
    overflow: "hidden",
  },
  premiumModalScroll: {
    flex: 1,
  },
  premiumModalScrollContent: {
    padding: 32,
  },
  premiumModalHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  premiumModalTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFD700",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  premiumModalSubtitle: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: "#999",
    textAlign: "center",
  },
  premiumFeaturesList: {
    gap: 16,
    marginBottom: 32,
  },
  premiumFeature: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 215, 0, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.2)",
  },
  premiumFeatureText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  premiumPurchaseButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#FFD700",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  premiumPurchaseButtonPressed: {
    backgroundColor: "#E6C200",
  },
  premiumPurchaseButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#000000",
  },
  premiumRestoreButton: {
    width: "100%",
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#666",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  premiumRestoreButtonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  premiumRestoreButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#8B0000",
    padding: 24,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    textAlign: "center",
  },
  editNameButton: {
    padding: 4,
  },
  nameEditContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  nameInput: {
    flex: 1,
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#DC143C",
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  saveNameButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#DC143C",
    justifyContent: "center",
    alignItems: "center",
  },
  saveNameText: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
  },
  modalInput: {
    height: 80,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#DC143C",
    paddingHorizontal: 24,
    fontSize: 48,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#DC143C",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelButtonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  modalCancelText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#DC143C",
  },
  modalConfirmButton: {
    flex: 1,
    height: 56,
    backgroundColor: "#DC143C",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalConfirmButtonPressed: {
    backgroundColor: "#B22222",
  },
  modalConfirmText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  winModalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#1a1a1a",
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "#FFD700",
    padding: 32,
    alignItems: "center",
  },
  winTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 16,
  },
  winTeamText: {
    fontSize: 48,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  winScoreText: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: "#999",
    textAlign: "center",
    marginBottom: 32,
  },
  winButtons: {
    width: "100%",
    gap: 12,
  },
  winContinueButton: {
    width: "100%",
    height: 60,
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
  },
  winContinueButtonPressed: {
    backgroundColor: "rgba(255, 215, 0, 0.3)",
  },
  winContinueText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFD700",
  },
  winRestartButton: {
    width: "100%",
    height: 60,
    backgroundColor: "#DC143C",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  winRestartButtonPressed: {
    backgroundColor: "#B22222",
  },
  winRestartText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  historyModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "flex-end",
  },
  historyModalContent: {
    height: "80%",
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 2,
    borderColor: "#8B0000",
    paddingTop: 20,
  },
  historyModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  historyModalTitle: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  historyCloseButton: {
    padding: 4,
  },
  emptyHistoryContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyHistoryText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
  },
  historyList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  historyGameCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#333",
    padding: 16,
    marginBottom: 16,
  },
  historyGameCardPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "#8B0000",
  },
  historyGameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyGameDate: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500" as const,
  },
  winnerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  winnerText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFD700",
    textTransform: "uppercase",
  },
  historyGameScores: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 12,
  },
  historyTeamScore: {
    alignItems: "center",
    flex: 1,
  },
  historyPlayerScore: {
    alignItems: "center",
    flex: 1,
  },
  historyTeamName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginBottom: 8,
    textTransform: "lowercase",
  },
  historyScore: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: "#666",
  },
  historyScoreWinner: {
    color: "#DC143C",
  },
  historyVs: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#666",
    marginHorizontal: 16,
  },
  historyGameLimit: {
    fontSize: 14,
    color: "#999",
  },
  historyGameFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  clearHistoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: "rgba(220, 20, 60, 0.1)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#DC143C",
  },
  clearHistoryButtonPressed: {
    backgroundColor: "rgba(220, 20, 60, 0.2)",
  },
  clearHistoryText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#DC143C",
  },
  playerCountOptionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    justifyContent: "center",
  },
  playerCountOption: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#333",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  playerCountOptionPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  playerCountOptionActive: {
    backgroundColor: "rgba(139, 0, 0, 0.3)",
    borderColor: "#DC143C",
    borderWidth: 3,
  },
  playerCountOptionText: {
    fontSize: 48,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  playerCountOptionTextActive: {
    color: "#DC143C",
  },
  playerCountOptionLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#999",
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  presetButton: {
    width: "30%",
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  presetButtonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  presetButtonActive: {
    backgroundColor: "rgba(139, 0, 0, 0.3)",
    borderColor: "#DC143C",
  },
  presetButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  presetButtonTextActive: {
    color: "#DC143C",
  },
  settingsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  settingsMenu: {
    position: "absolute",
    left: 20,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#8B0000",
    paddingVertical: 8,
    minWidth: 200,
  },
  settingsMenuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingsMenuItemPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  settingsMenuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  settingsMenuItemText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  settingsMenuDivider: {
    height: 1,
    backgroundColor: "#333",
    marginHorizontal: 12,
  },
  languageOptionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  languageOption: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#333",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  languageOptionPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  languageOptionActive: {
    backgroundColor: "rgba(139, 0, 0, 0.3)",
    borderColor: "#DC143C",
    borderWidth: 3,
  },
  languageOptionText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  languageOptionTextActive: {
    color: "#DC143C",
  },
  backgroundModalContent: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#8B0000",
    overflow: "hidden",
  },
  backgroundModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backgroundCloseButton: {
    padding: 4,
  },
  backgroundGrid: {
    padding: 20,
  },
  backgroundOption: {
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#333",
    marginBottom: 12,
    position: "relative",
  },
  backgroundOptionPressed: {
    opacity: 0.8,
  },
  backgroundPreview: {
    flex: 1,
  },
  backgroundOptionText: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  infoModalContent: {
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#8B0000",
    overflow: "hidden",
  },
  infoModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  infoScrollView: {
    padding: 20,
  },
  infoSectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#DC143C",
    marginTop: 20,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: "#CCCCCC",
    lineHeight: 24,
    marginBottom: 12,
  },
  infoLastUpdate: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#666",
    fontStyle: "italic",
    marginTop: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  okButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#DC143C",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  okButtonPressed: {
    backgroundColor: "#B22222",
  },
  okButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  bannerAdContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
});
