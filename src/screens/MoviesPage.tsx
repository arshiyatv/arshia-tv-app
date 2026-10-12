import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme } from '../theme/AppTheme';
import PressableScale from '../components/PressableScale';
import ArshiaWatermark from '../components/ArshiaWatermark';
import { GENRES, LANGUAGES, MOVIES, Movie, YEARS } from '../data/movies';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = 14;
const CARD_WIDTH = (SCREEN_WIDTH - AppTheme.spacing.lg * 2 - GRID_GAP) / 2;

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, active, onPress }) => (
  <PressableScale
    onPress={onPress}
    style={[styles.chip, active ? styles.chipActive : null]}
    activeScale={0.94}
    accessibilityLabel={label}
  >
    <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{label}</Text>
  </PressableScale>
);

interface FilterRowProps {
  icon: string;
  label: string;
  options: string[];
  value: string;
  onChange: (next: string) => void;
}

const FilterRow: React.FC<FilterRowProps> = ({ icon, label, options, value, onChange }) => (
  <View style={styles.filterRow}>
    <View style={styles.filterLabel}>
      <Ionicons name={icon as any} size={13} color={AppTheme.colors.textMuted} />
      <Text style={styles.filterLabelText}>{label}</Text>
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipScroll}
      contentContainerStyle={styles.chipScrollContent}
    >
      {options.map((option) => (
        <FilterChip
          key={option}
          label={option}
          active={value === option}
          onPress={() => onChange(option)}
        />
      ))}
    </ScrollView>
  </View>
);

interface MovieGridCardProps {
  movie: Movie;
  index: number;
  onPress: () => void;
}

const MovieGridCard: React.FC<MovieGridCardProps> = ({ movie, index, onPress }) => {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 420,
      delay: Math.min(index * 50, 350),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  return (
    <Animated.View
      style={[
        styles.gridItem,
        {
          opacity: enter,
          transform: [
            {
              translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }),
            },
            {
              scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }),
            },
          ],
        },
      ]}
    >
      <PressableScale onPress={onPress} style={styles.card} accessibilityLabel={movie.title}>
        <View style={[styles.cardPoster, { backgroundColor: movie.color }]}>
          <View style={styles.cardSheen} />
          <Ionicons name={movie.icon as any} size={30} color="rgba(255,255,255,0.88)" />
          <View style={styles.cardRating}>
            <Ionicons name="star" size={10} color={AppTheme.colors.accent} />
            <Text style={styles.cardRatingText}>{movie.rating.toFixed(1)}</Text>
          </View>
          <View style={styles.cardDuration}>
            <Text style={styles.cardDurationText}>{movie.duration} min</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {movie.title}
          </Text>
          <View style={styles.cardTags}>
            <View style={[styles.cardTag, { borderColor: movie.color + '66' }]}>
              <Text style={[styles.cardTagText, { color: movie.color }]}>{movie.genre}</Text>
            </View>
            <Text style={styles.cardYear}>{movie.year}</Text>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
};

