import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { AppTheme } from '../theme/AppTheme';
import ArshiaWatermark from '../components/ArshiaWatermark';
import ChannelLogo from '../components/ChannelLogo';
import InsetPressable from '../components/InsetPressable';
import PressableScale from '../components/PressableScale';
import { Channel, GROUPS, GroupMeta, groupMeta } from '../data/channels';
import { MOVIES, Movie } from '../data/movies';
import { loadChannels } from '../utils/playlist';
import { useAdmin } from '../context/AdminContext';

/**
 * Live TV.
 *
 * The monitor at the top is fixed: it keeps playing the channel you picked while the
 * folder buttons below it scroll. Below the monitor sits the programme panel, which
 * Arshia TV fills from the playlist the channel arrived on, and the folder grid, where
 * every folder opens into its own recessed channel buttons.
 */

interface LiveMonitorProps {
  channel: Channel | null;
  player: any;
  isPlaying: boolean;
  muted: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onFullscreen: () => void;
}

const LiveMonitor: React.FC<LiveMonitorProps> = ({
  channel,
  player,
  isPlaying,
  muted,
  onTogglePlay,
  onToggleMute,
  onFullscreen,
}) => (
  <View style={styles.monitor}>
    {channel && channel.url ? (
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        contentFit="contain"
        nativeControls={false}
      />
    ) : null}

    {!channel ? (
      <View style={styles.monitorEmpty}>
        <Ionicons name="tv-outline" size={30} color={AppTheme.colors.textMuted} />
        <Text style={styles.monitorEmptyTitle}>Pick a channel to start the monitor</Text>
        <Text style={styles.monitorEmptyText}>
          The monitor stays here at the top while you browse the folders below.
        </Text>
      </View>
    ) : null}

    {channel && !channel.url ? (
      <View style={styles.monitorEmpty}>
        <Ionicons name="cloud-offline-outline" size={30} color={AppTheme.colors.warning} />
        <Text style={styles.monitorEmptyTitle}>{channel.name}</Text>
        <Text style={styles.monitorEmptyText}>
          This list entry carries no stream address. Pull down to fetch the playlist again.
        </Text>
      </View>
    ) : null}

    {channel && channel.url ? (
      <View style={styles.monitorControls} pointerEvents="box-none">
        <PressableScale
          onPress={onTogglePlay}
          style={styles.monitorButton}
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        >
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={19} color={AppTheme.colors.white} />
        </PressableScale>
        <PressableScale
          onPress={onToggleMute}
          style={styles.monitorButton}
          accessibilityLabel={muted ? 'Unmute' : 'Mute'}
        >
          <Ionicons
            name={muted ? 'volume-mute' : 'volume-high'}
            size={17}
            color={AppTheme.colors.white}
          />
        </PressableScale>
        <View style={styles.monitorSpacer} />
        <PressableScale
          onPress={onFullscreen}
          style={styles.monitorButton}
          accessibilityLabel="Fullscreen"
        >
          <Ionicons name="expand-outline" size={17} color={AppTheme.colors.white} />
        </PressableScale>
      </View>
    ) : null}

    <ArshiaWatermark style={styles.monitorMark} />
  </View>
);

interface ProgramPanelProps {
  channel: Channel;
  onOpenArchive: (movie: Movie) => void;
}

