import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://192.168.110.80:8000';

const colors = {
  primary: '#1DA34C',
  primaryDark: '#146C34',
  ink: '#111827',
  subtext: '#6B7280',
  border: '#E5E7EB',
  chipBorder: '#BBF0D0',
  background: '#FFFFFF',
  bubbleUser: '#1DA34C',
};

type QuickReply = { icon: keyof typeof Ionicons.glyphMap; label: string };

type BotBody =
  | { kind: 'text'; text: string }
  | { kind: 'numbered'; intro: string; items: string[]; outro?: string }
  | { kind: 'bulleted'; intro: string; items: { emoji: string; text: string }[]; outro?: string };

type Message =
  | { id: string; sender: 'user'; time: string; text: string }
  | { id: string; sender: 'bot'; time: string; body: BotBody };

type ScreenMode = 'choose' | 'chat' | 'community';

type CommunityIssue = {
  id: string;
  title: string | null;
  description: string | null;
  category_id: string | null;
  status: string;
  severity: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  city: string | null;
  created_at: string | null;
};

type GeneratedQuest = {
  id: string;
  title: string;
  description: string;
  quest_type: string;
  points_reward: number;
  status: string;
};

type AcceptanceState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'accepted' };

type QuestCardState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; quest: GeneratedQuest; acceptance: AcceptanceState };

const introChips: QuickReply[] = [
  { icon: 'leaf-outline', label: 'Sustainability Tips' },
  { icon: 'ellipse-outline', label: 'How Tokens Work' },
  { icon: 'location-outline', label: 'Report Help' },
];

function BotAvatar({ size = 40 }: { size?: number }) {
  return (
    <View
      style={[
        styles.botAvatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <MaterialCommunityIcons name="robot-happy-outline" size={size * 0.6} color={colors.primary} />
    </View>
  );
}

function QuickReplyChip({ icon, label, onPress }: QuickReply & { onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.chip} onPress={onPress}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={styles.chipText}>{label}</Text>
    </TouchableOpacity>
  );
}

// Must match backend/data/sustainability_local_responses.json's "sdg_advice_menu"
// answer exactly — the UI uses it to know when to follow up with the topic list.
const SDG_ADVICE_MENU_PROMPT = 'Sure! 🌱 What would you like advice on?';

// Purely informational — the user types their own question next, and the
// answer comes from the normal /chat flow (local response system, then RAG).
const SDG_ADVICE_TOPICS: BotBody = {
  kind: 'numbered',
  intro: 'You can ask advice related to:',
  items: [
    'Saving water',
    'Reducing waste',
    'Energy saving tips',
    'Low carbon transport',
    'Greenery tips',
    'Helping community',
    'What is SDG 11',
  ],
};

function BigActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.bigButton} onPress={onPress}>
      <Text style={styles.bigButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function IssueCard({
  issue,
  questState,
  onGenerateQuest,
  onAcceptQuest,
}: {
  issue: CommunityIssue;
  questState: QuestCardState;
  onGenerateQuest: () => void;
  onAcceptQuest: () => void;
}) {
  const location = [issue.address, issue.city].filter(Boolean).join(', ') || 'Location not specified';

  return (
    <View style={styles.issueCard}>
      <Text style={styles.issueCardLabel}>Problem</Text>
      <Text style={styles.issueCardTitle}>{issue.title ?? 'Untitled issue'}</Text>

      <View style={styles.issueCardRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.issueCardLabel}>Severity</Text>
          <Text style={styles.issueCardValue}>{issue.severity ?? 'Unknown'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.issueCardLabel}>Location</Text>
          <Text style={styles.issueCardValue}>{location}</Text>
        </View>
      </View>

      {questState.status === 'success' ? (
        <View style={styles.generatedQuestBox}>
          <Text style={styles.generatedQuestLabel}>Generated Quest</Text>
          <Text style={styles.generatedQuestTitle}>{questState.quest.title}</Text>
          <Text style={styles.generatedQuestDescription}>{questState.quest.description}</Text>
          <View style={styles.generatedQuestMetaRow}>
            <Text style={styles.generatedQuestMeta}>🏷️ {questState.quest.quest_type}</Text>
            <Text style={styles.generatedQuestMeta}>⭐ {questState.quest.points_reward} pts</Text>
          </View>

          {questState.acceptance.kind === 'accepted' ? (
            <View style={styles.acceptedBox}>
              <Text style={styles.acceptedText}>✅ Quest Accepted</Text>
              <Text style={styles.acceptedStatusText}>Status: Joined</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.acceptQuestButton}
              onPress={onAcceptQuest}
              disabled={questState.acceptance.kind === 'loading'}
            >
              {questState.acceptance.kind === 'loading' ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.acceptQuestButtonText}>Accept Quest</Text>
              )}
            </TouchableOpacity>
          )}

          {questState.acceptance.kind === 'error' && (
            <Text style={styles.errorText}>{questState.acceptance.message}</Text>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.generateQuestButton}
          onPress={onGenerateQuest}
          disabled={questState.status === 'loading'}
        >
          {questState.status === 'loading' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.generateQuestButtonText}>Generate Quest</Text>
          )}
        </TouchableOpacity>
      )}

      {questState.status === 'error' && <Text style={styles.errorText}>{questState.message}</Text>}
    </View>
  );
}