const MoviesPage: React.FC<any> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [filterOpen, setFilterOpen] = useState(true);
  const [genre, setGenre] = useState('All');
  const [year, setYear] = useState('All');
  const [language, setLanguage] = useState('All');
  const [selected, setSelected] = useState<Movie | null>(null);
  const enter = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(520)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 640,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  const genreOptions = useMemo(() => ['All'].concat(GENRES), []);
  const yearOptions = useMemo(() => ['All'].concat(YEARS.map((item) => String(item))), []);
  const languageOptions = useMemo(() => ['All'].concat(LANGUAGES), []);

  const filtered = useMemo(
    () =>
      MOVIES.filter((movie) => {
        if (genre !== 'All' && movie.genre !== genre) return false;
        if (year !== 'All' && String(movie.year) !== year) return false;
        if (language !== 'All' && movie.language !== language) return false;
        return true;
      }),
    [genre, year, language]
  );

  const activeFilters = [genre, year, language].filter((value) => value !== 'All').length;

  const openDetail = (movie: Movie) => {
    setSelected(movie);
    sheetY.setValue(520);
    backdrop.setValue(0);
    Animated.parallel([
      Animated.spring(sheetY, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 5 }),
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDetail = () => {
    Animated.parallel([
      Animated.timing(sheetY, {
        toValue: 520,
        duration: 220,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => setSelected(null));
  };

  const clearFilters = () => {
    setGenre('All');
    setYear('All');
    setLanguage('All');
  };

  const playMovie = (movie: Movie) => {
    closeDetail();
    navigation.navigate('Player', {
      title: movie.title,
      subtitle: `${movie.genre} · ${movie.year} · ${movie.duration} min`,
      url: movie.streamUrl,
      accent: movie.color,
      isLive: false,
      hint: 'This title belongs to the demo catalogue, so no source is attached to it yet. Add an M3U8 address to the film in the catalogue and it plays here.',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Movies</Text>
          <Text style={styles.subtitle}>
            {filtered.length} titles
            {activeFilters > 0 ? ` · ${activeFilters} filter${activeFilters > 1 ? 's' : ''}` : ''}
          </Text>
        </View>
        <PressableScale
          onPress={() => setFilterOpen((prev) => !prev)}
          style={[styles.headerButton, activeFilters > 0 ? styles.headerButtonActive : null]}
          accessibilityLabel={filterOpen ? 'Collapse filters' : 'Expand filters'}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={activeFilters > 0 ? AppTheme.colors.white : AppTheme.colors.text}
          />
          <Ionicons
            name={filterOpen ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={activeFilters > 0 ? AppTheme.colors.white : AppTheme.colors.textMuted}
            style={styles.headerChevron}
          />
        </PressableScale>
      </View>

      {filterOpen ? (
        <Animated.View
          style={[
            styles.filterPanel,
            {
              opacity: enter,
              transform: [
                { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) },
              ],
            },
          ]}
        >
          <FilterRow
            icon="pricetag-outline"
            label="Genre"
            options={genreOptions}
            value={genre}
            onChange={setGenre}
          />
          <FilterRow
            icon="calendar-outline"
            label="Year"
            options={yearOptions}
            value={year}
            onChange={setYear}
          />
          <FilterRow
            icon="globe-outline"
            label="Language"
            options={languageOptions}
            value={language}
            onChange={setLanguage}
          />
        </Animated.View>
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.stateBox}>
            <Ionicons name="film-outline" size={46} color={AppTheme.colors.textMuted} />
            <Text style={styles.stateTitle}>Nothing matches those filters</Text>
            <Text style={styles.stateText}>
              Try a different genre, year or language.
            </Text>
            <PressableScale onPress={clearFilters} style={styles.clearButton}>
              <Ionicons name="refresh" size={15} color={AppTheme.colors.white} />
              <Text style={styles.clearButtonText}>Clear filters</Text>
            </PressableScale>
          </View>
        }
        renderItem={({ item, index }) => (
          <MovieGridCard movie={item} index={index} onPress={() => openDetail(item)} />
        )}
      />

      {selected ? (
        <View style={StyleSheet.absoluteFill}>
          <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
            <TouchableWithoutFeedback onPress={closeDetail}>
              <View style={StyleSheet.absoluteFill} />
            </TouchableWithoutFeedback>
          </Animated.View>

          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: insets.bottom + AppTheme.spacing.lg, transform: [{ translateY: sheetY }] },
            ]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={[styles.sheetPoster, { backgroundColor: selected.color }]}>
                <Ionicons name={selected.icon as any} size={26} color="rgba(255,255,255,0.9)" />
              </View>
              <View style={styles.sheetHeadText}>
                <Text style={styles.sheetTitle} numberOfLines={2}>
                  {selected.title}
                </Text>
                <Text style={styles.sheetMeta}>
                  {selected.year} · {selected.duration} min · {selected.language}
                </Text>
              </View>
              <ArshiaWatermark size={10} />
            </View>

            <View style={styles.sheetChips}>
              <View style={[styles.chip, styles.chipActive]}>
                <Text style={styles.chipTextActive}>{selected.genre}</Text>
              </View>
              <View style={styles.chip}>
                <Ionicons name="star" size={11} color={AppTheme.colors.accent} />
                <Text style={styles.chipRatingText}>{selected.rating.toFixed(1)}</Text>
              </View>
            </View>

            <Text style={styles.sheetSynopsis}>{selected.synopsis}</Text>

            <PressableScale
              onPress={() => playMovie(selected)}
              style={styles.playButton}
              accessibilityLabel={`Play ${selected.title}`}
            >
              <Ionicons name="play" size={18} color={AppTheme.colors.white} />
              <Text style={styles.playButtonText}>Play on Arshia TV</Text>
            </PressableScale>

            <PressableScale onPress={closeDetail} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </PressableScale>
          </Animated.View>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: AppTheme.spacing.lg,
    paddingTop: AppTheme.spacing.sm,
    paddingBottom: AppTheme.spacing.md,
  },
  title: {
    color: AppTheme.colors.text,
    fontSize: AppTheme.typography.fontSize.heading,
    fontWeight: AppTheme.typography.fontWeight.extrabold,
  },
  subtitle: {
    color: AppTheme.colors.textMuted,
    fontSize: AppTheme.typography.fontSize.sm,
    marginTop: 2,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: AppTheme.spacing.md,
    borderRadius: AppTheme.borderRadius.full,
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  headerButtonActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  headerChevron: {
    marginLeft: 6,
  },
  filterPanel: {
    marginHorizontal: AppTheme.spacing.lg,
    marginBottom: AppTheme.spacing.md,
    paddingVertical: AppTheme.spacing.sm,
    borderRadius: AppTheme.borderRadius.lg,
    backgroundColor: AppTheme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  filterRow: {
    marginBottom: AppTheme.spacing.sm,
  },
  filterLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: AppTheme.spacing.md,
    marginBottom: 6,
  },
  filterLabelText: {
    color: AppTheme.colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontWeight: AppTheme.typography.fontWeight.semibold,
    marginLeft: 6,
  },
  chipScroll: {
    flexGrow: 0,
  },
  chipScrollContent: {
    paddingHorizontal: AppTheme.spacing.md,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
    paddingHorizontal: 13,
    marginRight: AppTheme.spacing.sm,
    borderRadius: AppTheme.borderRadius.full,
    backgroundColor: AppTheme.colors.surface,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
  },
  chipActive: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  chipText: {
    color: AppTheme.colors.textSecondary,
    fontSize: AppTheme.typography.fontSize.sm,
    fontWeight: AppTheme.typography.fontWeight.medium,
  },
  chipTextActive: {
    color: AppTheme.colors.white,
    fontSize: AppTheme.typography.fontSize.sm,
    fontWeight: AppTheme.typography.fontWeight.semibold,
  },
  chipRatingText: {
    color: AppTheme.colors.text,
    fontSize: AppTheme.typography.fontSize.sm,
    fontWeight: AppTheme.typography.fontWeight.semibold,
    marginLeft: 4,
  },
  gridContent: {
    paddingHorizontal: AppTheme.spacing.lg,
    paddingBottom: AppTheme.spacing.xxl,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: GRID_GAP,
  },
  gridItem: {
    width: CARD_WIDTH,
  },
  card: {
    borderRadius: AppTheme.borderRadius.lg,
    backgroundColor: AppTheme.colors.card,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    overflow: 'hidden',
  },
  cardPoster: {
    height: CARD_WIDTH * 1.15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSheen: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.13)',
    top: -70,
    right: -60,
  },
  cardRating: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: AppTheme.borderRadius.sm,
    backgroundColor: 'rgba(6,9,16,0.6)',
  },
  cardRatingText: {
    color: AppTheme.colors.white,
    fontSize: 10,
    fontWeight: AppTheme.typography.fontWeight.bold,
    marginLeft: 3,
  },
  cardDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: AppTheme.borderRadius.sm,
    backgroundColor: 'rgba(6,9,16,0.6)',
  },
  cardDurationText: {
    color: AppTheme.colors.white,
    fontSize: 10,
    fontWeight: AppTheme.typography.fontWeight.medium,
  },
  cardBody: {
    padding: AppTheme.spacing.sm,
  },
  cardTitle: {
    color: AppTheme.colors.text,
    fontSize: AppTheme.typography.fontSize.md,
    fontWeight: AppTheme.typography.fontWeight.semibold,
  },
  cardTags: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  cardTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: AppTheme.borderRadius.xs,
    borderWidth: 1,
  },
  cardTagText: {
    fontSize: 10,
    fontWeight: AppTheme.typography.fontWeight.semibold,
  },
  cardYear: {
    color: AppTheme.colors.textMuted,
    fontSize: 10,
  },
  stateBox: {
    alignItems: 'center',
    paddingTop: AppTheme.spacing.xxl,
    paddingHorizontal: AppTheme.spacing.xl,
  },
  stateTitle: {
    color: AppTheme.colors.text,
    fontSize: AppTheme.typography.fontSize.lg,
    fontWeight: AppTheme.typography.fontWeight.bold,
    marginTop: AppTheme.spacing.md,
  },
  stateText: {
    color: AppTheme.colors.textMuted,
    fontSize: AppTheme.typography.fontSize.sm,
    marginTop: 6,
    textAlign: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: AppTheme.spacing.lg,
    paddingHorizontal: AppTheme.spacing.lg,
    height: 38,
    borderRadius: AppTheme.borderRadius.full,
    backgroundColor: AppTheme.colors.primary,
  },
  clearButtonText: {
    color: AppTheme.colors.white,
    fontSize: AppTheme.typography.fontSize.sm,
    fontWeight: AppTheme.typography.fontWeight.semibold,
    marginLeft: 6,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: AppTheme.colors.overlay,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: AppTheme.spacing.lg,
    paddingTop: AppTheme.spacing.sm,
    backgroundColor: AppTheme.colors.surface,
    borderTopLeftRadius: AppTheme.borderRadius.xxl,
    borderTopRightRadius: AppTheme.borderRadius.xxl,
    borderTopWidth: 1,
    borderColor: AppTheme.colors.border,
    ...AppTheme.elevation.xl,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: AppTheme.colors.disabled,
    marginBottom: AppTheme.spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetPoster: {
    width: 54,
    height: 54,
    borderRadius: AppTheme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: AppTheme.spacing.md,
  },
  sheetHeadText: {
    flex: 1,
    marginRight: AppTheme.spacing.sm,
  },
  sheetTitle: {
    color: AppTheme.colors.text,
    fontSize: AppTheme.typography.fontSize.xl,
    fontWeight: AppTheme.typography.fontWeight.extrabold,
  },
  sheetMeta: {
    color: AppTheme.colors.textMuted,
    fontSize: AppTheme.typography.fontSize.sm,
    marginTop: 3,
  },
  sheetChips: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: AppTheme.spacing.md,
  },
  sheetSynopsis: {
    color: AppTheme.colors.textSecondary,
    fontSize: AppTheme.typography.fontSize.md,
    lineHeight: 21,
    marginTop: AppTheme.spacing.md,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    hei