const ProgramPanel: React.FC<ProgramPanelProps> = ({ channel, onOpenArchive }) => {
  const meta = groupMeta(channel.group);
  const archive = MOVIES.slice(0, 8);

  return (
    <View style={styles.panel}>
      <View style={styles.panelHead}>
        <Ionicons name="information-circle-outline" size={16} color={meta.color} />
        <Text style={styles.panelTitle}>Programme details</Text>
      </View>

      <Text style={styles.panelName}>{channel.name}</Text>

      <View style={styles.panelChips}>
        <View
          style={[styles.panelChip, { borderColor: meta.color + '66', backgroundColor: meta.color + '1F' }]}
        >
          <Ionicons name={meta.icon as any} size={12} color={meta.color} />
          <Text style={[styles.panelChipText, { color: meta.color }]}>{meta.label}</Text>
        </View>
        <View style={styles.panelChip}>
          <Ionicons name="sparkles-outline" size={12} color={AppTheme.colors.textSecondary} />
          <Text style={styles.panelChipText}>{channel.quality || 'Auto quality'}</Text>
        </View>
        <View style={styles.panelChip}>
          <Ionicons name="shield-checkmark-outline" size={12} color={AppTheme.colors.textSecondary} />
          <Text style={styles.panelChipText}>Free to air</Text>
        </View>
      </View>

      <Text style={styles.panelText}>
        {`Arshia TV fills this panel automatically from the playlist ${channel.name} arrived on, and keeps the channel name on screen the whole time it plays. Channels that publish extra guide text show it here — when a source stays quiet, the name above is what you get.`}
      </Text>

      <Text style={styles.panelSub}>Archive · titles that go with this folder</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.archiveRow}>
        {archive.map((movie) => (
          <InsetPressable
            key={movie.id}
            onPress={() => onOpenArchive(movie)}
            style={styles.archiveCard}
            accessibilityLabel={movie.title}
          >
            <View style={[styles.archiveArt, { backgroundColor: movie.color }]}>
              <Ionicons name={movie.icon as any} size={22} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={styles.archiveTitle} numberOfLines={2}>
              {movie.title}
            </Text>
            <Text style={styles.archiveMeta} numberOfLines={1}>
              {movie.year} · {movie.genre}
            </Text>
          </InsetPressable>
        ))}
      </ScrollView>
    </View>
  );
};

interface FolderTileProps {
  meta: GroupMeta;
  count: number;
  isOpen: boolean;
  index: number;
  onToggle: () => void;
}

const FolderTile: React.FC<FolderTileProps> = ({ meta, count, isOpen, index, onToggle }) => {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 380,
      delay: Math.min(index * 45, 320),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  return (
    <Animated.View
      style={[
        styles.folderWrap,
        {
          opacity: enter,
          transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
        },
      ]}
    >
      <InsetPressable
        onPress={onToggle}
        accent={meta.color}
        style={[styles.folder, isOpen ? { backgroundColor: meta.color + '1F' } : null]}
        accessibilityLabel={`${meta.label} folder`}
      >
        <View style={styles.folderTop}>
          <View style={[styles.folderIcon, { backgroundColor: meta.color + '2E' }]}>
            <Ionicons name={meta.icon as any} size={18} color={meta.color} />
          </View>
          <Ionicons
            name={isOpen ? 'chevron-up-circle' : 'chevron-down-circle'}
            size={18}
            color={isOpen ? meta.color : AppTheme.colors.textMuted}
          />
        </View>
        <Text style={styles.folderLabel} numberOfLines={2}>
          {meta.label}
        </Text>
        <Text style={styles.folderCount}>
          {count} {count === 1 ? 'channel' : 'channels'}
        </Text>
      </InsetPressable>
    </Animated.View>
  );
};

interface ChannelButtonProps {
  channel: Channel;
  index: number;
  isActive: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

const ChannelButton: React.FC<ChannelButtonProps> = ({
  channel,
  index,
  isActive,
  onPress,
  onLongPress,
}) => {
  const enter = useRef(new Animated.Value(0)).current;
  const meta = groupMeta(channel.group);

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 340,
      delay: Math.min(index * 24, 240),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}
    >
      <InsetPressable
        onPress={onPress}
        onLongPress={onLongPress}
        accent={isActive ? meta.color : undefined}
        style={[styles.channel, isActive ? { backgroundColor: meta.color + '1C' } : null]}
        accessibilityLabel={channel.name}
      >
        <ChannelLogo channel={channel} size={42} />
        <View style={styles.channelBody}>
          <Text style={styles.channelName} numberOfLines={1}>
            {channel.name}
          </Text>
          <Text style={styles.channelMeta} numberOfLines={1}>
            {isActive ? 'On the monitor now' : channel.url ? 'Live now' : 'No stream attached'}
            {channel.quality ? ` · ${channel.quality}` : ''}
          </Text>
        </View>
        <View style={[styles.channelPlay, { borderColor: meta.color + '59' }]}>
          <Ionicons name={isActive ? 'volume-high' : 'play'} size={13} color={meta.color} />
        </View>
      </InsetPressable>
    </Animated.View>
  );
};