function UserBubble({ time, text }: { time: string; text: string }) {
  return (
    <View style={styles.userRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.timeLabelRight}>{time}</Text>
        <View style={styles.userBubbleRow}>
          <View style={styles.userBubble}>
            <Text style={styles.userBubbleText}>{text}</Text>
          </View>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={18} color="#fff" />
          </View>
        </View>
      </View>
    </View>
  );
}

function BotMessage({ time, body }: { time: string; body: BotBody }) {
  return (
    <View style={styles.botRow}>
      <BotAvatar size={36} />
      <View style={{ flex: 1 }}>
        <Text style={styles.botNameLabel}>EcoBot · {time}</Text>
        <View style={styles.botCard}>
          {body.kind === 'text' && <Text style={styles.botText}>{body.text}</Text>}

          {body.kind === 'numbered' && (
            <>
              <Text style={styles.botText}>{body.intro}</Text>
              {body.items.map((item, index) => (
                <View style={styles.listRow} key={index}>
                  <View style={styles.listIndex}>
                    <Text style={styles.listIndexText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.listItemText}>{item}</Text>
                </View>
              ))}
              {body.outro && <Text style={[styles.botText, styles.outro]}>{body.outro}</Text>}
            </>
          )}

          {body.kind === 'bulleted' && (
            <>
              <Text style={styles.botText}>{body.intro}</Text>
              {body.items.map((item, index) => (
                <View style={styles.listRow} key={index}>
                  <Text style={styles.bulletEmoji}>{item.emoji}</Text>
                  <Text style={styles.listItemText}>{item.text}</Text>
                </View>
              ))}
              {body.outro && <Text style={[styles.botText, styles.outro]}>{body.outro}</Text>}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

type TabKey = 'map' | 'quests' | 'report' | 'wallet' | 'profile';

const tabs: { key: TabKey; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { key: 'map', icon: 'map-outline', label: 'Map' },
  { key: 'quests', icon: 'star-outline', label: 'Quests' },
  { key: 'report', icon: 'add', label: 'Report' },
  { key: 'wallet', icon: 'wallet-outline', label: 'Wallet' },
  { key: 'profile', icon: 'person-outline', label: 'Profile' },
];

export default function SustainabilityAdvisorScreen({
  onBack,
}: {
  onBack?: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('report');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenMode, setScreenMode] = useState<ScreenMode>('choose');
  const [issues, setIssues] = useState<CommunityIssue[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issuesError, setIssuesError] = useState<string | null>(null);
  const [questStateByIssueId, setQuestStateByIssueId] = useState<Record<string, QuestCardState>>({});

  const canUseChatInput = screenMode === 'chat' && !isSending;

  const handleAskSdgAdvice = () => {
    setScreenMode('chat');
    sendMessage('I need SDG Advice');
  };

  const fetchIssues = async () => {
    setIssuesError(null);
    setIssuesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/community/issues`);
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }
      const data: CommunityIssue[] = await response.json();
      setIssues(data);
    } catch (err) {
      setIssuesError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIssuesLoading(false);
    }
  };

  const handleOpenCommunityQuests = () => {
    setScreenMode('community');
    fetchIssues();
  };

  const generateQuest = async (issueId: string) => {
    setQuestStateByIssueId((prev) => ({ ...prev, [issueId]: { status: 'loading' } }));
    try {
      const response = await fetch(`${API_BASE_URL}/community/issues/${issueId}/generate-quest`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }
      const quest: GeneratedQuest = await response.json();
      setQuestStateByIssueId((prev) => ({
        ...prev,
        [issueId]: { status: 'success', quest, acceptance: { kind: 'idle' } },
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setQuestStateByIssueId((prev) => ({ ...prev, [issueId]: { status: 'error', message } }));
    }
  };

  const acceptQuest = async (issueId: string, questId: string) => {
    setQuestStateByIssueId((prev) => {
      const current = prev[issueId];
      if (current?.status !== 'success') return prev;
      return { ...prev, [issueId]: { ...current, acceptance: { kind: 'loading' } } };
    });

    try {
      const response = await fetch(`${API_BASE_URL}/quests/${questId}/accept`, { method: 'POST' });
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }
      setQuestStateByIssueId((prev) => {
        const current = prev[issueId];
        if (current?.status !== 'success') return prev;
        return { ...prev, [issueId]: { ...current, acceptance: { kind: 'accepted' } } };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setQuestStateByIssueId((prev) => {
        const current = prev[issueId];
        if (current?.status !== 'success') return prev;
        return { ...prev, [issueId]: { ...current, acceptance: { kind: 'error', message } } };
      });
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'user', time: `Today ${time}`, text: trimmed },
    ]);
    setDraft('');
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data: { answer: string } = await response.json();
      const botTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const reply: Message = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        time: botTime,
        body: { kind: 'text', text: data.answer },
      };

      if (data.answer === SDG_ADVICE_MENU_PROMPT) {
        const topics: Message = {
          id: `b-${Date.now()}-topics`,
          sender: 'bot',
          time: botTime,
          body: SDG_ADVICE_TOPICS,
        };
        setMessages((prev) => [...prev, reply, topics]);
      } else {
        setMessages((prev) => [...prev, reply]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          AI Chatbot – Sustainability Advisor
        </Text>
        <TouchableOpacity hitSlop={12}>
          <Ionicons name="time-outline" size={22} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {screenMode === 'chat' && (
          <>
            <View style={styles.introCard}>
              <BotAvatar size={56} />
              <View style={{ flex: 1 }}>
                <Text style={styles.introTitle}>
                  Hi, I'm <Text style={styles.introTitleAccent}>EcoBot!</Text> 🌱
                </Text>
                <Text style={styles.introBody}>
                  I'm your AI sustainability advisor. Ask me anything about eco-friendly living,
                  community impact, or how to earn more tokens!
                </Text>
              </View>
            </View>
            <View style={styles.chipRow}>
              {introChips.map((chip) => (
                <QuickReplyChip key={chip.label} {...chip} onPress={() => sendMessage(chip.label)} />
              ))}
            </View>

            {messages.map((message) =>
              message.sender === 'user' ? (
                <UserBubble key={message.id} time={message.time} text={message.text} />
              ) : (
                <BotMessage key={message.id} time={message.time} body={message.body} />
              )
            )}
          </>
        )}

        {screenMode === 'community' && (
          <View style={styles.communityContainer}>
            <Text style={styles.communityHeading}>🏘️ Community Quests</Text>
            <Text style={styles.communitySubheading}>
              Real issues reported nearby — turn one into a quest.
            </Text>

            {issuesLoading && (
              <View style={styles.communityStatusRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.communityStatusText}>Loading issues...</Text>
              </View>
            )}

            {issuesError && <Text style={styles.errorText}>{issuesError}</Text>}

            {!issuesLoading && !issuesError && issues.length === 0 && (
              <Text style={styles.communityStatusText}>No active issues right now.</Text>
            )}

            {issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                questState={questStateByIssueId[issue.id] ?? { status: 'idle' }}
                onGenerateQuest={() => generateQuest(issue.id)}
                onAcceptQuest={() => {
                  const state = questStateByIssueId[issue.id];
                  if (state?.status === 'success') {
                    acceptQuest(issue.id, state.quest.id);
                  }
                }}
              />
            ))}
          </View>
        )}

        {screenMode === 'choose' && (
          <View style={styles.chooseModeContainer}>
            <BotAvatar size={72} />
            <Text style={styles.chooseModeTitle}>
              Hi, I'm <Text style={styles.introTitleAccent}>EcoBot!</Text> 🌱
            </Text>
            <Text style={styles.chooseModeSubtitle}>Choose how you'd like to start:</Text>
            <View style={styles.bigButtonGroup}>
              <BigActionButton label="🌱 Ask SDG Advice" onPress={handleAskSdgAdvice} />
              <BigActionButton label="🏘️ Community Quests" onPress={handleOpenCommunityQuests} />
            </View>
          </View>
        )}
      </ScrollView>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={[styles.inputBar, screenMode !== 'chat' && styles.inputBarDisabled]}>
        <Ionicons name="leaf-outline" size={18} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={
            screenMode === 'chat' ? 'Type your message...' : 'Choose an option above to start chatting...'
          }
          placeholderTextColor={colors.subtext}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => sendMessage(draft)}
          returnKeyType="send"
          editable={canUseChatInput}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => sendMessage(draft)}
          disabled={!canUseChatInput}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) =>
          tab.key === 'report' ? (
            <TouchableOpacity
              key={tab.key}
              style={styles.reportTab}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons name="add" size={26} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon}
                size={22}
                color={activeTab === tab.key ? colors.primary : colors.subtext}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.key && { color: colors.primary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginHorizontal: 8,
  },
  body: { flex: 1 },
  bodyContent: { flexGrow: 1, padding: 16, paddingBottom: 8 },
  chooseModeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 40,
  },
  chooseModeTitle: { fontSize: 20, fontWeight: '700', color: colors.ink, marginTop: 8 },
  chooseModeSubtitle: { fontSize: 14, color: colors.subtext, marginBottom: 12 },
  bigButtonGroup: { width: '100%', gap: 12 },
  bigButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.chipBorder,
    backgroundColor: '#E9F9EF',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigButtonText: { fontSize: 16, fontWeight: '700', color: colors.ink },
  communityContainer: { flex: 1 },
  communityHeading: { fontSize: 18, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  communitySubheading: { fontSize: 13, color: colors.subtext, marginBottom: 16 },
  communityStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  communityStatusText: { fontSize: 13, color: colors.subtext },
  issueCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  issueCardLabel: { fontSize: 11, color: colors.subtext, fontWeight: '600', marginBottom: 2 },
  issueCardTitle: { fontSize: 15, fontWeight: '700', color: colors.ink, marginBottom: 10 },
  issueCardRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  issueCardValue: { fontSize: 13, color: colors.ink, textTransform: 'capitalize' },
  generateQuestButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateQuestButtonText: { color: '#fff', fontSize: 13.5, fontWeight: '700' },
  generatedQuestBox: {
    backgroundColor: '#E9F9EF',
    borderRadius: 12,
    padding: 12,
  },
  generatedQuestLabel: { fontSize: 11, color: colors.primaryDark, fontWeight: '700', marginBottom: 4 },
  generatedQuestTitle: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  generatedQuestDescription: { fontSize: 13, color: colors.ink, lineHeight: 18, marginBottom: 8 },
  generatedQuestMetaRow: { flexDirection: 'row', gap: 14, marginBottom: 10 },
  generatedQuestMeta: { fontSize: 12.5, color: colors.primaryDark, fontWeight: '600' },
  acceptQuestButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptQuestButtonText: { color: '#fff', fontSize: 13.5, fontWeight: '700' },
  acceptedBox: { alignItems: 'center', paddingVertical: 4 },
  acceptedText: { fontSize: 14, fontWeight: '700', color: colors.primaryDark },
  acceptedStatusText: { fontSize: 12, color: colors.primaryDark, marginTop: 2 },
  introCard: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  botAvatar: {
    backgroundColor: '#E9F9EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitle: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  introTitleAccent: { color: colors.primary },
  introBody: { fontSize: 13, color: colors.subtext, lineHeight: 19 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipText: { fontSize: 12.5, color: colors.ink, fontWeight: '500' },
  userRow: { marginBottom: 16 },
  timeLabelRight: { fontSize: 11, color: colors.subtext, textAlign: 'right', marginBottom: 4 },
  userBubbleRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 8 },
  userBubble: {
    backgroundColor: colors.bubbleUser,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: '78%',
  },
  userBubbleText: { color: '#fff', fontSize: 14 },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  botNameLabel: { fontSize: 11, color: colors.subtext, marginBottom: 4 },
  botCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 14,
  },
  botText: { fontSize: 13.5, color: colors.ink, lineHeight: 20 },
  outro: { marginTop: 8 },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10 },
  listIndex: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  listIndexText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  bulletEmoji: { fontSize: 14, marginTop: 1 },
  listItemText: { flex: 1, fontSize: 13.5, color: colors.ink, lineHeight: 19 },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  inputBarDisabled: { opacity: 0.5 },
  inputIcon: { marginLeft: 4 },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 12,
  },
  tabItem: { alignItems: 'center', gap: 2, minWidth: 56 },
  tabLabel: { fontSize: 11, color: colors.subtext },
  reportTab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
});