const LiveChannelsPage: React.FC<any> = ({ navigation, route }) => {
  const requestedGroup: string = route?.params?.group || '';
  const { isAdmin, hiddenGroups, removedChannelIds, removeChannel } = useAdmin();
  const isFocused = useIsFocused();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openFolder, setOpenFolder] = useState('');
  const [active, setActive] = useState<Channel | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [muted, setMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const player = useVideoPlayer(null, (instance) => {
    instance.loop = false;
  });

  const load = useCallback(async (force: boolean) => {
    const result = await loadChannels(force);
    setChannels(result.channels);
    setIsOffline(result.isOffline);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const visibleChannels = useMemo(
    () =>
      channels.filter(
        (channel) =>
          !removedChannelIds.includes(channel.id) && !hiddenGroups.includes(channel.group)
      ),
    [channels, removedChannelIds, hiddenGroups]
  );

  const sections = useMemo(() => {
    const grouped: Record<string, Channel[]> = {};
    visibleChannels.forEach((channel) => {
      if (!grouped[channel.group]) grouped[channel.group] = [];
      grouped[channel.group].push(channel);
    });
    return GROUPS.filter((meta) => grouped[meta.key] && grouped[meta.key].length > 0).map(
      (meta) => ({ meta, items: grouped[meta.key] })
    );
  }, [visibleChannels]);

  // Open one folder by default: the one asked for, else the first that has channels.
  useEffect(() => {
    if (openFolder || !sections.length) return;
    const preferred = sections.some((section) => section.meta.key === requestedGroup)
      ? requestedGroup
      : sections[0].meta.key;
    setOpenFolder(preferred);
  }, [sections, requestedGroup, openFolder]);

  // The monitor always has something on it.
  useEffect(() => {
    if (active) return;
    if (!visibleChannels.length) return;
    setActive(visibleChannels[0]);
  }, [active, visibleChannels]);

  // A channel the manager removed must not keep playing.
  useEffect(() => {
    if (active && removedChannelIds.includes(active.id)) setActive(null);
  }, [active, removedChannelIds]);

  useEffect(() => {
    if (!player) return;
    const playingSub = player.addListener('playingChange', (payload: any) => {
      setIsPlaying(!!payload?.isPlaying);
    });
    return () => playingSub.remove();
  }, [player]);

  // Load the stream when the channel changes, and quieten down whenever the tab or the
  // full screen player takes over so two streams never play at once.
  useEffect(() => {
    if (!player) return;
    const url = active?.url;
    if (!url || !isFocused) {
      try {
        player.pause();
      } catch (error) {
        // Nothing to pause yet.
      }
      return;
    }
    try {
      Promise.resolve(player.replace(url)).catch(() => {});
      player.play();
    } catch (error) {
      // The monitor shows its own notice when a stream will not start.
    }
  }, [player, active, isFocused]);

  const togglePlay = () => {
    if (!player || !active?.url) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const toggleMute = () => {
    if (!player) return;
    const next = !muted;
    player.muted = next;
    setMuted(next);
  };

  const selectChannel = (channel: Channel) => {
    setActive(channel);
    setMuted(false);
    setPanelOpen(true);
  };

  const goFullscreen = () => {
    if (!active?.url) return;
    const meta = groupMeta(active.group);
    navigation.navigate('Player', {
      title: active.name,
      subtitle: `${meta.label} · Live`,
      url: active.url,
      accent: meta.color,
      isLive: true,
      hint: 'The stream did not respond. Free-to-air channels go offline during the day, so try another one.',
    });
  };

  const openArchive = (movie: Movie) => {
    navigation.navigate('Player', {
      title: movie.title,
      subtitle: `${movie.genre} · ${movie.year} · ${movie.duration} min`,
      url: movie.streamUrl,
      accent: movie.color,
      isLive: false,
      hint: 'This title sits in the Arshia archive and has no source attached to it yet.',
    });
  };

  const confirmRemove = (channel: Channel) => {
    Alert.alert(
      'Remove this channel?',
      `${channel.name} will be taken out of the list until you restore it from the Admin panel.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeChannel(channel.id) },
      ]
    );
  };

  const activeMeta = active ? groupMeta(active.group) : null;
  const openSection = sections.find((section) => section.meta.key === openFolder) || null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Live TV</Text>
          <Text style={styles.subtitle}>
            {loading
              ? 'Loading channels…'
              : `${visibleChannels.length} free channels · ${sections.length} folders`}
          </Text>
        </View>
        {isAdmin ? (
          <View style={styles.adminPill}>
            <Ionicons name="shield-checkmark" size={12} color={AppTheme.colors.primary} />
            <Text style={styles.adminPillText}>Manager</Text>
          </View>
        ) : null}
        <PressableScale
          onPress={() => {
            setRefreshing(true);
            load(true);
          }}
          disabled={loading}
          style={styles.headerButton}
          accessibilityLabel="Reload the channel folders"
        >
          <Ionicons name="refresh" size={17} color={AppTheme.colors.text} />
        </PressableScale>
      </View>

      <LiveMonitor
        channel={active}
        player={player}
        isPlaying={isPlaying}
        muted={muted}
        onTogglePlay={togglePlay}
        onToggleMute={toggleMute}
        onFullscreen={goFullscreen}
      />

      <View style={styles.nowBar}>
        <View
          style={[
            styles.nowDot,
            { backgroundColor: active?.url && activeMeta ? activeMeta.color : AppTheme.colors.disabled },
          ]}
        />
        <View style={styles.nowBody}>
          <Text style={styles.nowTitle} numberOfLines={1}>
            {active ? active.name : 'Arshia TV live'}
          </Text>
          <Text style={styles.nowMeta} numberOfLines={1}>
            {active && activeMeta
              ? `${activeMeta.label} · ${active.url ? 'on air now' : 'no stream attached'}`
              : 'Choose a folder below'}
          </Text>
        </View>
        <InsetPressable
          onPress={() => setPanelOpen((prev) => !prev)}
          disabled={!active}
          style={styles.nowToggle}
          accessibilityLabel="Toggle programme details"
        >
          <Ionicons
            name={panelOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={AppTheme.colors.text}
          />
        </InsetPressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={AppTheme.colors.primary}
            colors={[AppTheme.colors.primary]}
            onRefresh={() => {
              setRefreshing(true);
              load(true);
            }}
          />
        }
      >
        {isOffline ? (
          <View style={styles.banner}>
            <Ionicons name="warning-outline" size={18} color={AppTheme.colors.warning} />
            <Text style={styles.bannerText}>
              The playlists could not be reached. This is the built-in list — pull down to try
              again.
            </Text>
          </View>
        ) : null}

        {loading && channels.length === 0 ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={AppTheme.colors.primary} size="large" />
            <Text style={styles.stateTitle}>Tuning in…</Text>
            <Text style={styles.stateText}>Fetching the latest channel folders.</Text>
          </View>
        ) : null}

        {!loading && sections.length === 0 ? (
          <View style={styles.stateBox}>
            <Ionicons name="tv-outline" size={46} color={AppTheme.colors.textMuted} />
            <Text style={styles.stateTitle}>No channels found</Text>
            <Text style={styles.stateText}>Pull down to refresh, or try again in a moment.</Text>
          </View>
        ) : null}

        {active && panelOpen ? (
          <ProgramPanel channel={active} onOpenArchive={openArchive} />
        ) : null}

        {active && panelOpen && isAdmin ? (
          <View style={styles.adminHint}>
            <Ionicons name="construct-outline" size={15} color={AppTheme.colors.primary} />
            <Text style={styles.adminHintText}>
              Manager mode: long-press any channel button below to remove it.
            </Text>
          </View>
        ) : null}

        {sections.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>Folders</Text>
            <View style={styles.folderGrid}>
              {sections.map((section, index) => (
                <FolderTile
                  key={section.meta.key}
                  meta={section.meta}
                  count={section.items.length}
                  index={index}
                  isOpen={openFolder === section.meta.key}
                  onToggle={() =>
                    setOpenFolder((prev) => (prev === section.meta.key ? '' : section.meta.key))
                  }
                />
              ))}
            </View>
          </>
  ) : null}
