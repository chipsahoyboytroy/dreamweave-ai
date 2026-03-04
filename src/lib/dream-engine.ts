// ═══════════════════════════════════════════════════════
// DreamWeave AI — Built-in Dream Interpretation Engine
// Zero API keys required — rule-based Jungian analysis
// Uses symbol dictionaries, keyword extraction, and templates
// ═══════════════════════════════════════════════════════

import { logger } from "./logger";

// ─── Dream Symbol Dictionary (Jungian + universal) ───

interface SymbolEntry {
  universal: string;
  personal: string;
  archetypes: string[];
  emotions: string[];
  themes: string[];
}

const DREAM_SYMBOLS: Record<string, SymbolEntry> = {
  water: {
    universal: "The unconscious mind, emotions flowing beneath the surface, the source of all life and transformation",
    personal: "Your emotional state may be seeking expression — are there feelings you've been holding back?",
    archetypes: ["The Water"],
    emotions: ["contemplative", "flowing"],
    themes: ["emotional depth", "unconscious exploration"],
  },
  ocean: {
    universal: "The vast collective unconscious, infinite possibility, the depths of the psyche",
    personal: "You may be standing at the edge of something immense — a decision, a feeling, a new chapter",
    archetypes: ["The Water", "The Self"],
    emotions: ["awe", "overwhelmed"],
    themes: ["infinity", "the unknown"],
  },
  river: {
    universal: "The flow of time, life's journey, transition and change",
    personal: "Consider where the current of your life is carrying you — are you swimming with or against it?",
    archetypes: ["The Water"],
    emotions: ["peaceful", "restless"],
    themes: ["journey", "change"],
  },
  rain: {
    universal: "Emotional release, cleansing, renewal from above",
    personal: "Perhaps your psyche is ready to let go of something heavy — tears can be transformative",
    archetypes: ["The Water", "The Mother"],
    emotions: ["melancholic", "renewed"],
    themes: ["release", "purification"],
  },
  forest: {
    universal: "The unconscious wilderness, the unknown parts of self, growth and mystery",
    personal: "You may be exploring uncharted territory within yourself — trust the path even when you can't see the clearing",
    archetypes: ["The Labyrinth", "The Shadow"],
    emotions: ["curious", "uncertain"],
    themes: ["self-discovery", "the unknown"],
  },
  tree: {
    universal: "Growth, rootedness, the connection between earth and sky, the axis of the world",
    personal: "Your roots and your aspirations — how grounded do you feel while reaching for something higher?",
    archetypes: ["The Self", "The Mother"],
    emotions: ["grounded", "aspiring"],
    themes: ["growth", "stability"],
  },
  house: {
    universal: "The self, the psyche's architecture — each room a different aspect of who you are",
    personal: "Which rooms did you visit? The attic holds forgotten memories, the basement holds what's been repressed",
    archetypes: ["The Self"],
    emotions: ["security", "curiosity"],
    themes: ["self-exploration", "identity"],
  },
  door: {
    universal: "Transition, opportunity, the threshold between known and unknown",
    personal: "An invitation to step through — what has been beckoning you that you haven't yet answered?",
    archetypes: ["The Hero", "The Labyrinth"],
    emotions: ["anticipation", "hesitation"],
    themes: ["transition", "opportunity"],
  },
  flying: {
    universal: "Freedom, transcendence, rising above limitations, seeing from a higher perspective",
    personal: "Your spirit is reaching for liberation — what constraints in waking life feel ready to dissolve?",
    archetypes: ["The Flight", "The Hero"],
    emotions: ["exhilaration", "freedom"],
    themes: ["transcendence", "liberation"],
  },
  falling: {
    universal: "Loss of control, letting go, surrender to the unknown, fear of failure",
    personal: "Are you holding on too tightly to something? Sometimes falling is the beginning of flying",
    archetypes: ["The Shadow", "The Child"],
    emotions: ["fear", "vulnerability"],
    themes: ["surrender", "trust"],
  },
  running: {
    universal: "Pursuit or avoidance, urgency, the fight-or-flight response of the psyche",
    personal: "What are you running toward — or away from? The dream invites you to face what moves you",
    archetypes: ["The Hero", "The Shadow"],
    emotions: ["anxiety", "determination"],
    themes: ["avoidance", "pursuit"],
  },
  chase: {
    universal: "Something unresolved pursuing you, aspects of self demanding attention",
    personal: "What you're running from often holds your greatest gift — can you turn and face it?",
    archetypes: ["The Shadow", "The Hero"],
    emotions: ["fear", "tension"],
    themes: ["confrontation", "the repressed"],
  },
  death: {
    universal: "Transformation, endings that birth beginnings, the ego's dissolution for renewal",
    personal: "Something in your life is completing its cycle — this is not loss but metamorphosis",
    archetypes: ["The Shadow", "The Self"],
    emotions: ["grief", "transformation"],
    themes: ["rebirth", "letting go"],
  },
  baby: {
    universal: "New beginnings, innocence, vulnerability, a new aspect of self being born",
    personal: "Something tender and new is emerging in your life — it needs your care and attention",
    archetypes: ["The Child", "The Mother"],
    emotions: ["tenderness", "hope"],
    themes: ["new beginnings", "nurturing"],
  },
  child: {
    universal: "The inner child, innocence, playfulness, unprocessed childhood experiences",
    personal: "Your inner child may be seeking attention — what part of your spontaneity wants to play?",
    archetypes: ["The Child"],
    emotions: ["nostalgia", "joy"],
    themes: ["innocence", "inner child"],
  },
  animal: {
    universal: "Instincts, the untamed self, natural wisdom that the rational mind overlooks",
    personal: "Your animal nature has wisdom — what instinct have you been ignoring?",
    archetypes: ["The Shadow", "The Trickster"],
    emotions: ["primal", "instinctive"],
    themes: ["instinct", "natural wisdom"],
  },
  snake: {
    universal: "Transformation, healing, shadow energy, kundalini — the most ancient symbol of renewal",
    personal: "Powerful change is moving through you — shedding old skin for what's ready to emerge",
    archetypes: ["The Shadow", "The Self"],
    emotions: ["fear", "transformation"],
    themes: ["healing", "rebirth"],
  },
  bird: {
    universal: "The soul, freedom, messages from the unconscious, spiritual aspiration",
    personal: "Your spirit is seeking higher ground — what perspective would serve you right now?",
    archetypes: ["The Flight", "The Wise Old One"],
    emotions: ["freedom", "longing"],
    themes: ["spirituality", "messages"],
  },
  cat: {
    universal: "Independence, feminine mystery, intuition, the ability to see in the dark",
    personal: "Trust your instincts more — your intuition knows things your mind hasn't caught up to",
    archetypes: ["The Anima", "The Trickster"],
    emotions: ["mysterious", "independent"],
    themes: ["intuition", "independence"],
  },
  dog: {
    universal: "Loyalty, friendship, the faithful companion, unconditional love",
    personal: "Consider the faithful relationships in your life — who stands by you, and whom do you stand by?",
    archetypes: ["The Hero", "The Mother"],
    emotions: ["loyalty", "companionship"],
    themes: ["friendship", "devotion"],
  },
  mirror: {
    universal: "Self-reflection, confronting who you really are, the ego's relationship with its reflection",
    personal: "What did you see? The mirror in dreams shows not your face but your soul's current state",
    archetypes: ["The Self", "The Shadow"],
    emotions: ["confrontation", "wonder"],
    themes: ["self-awareness", "identity"],
  },
  light: {
    universal: "Consciousness, insight, revelation, the illumination of what was hidden",
    personal: "Clarity is breaking through — trust the insights that are arriving",
    archetypes: ["The Self", "The Wise Old One"],
    emotions: ["clarity", "hope"],
    themes: ["illumination", "understanding"],
  },
  darkness: {
    universal: "The unknown, the unconscious, shadow territory waiting to be illuminated",
    personal: "Don't fear the dark — it's where seeds germinate before breaking into light",
    archetypes: ["The Shadow"],
    emotions: ["fear", "mystery"],
    themes: ["the unknown", "shadow work"],
  },
  moon: {
    universal: "The feminine, cycles, intuition, the light that guides through darkness",
    personal: "Your intuitive self has something to tell you — are you listening to the quieter voice?",
    archetypes: ["The Anima", "The Mother"],
    emotions: ["serenity", "mystical"],
    themes: ["intuition", "cycles"],
  },
  sun: {
    universal: "Consciousness, vitality, the masculine principle, clarity of purpose",
    personal: "Your conscious will and purpose are being highlighted — step into your power",
    archetypes: ["The Animus", "The Hero"],
    emotions: ["warmth", "confidence"],
    themes: ["purpose", "vitality"],
  },
  star: {
    universal: "Guidance, hope, destiny, the cosmic self, aspiration toward the highest",
    personal: "You're being guided toward something — trust the distant light even when the path is unclear",
    archetypes: ["The Self", "The Wise Old One"],
    emotions: ["wonder", "hope"],
    themes: ["guidance", "destiny"],
  },
  mountain: {
    universal: "Obstacles, achievement, spiritual ascent, the summit of self-realization",
    personal: "The climb represents your current challenge — the view from the top will be worth it",
    archetypes: ["The Hero", "The Self"],
    emotions: ["determination", "awe"],
    themes: ["challenge", "achievement"],
  },
  bridge: {
    universal: "Transition, connection between two states of being, crossing over",
    personal: "You're in between — the bridge exists because you're ready to cross to what's next",
    archetypes: ["The Hero", "The Labyrinth"],
    emotions: ["anticipation", "courage"],
    themes: ["transition", "connection"],
  },
  key: {
    universal: "Access, solutions, unlocking hidden knowledge or potential",
    personal: "The answer you've been seeking may already be in your hands — look at what's right in front of you",
    archetypes: ["The Wise Old One", "The Self"],
    emotions: ["discovery", "empowerment"],
    themes: ["solutions", "hidden knowledge"],
  },
  fire: {
    universal: "Passion, transformation, destruction that creates, purification through intensity",
    personal: "Something is being forged in the heat of your experience — let it transform you",
    archetypes: ["The Hero", "The Shadow"],
    emotions: ["passion", "intensity"],
    themes: ["transformation", "passion"],
  },
  garden: {
    universal: "Cultivation, the inner landscape you tend, growth through careful attention",
    personal: "What are you nurturing? The garden shows the state of what you've been tending — or neglecting",
    archetypes: ["The Mother", "The Self"],
    emotions: ["peace", "nurturing"],
    themes: ["growth", "cultivation"],
  },
  road: {
    universal: "Life's path, direction, the journey of individuation",
    personal: "Notice the road's condition — smooth or rough, this reflects your sense of your current path",
    archetypes: ["The Hero", "The Labyrinth"],
    emotions: ["purposeful", "uncertain"],
    themes: ["journey", "direction"],
  },
  stranger: {
    universal: "An unknown aspect of yourself, the 'other' that holds what you haven't yet integrated",
    personal: "This figure likely represents a part of you that's ready to be met and known",
    archetypes: ["The Shadow", "The Anima"],
    emotions: ["curiosity", "wariness"],
    themes: ["integration", "the unknown self"],
  },
  teeth: {
    universal: "Power, self-image, anxiety about appearance or ability, loss of control",
    personal: "Your confidence or sense of personal power may be in flux — what feels fragile right now?",
    archetypes: ["The Shadow", "The Child"],
    emotions: ["anxiety", "vulnerability"],
    themes: ["self-image", "control"],
  },
  naked: {
    universal: "Vulnerability, authenticity, fear of exposure, the desire to be seen as you truly are",
    personal: "Part of you is ready to be seen without masks — beautiful and terrifying in equal measure",
    archetypes: ["The Child", "The Self"],
    emotions: ["vulnerability", "liberation"],
    themes: ["authenticity", "exposure"],
  },
  school: {
    universal: "Learning, testing, unfinished lessons from the past, the classroom of life",
    personal: "An old lesson is circling back — what did you not fully learn the first time?",
    archetypes: ["The Child", "The Wise Old One"],
    emotions: ["anxiety", "nostalgia"],
    themes: ["learning", "past lessons"],
  },
  cave: {
    universal: "The deepest unconscious, retreat, initiation, the womb of rebirth",
    personal: "Going inward is not retreat but preparation — something is being incubated in your depths",
    archetypes: ["The Shadow", "The Self"],
    emotions: ["introspective", "primal"],
    themes: ["inner journey", "initiation"],
  },
  crown: {
    universal: "Authority, achievement, higher consciousness, sovereignty over oneself",
    personal: "You're being called to own your authority — what throne have you been avoiding?",
    archetypes: ["The Self", "The Hero"],
    emotions: ["empowerment", "responsibility"],
    themes: ["authority", "self-mastery"],
  },
  clock: {
    universal: "Time pressure, mortality, the urgency of the unlived life",
    personal: "Time is speaking to you — what have you been postponing that your soul is ready for?",
    archetypes: ["The Wise Old One", "The Shadow"],
    emotions: ["urgency", "anxiety"],
    themes: ["time", "mortality"],
  },
  window: {
    universal: "Perspective, observation, seeing without entering, the boundary between inner and outer",
    personal: "Are you watching life through the glass or stepping through? The dream asks you to choose",
    archetypes: ["The Self"],
    emotions: ["longing", "contemplative"],
    themes: ["perspective", "boundaries"],
  },
  storm: {
    universal: "Emotional upheaval, cleansing crisis, the dismantling that precedes rebuilding",
    personal: "The storm is not punishment but purification — after it passes, the air will be clearer",
    archetypes: ["The Shadow", "The Hero"],
    emotions: ["turmoil", "catharsis"],
    themes: ["upheaval", "cleansing"],
  },
  flower: {
    universal: "Beauty, unfolding, the blooming of potential, fragility and resilience",
    personal: "Something in you is ready to bloom — give it sun, water, and patience",
    archetypes: ["The Child", "The Anima"],
    emotions: ["beauty", "tenderness"],
    themes: ["blossoming", "potential"],
  },
  mask: {
    universal: "Persona, social roles, what you show the world versus who you are inside",
    personal: "Which mask were you wearing — or removing? The psyche is negotiating authenticity",
    archetypes: ["The Shadow", "The Trickster"],
    emotions: ["concealment", "revelation"],
    themes: ["persona", "authenticity"],
  },
  sword: {
    universal: "Discrimination, truth-cutting, the power to separate what serves from what doesn't",
    personal: "A decisive energy is available to you — what needs to be clearly cut away?",
    archetypes: ["The Hero", "The Animus"],
    emotions: ["decisive", "powerful"],
    themes: ["truth", "discernment"],
  },
  island: {
    universal: "Isolation, self-sufficiency, a contained world of the self",
    personal: "Are you seeking solitude or feeling stranded? The island reflects your relationship with independence",
    archetypes: ["The Self", "The Shadow"],
    emotions: ["lonely", "peaceful"],
    themes: ["solitude", "independence"],
  },
  stairs: {
    universal: "Ascent or descent in consciousness, progress, moving between levels of awareness",
    personal: "Going up or down? Ascending brings new awareness; descending brings deeper self-knowledge",
    archetypes: ["The Hero", "The Self"],
    emotions: ["effort", "progress"],
    themes: ["advancement", "levels of consciousness"],
  },
  hand: {
    universal: "Agency, capability, connection, the power to shape your world",
    personal: "Your hands represent your ability to create, heal, and connect — how are you using them?",
    archetypes: ["The Hero", "The Mother"],
    emotions: ["capable", "reaching"],
    themes: ["agency", "creation"],
  },
  blood: {
    universal: "Life force, passion, sacrifice, the essential vitality that runs through all things",
    personal: "Your vital energy is highlighted — where is your life force flowing, and where is it blocked?",
    archetypes: ["The Shadow", "The Hero"],
    emotions: ["intensity", "primal"],
    themes: ["vitality", "sacrifice"],
  },
  train: {
    universal: "Life's momentum, collective journey, being on track or changing course",
    personal: "Are you driving or riding? The train reflects whether you feel in control of your life's direction",
    archetypes: ["The Hero", "The Labyrinth"],
    emotions: ["momentum", "anticipation"],
    themes: ["direction", "destiny"],
  },
};

// ─── Mood-Based Interpretation Templates ─────────────

const MOOD_INTERPRETATIONS: Record<string, string> = {
  calm: "Your calm emotional state suggests that your unconscious is in a phase of integration — processing experiences with a gentle, accepting energy. The serenity of your waking mood infuses the dream with a quality of peaceful revelation rather than urgent message.",
  anxious: "The anxiety you're carrying into sleep has shaped this dream into a processing ground for your worries. Your psyche is working overtime to simulate scenarios and prepare you — this is actually your mind's protective wisdom at work, not a sign of trouble.",
  curious: "Your curious state of mind has opened the dream gates wide. When we approach sleep with curiosity, the unconscious responds with richer, more elaborate imagery — like a library opening its restricted section to the truly interested reader.",
  melancholic: "The melancholic undercurrent in your waking life has given this dream a contemplative quality. Your psyche is metabolizing loss or longing, transforming it through dream-imagery into something that can be understood and eventually integrated.",
  euphoric: "Your euphoric emotional state has amplified the dream's visionary qualities. Joy opens channels to the deeper self, and your unconscious has responded with imagery that mirrors your expanded sense of possibility.",
  fearful: "Fear has been your psyche's alarm system — and in dreams, it's especially eloquent. Your unconscious isn't trying to frighten you; it's trying to show you what needs attention. The very act of dreaming about fear begins to transform it.",
  nostalgic: "Nostalgia has woven time travel into your dream. Your psyche is revisiting the past not to trap you there, but to retrieve something valuable — a feeling, a lesson, a quality that your present self needs.",
  confused: "The confusion you're experiencing in waking life has generated a dream rich with paradox and shifting meanings. This is actually healthy — your psyche is admitting complexity rather than forcing premature clarity. Trust the not-knowing.",
};

// ─── Core Engine Functions ───────────────────────────

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2);

  const stopWords = new Set([
    "the", "and", "was", "were", "had", "has", "have", "been", "being",
    "this", "that", "these", "those", "with", "from", "into", "about",
    "they", "them", "their", "there", "then", "than", "what", "when",
    "where", "which", "while", "who", "whom", "its", "for", "not",
    "but", "can", "could", "would", "should", "will", "just", "don",
    "now", "only", "very", "also", "back", "still", "some", "all",
    "like", "more", "out", "over", "such", "than", "too", "around",
    "before", "after", "between", "through", "during", "each", "few",
    "most", "other", "did", "does", "doing", "really", "got", "get",
    "started", "began", "felt", "saw", "went", "came", "made", "see",
    "dream", "dreamed", "dreaming", "could", "seemed", "suddenly",
  ]);

  return [...new Set(words.filter(w => !stopWords.has(w)))];
}

function findMatchingSymbols(text: string): Array<{ keyword: string; symbol: SymbolEntry }> {
  const lowerText = text.toLowerCase();
  const matches: Array<{ keyword: string; symbol: SymbolEntry }> = [];

  for (const [keyword, symbol] of Object.entries(DREAM_SYMBOLS)) {
    if (lowerText.includes(keyword)) {
      matches.push({ keyword, symbol });
    }
  }

  // Also check for related words
  const synonymMap: Record<string, string> = {
    swim: "water", swimming: "water", lake: "water", pond: "water", flood: "water", drown: "water",
    sea: "ocean", waves: "ocean", shore: "ocean", beach: "ocean",
    woods: "forest", jungle: "forest", trees: "forest",
    fly: "flying", soar: "flying", float: "flying", wing: "flying", wings: "flying",
    fall: "falling", dropped: "falling", plunge: "falling", slip: "falling",
    run: "running", sprint: "running", rushing: "running", fled: "running",
    chased: "chase", chasing: "chase", pursued: "chase", following: "chase",
    die: "death", dying: "death", dead: "death", kill: "death", funeral: "death",
    infant: "baby", newborn: "baby", pregnant: "baby",
    kid: "child", childhood: "child", young: "child", girl: "child", boy: "child",
    wolf: "animal", bear: "animal", horse: "animal", lion: "animal", spider: "animal",
    teeth: "teeth", tooth: "teeth",
    nude: "naked", undressed: "naked", exposed: "naked",
    classroom: "school", exam: "school", test: "school", teacher: "school",
    path: "road", highway: "road", trail: "road", street: "road",
    flame: "fire", burn: "fire", burning: "fire",
    rain: "rain", raining: "rain", downpour: "rain",
    thunder: "storm", lightning: "storm", tornado: "storm", hurricane: "storm",
    bloom: "flower", rose: "flower", petal: "flower",
    face: "mirror", reflection: "mirror",
    stair: "stairs", staircase: "stairs", ladder: "stairs", step: "stairs",
    home: "house", room: "house", building: "house", apartment: "house",
    gate: "door", entrance: "door", portal: "door", doorway: "door",
    lock: "key", unlock: "key",
    tunnel: "cave", underground: "cave", pit: "cave",
    blood: "blood", bleed: "blood", bleeding: "blood",
    time: "clock", watch: "clock", late: "clock", hurry: "clock",
  };

  for (const [word, symbolKey] of Object.entries(synonymMap)) {
    if (lowerText.includes(word) && DREAM_SYMBOLS[symbolKey]) {
      const existing = matches.find(m => m.keyword === symbolKey);
      if (!existing) {
        matches.push({ keyword: symbolKey, symbol: DREAM_SYMBOLS[symbolKey] });
      }
    }
  }

  return matches;
}

function detectArchetypes(symbols: Array<{ keyword: string; symbol: SymbolEntry }>, text: string): string[] {
  const archetypeSet = new Set<string>();

  // From matched symbols
  for (const { symbol } of symbols) {
    for (const archetype of symbol.archetypes) {
      archetypeSet.add(archetype);
    }
  }

  // Keyword-based archetype detection
  const lowerText = text.toLowerCase();
  const archetypeKeywords: Record<string, string[]> = {
    "The Shadow": ["dark", "shadow", "enemy", "monster", "demon", "hidden", "secret", "evil", "scary", "horror"],
    "The Anima": ["woman", "goddess", "feminine", "beauty", "gentle", "grace", "intuitive", "muse"],
    "The Animus": ["man", "warrior", "masculine", "strong", "king", "father", "protect", "authority"],
    "The Self": ["circle", "mandala", "whole", "center", "complete", "unity", "cosmic", "universe"],
    "The Hero": ["fight", "battle", "overcome", "brave", "courage", "quest", "adventure", "save"],
    "The Trickster": ["trick", "joke", "chaos", "laugh", "fool", "clever", "surprise", "strange"],
    "The Mother": ["mother", "mom", "nurture", "protect", "comfort", "warm", "care", "heal"],
    "The Wise Old One": ["wise", "old", "ancient", "guide", "sage", "knowledge", "teacher", "mentor"],
    "The Child": ["child", "play", "innocent", "wonder", "small", "young", "new", "born"],
    "The Water": ["water", "ocean", "river", "rain", "lake", "swim", "wave", "flood"],
    "The Flight": ["fly", "wing", "soar", "air", "sky", "high", "above", "cloud"],
    "The Labyrinth": ["maze", "lost", "wander", "path", "turn", "complex", "puzzle", "search"],
  };

  for (const [archetype, keywords] of Object.entries(archetypeKeywords)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      archetypeSet.add(archetype);
    }
  }

  // Ensure at least 2 archetypes
  const allArchetypes = Object.keys(archetypeKeywords);
  while (archetypeSet.size < 2) {
    archetypeSet.add(allArchetypes[Math.floor(Math.random() * allArchetypes.length)]);
  }

  return Array.from(archetypeSet).slice(0, 5);
}

function detectEmotions(symbols: Array<{ keyword: string; symbol: SymbolEntry }>, text: string, mood?: string): string[] {
  const emotionSet = new Set<string>();

  // From mood
  if (mood) {
    emotionSet.add(mood);
  }

  // From symbols
  for (const { symbol } of symbols) {
    for (const emotion of symbol.emotions) {
      emotionSet.add(emotion);
    }
  }

  // From text keywords
  const lowerText = text.toLowerCase();
  const emotionKeywords: Record<string, string[]> = {
    fear: ["afraid", "scared", "fear", "terrified", "panic", "horror", "dread"],
    joy: ["happy", "joy", "laugh", "smile", "wonderful", "beautiful", "amazing"],
    sadness: ["sad", "cry", "tears", "grief", "sorrow", "miss", "lost"],
    anger: ["angry", "rage", "fury", "mad", "yell", "scream", "violent"],
    wonder: ["wonder", "awe", "magical", "enchanted", "mystical", "surreal"],
    anxiety: ["anxious", "worry", "nervous", "stress", "tense", "urgent", "panic"],
    peace: ["calm", "serene", "quiet", "still", "peace", "gentle", "soft"],
    confusion: ["confused", "strange", "weird", "bizarre", "didn't make sense", "odd"],
    longing: ["miss", "yearn", "want", "wish", "hope", "desire", "reach"],
    love: ["love", "embrace", "kiss", "hold", "warm", "tender", "heart"],
  };

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      emotionSet.add(emotion);
    }
  }

  while (emotionSet.size < 2) {
    const defaults = ["contemplative", "mysterious", "searching", "transformative"];
    emotionSet.add(defaults[Math.floor(Math.random() * defaults.length)]);
  }

  return Array.from(emotionSet).slice(0, 5);
}

function detectThemes(symbols: Array<{ keyword: string; symbol: SymbolEntry }>, text: string): string[] {
  const themeSet = new Set<string>();

  for (const { symbol } of symbols) {
    for (const theme of symbol.themes) {
      themeSet.add(theme);
    }
  }

  const lowerText = text.toLowerCase();
  const themeKeywords: Record<string, string[]> = {
    "transformation": ["change", "transform", "become", "morph", "shift", "turn into"],
    "loss": ["lose", "lost", "gone", "disappear", "vanish", "missing"],
    "pursuit": ["chase", "follow", "hunt", "search", "find", "seek"],
    "identity": ["who am i", "face", "name", "mirror", "self", "person"],
    "connection": ["together", "meet", "friend", "family", "love", "with"],
    "power": ["control", "power", "strong", "force", "command", "rule"],
    "freedom": ["free", "escape", "break", "release", "open", "fly"],
    "time": ["past", "future", "old", "young", "age", "clock", "remember"],
  };

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      themeSet.add(theme);
    }
  }

  while (themeSet.size < 2) {
    const defaults = ["self-discovery", "unconscious exploration", "emotional processing", "personal growth"];
    themeSet.add(defaults[Math.floor(Math.random() * defaults.length)]);
  }

  return Array.from(themeSet).slice(0, 5);
}

function generateImagePrompt(symbols: Array<{ keyword: string; symbol: SymbolEntry }>, text: string, mood?: string): string {
  const symbolNames = symbols.slice(0, 3).map(s => s.keyword);
  const keywords = extractKeywords(text).slice(0, 4);
  const elements = [...new Set([...symbolNames, ...keywords])].slice(0, 5);
  const moodStr = mood ? `, ${mood} atmosphere` : "";
  return `Digital art, surreal dreamscape featuring ${elements.join(", ")}${moodStr}, ethereal lighting, painterly quality, cosmic elements, watercolor meets digital surrealism`;
}

// ─── Build Interpretation Text ───────────────────────

function buildInterpretation(
  text: string,
  mood: string | undefined,
  symbols: Array<{ keyword: string; symbol: SymbolEntry }>,
  archetypes: string[],
  emotions: string[],
): string {
  const lines: string[] = [];
  const keywords = extractKeywords(text);
  // Pick a few vivid keywords from the dream to reference throughout
  const dreamWords = keywords.slice(0, 6);
  const topWords = dreamWords.slice(0, 3);

  lines.push("## 🔮 Dream Interpretation\n");

  // Symbol analysis
  lines.push("### The Symbolic Landscape\n");
  if (symbols.length > 0) {
    const symbolList = symbols.slice(0, 3).map(s => `*${s.keyword}*`).join(", ");
    lines.push(`Your dream weaves together potent imagery — ${symbolList} — each carrying layers of meaning drawn from your unique inner world:\n`);
    for (const { keyword, symbol } of symbols.slice(0, 5)) {
      const capitalizedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      lines.push(`**${capitalizedKeyword}** — ${symbol.universal}. ${symbol.personal}\n`);
    }
  } else {
    // Even without symbol matches, reference the user's own words
    const userImagery = topWords.length > 0
      ? `the imagery of **${topWords.join("**, **")}**`
      : "the images you've described";
    lines.push(`While your dream doesn't feature the most commonly catalogued universal symbols, ${userImagery} speaks to the deeply personal vocabulary of your psyche. These are images your unconscious has chosen specifically for you — they carry meaning that generic symbol dictionaries can't capture. The emotional charge they carry is itself the message.\n`);
  }

  // Emotional arc — weave in dream words
  lines.push("\n### The Emotional Arc\n");
  if (mood && MOOD_INTERPRETATIONS[mood]) {
    lines.push(MOOD_INTERPRETATIONS[mood] + "\n");
  }
  if (emotions.length > 0) {
    const emotionList = emotions.join(", ");
    const contextualDetail = topWords.length > 0
      ? ` The presence of **${topWords[0]}** in your dream amplifies this emotional landscape — it suggests your psyche is drawing attention to something specific.`
      : "";
    lines.push(`The emotional palette of this dream weaves together threads of **${emotionList}**.${contextualDetail} These aren't random feelings — they're your psyche's honest report on what's moving beneath the surface of your waking awareness. Notice which emotion lingers most; that's where your attention is being drawn.\n`);
  }

  // Archetypes — reference dream content
  lines.push("\n### Archetypes at Play\n");
  if (topWords.length > 0) {
    lines.push(`Within your dream of **${topWords.join("** and **")}**, several ancient patterns emerge:\n`);
  }
  const archetypeDescriptions: Record<string, { emoji: string; desc: string }> = {
    "The Shadow": { emoji: "🌑", desc: "Something hidden is seeking the light of your awareness" },
    "The Anima": { emoji: "🌙", desc: "Your intuitive, creative nature is stirring" },
    "The Animus": { emoji: "☀️", desc: "Your assertive, logical nature is being called forward" },
    "The Self": { emoji: "✨", desc: "You're moving toward wholeness and integration" },
    "The Hero": { emoji: "⚔️", desc: "A challenge awaits that will forge new strength" },
    "The Trickster": { emoji: "🃏", desc: "Expect the unexpected — wisdom hides in disruption" },
    "The Mother": { emoji: "🌿", desc: "Nurturing, protection, and creative fertility are themes" },
    "The Wise Old One": { emoji: "🦉", desc: "Deep wisdom is available if you listen carefully" },
    "The Child": { emoji: "🌸", desc: "Innocence and new beginnings are emerging" },
    "The Water": { emoji: "🌊", desc: "Emotions and the unconscious are flowing powerfully" },
    "The Flight": { emoji: "🕊️", desc: "Freedom and transcendence are calling" },
    "The Labyrinth": { emoji: "🌀", desc: "A complex inner journey is underway" },
  };

  for (const archetype of archetypes) {
    const info = archetypeDescriptions[archetype];
    if (info) {
      lines.push(`- **${archetype}** ${info.emoji} — ${info.desc}`);
    }
  }

  // Science lens — reference dream specifics
  lines.push("\n\n### Through the Lens of Science\n");
  const keywordRef = topWords.length > 0
    ? `The appearance of **${topWords[0]}** in your dream is likely connected to recent experiences or thoughts your waking mind has been processing. `
    : "";
  const scienceInsights = [
    `${keywordRef}Modern neuroscience tells us that dreaming is one of the brain's most sophisticated processes. During REM sleep, the prefrontal cortex — your rational executive — goes quiet, while the emotional centers (amygdala) and memory regions (hippocampus) light up like a city at night. This dream bears the hallmarks of **emotional memory consolidation** — your brain is filing, connecting, and making sense of experiences that your waking mind hasn't fully processed.`,
    `${keywordRef}From a cognitive neuroscience perspective, this dream shows signs of **threat simulation theory** at work — your brain rehearses challenging scenarios during sleep so you're better prepared in waking life. Far from being a source of distress, this rehearsal is your mind's ancient survival wisdom expressing itself through the language of imagery and narrative.`,
    `${keywordRef}Neuroscience research suggests that dreams like this serve a **creative problem-solving** function. When the analytical mind sleeps, the brain makes unusual connections between distant memories and concepts — connections that could never form through logical thinking alone. The surprising elements of your dream may hold the seeds of insight about a waking-life question you've been turning over.`,
    `${keywordRef}Contemporary dream research points to this dream as an example of **emotional regulation through sleep**. Your brain is essentially providing itself therapy — revisiting emotionally charged material in a safe neurological state where it can be reprocessed with less distress. The ancient Greeks weren't wrong when they called dreams 'the healing sleep.'`,
  ];
  lines.push(scienceInsights[Math.floor(Math.random() * scienceInsights.length)] + "\n");

  // Invitation — reference specific dream imagery
  lines.push("\n### The Invitation\n");
  const imageRef = dreamWords.length > 1
    ? `the **${dreamWords[0]}** and **${dreamWords[1]}**`
    : dreamWords.length === 1
    ? `the **${dreamWords[0]}**`
    : "the images";
  const invitations = [
    `This dream is an invitation to explore how ${imageRef} maps onto your waking life. Consider journaling about the images that felt most charged — the ones that still shimmer in memory. Your unconscious chose these specific images for a reason; unwrapping that meaning gently, with curiosity rather than anxiety, is the work of self-understanding. What would it look like to honor what this dream is showing you?`,
    `Your psyche crafted this dream with care, placing ${imageRef} at the center for a reason that resonates with your inner landscape. The invitation is not to "solve" the dream but to sit with it — let its images wash over you throughout the day and notice what they illuminate. Pay attention to moments when waking life echoes the dream; those synchronicities are breadcrumbs on the path of self-discovery.`,
    `This dream is a letter from your deeper self, with ${imageRef} as its central metaphor. The invitation: carry one image from this dream with you today. Let it be a touchstone, a private talisman. Notice what it attracts in your waking experience — conversations, decisions, moments of recognition. Your unconscious is always working on your behalf, even when the conscious mind is looking elsewhere.`,
    `What this dream ultimately invites you toward — through ${imageRef} and everything they represent — is a deeper relationship with your own inner world. The symbols here aren't puzzles to be solved but doorways to be walked through. Take what resonates and leave the rest — you are the final authority on your own dream's meaning. If any of this stirs something that feels too heavy to carry alone, please know that dream exploration with a therapist can be profoundly rewarding.`,
  ];
  lines.push(invitations[Math.floor(Math.random() * invitations.length)] + "\n");

  return lines.join("\n");
}

// ─── Build Story Continuation ────────────────────────

function buildStory(text: string, symbols: Array<{ keyword: string; symbol: SymbolEntry }>, interpretation: string): string {
  const lines: string[] = [];
  lines.push("## ✨ Your Dream, Continued\n\n");

  // Extract key elements for the story
  const keywords = extractKeywords(text);
  const dreamWords = keywords.slice(0, 6);
  const symbolWords = symbols.slice(0, 3).map(s => s.keyword);
  const hasWater = symbolWords.some(s => ["water", "ocean", "river", "rain"].includes(s));
  const hasNature = symbolWords.some(s => ["forest", "tree", "garden", "flower", "mountain"].includes(s));
  const hasFlight = symbolWords.some(s => ["flying", "bird"].includes(s));
  const hasDarkness = symbolWords.some(s => ["darkness", "shadow", "cave"].includes(s));
  const hasLight = symbolWords.some(s => ["light", "sun", "star", "moon", "fire"].includes(s));

  // Build a personalized story using dream elements
  // Opening — reference actual dream words
  const dreamRef = dreamWords.length > 0
    ? dreamWords.slice(0, 2).join(" and the ")
    : "everything you witnessed";
  const openings = [
    `You find yourself standing exactly where the dream left you — the ${dreamRef} still vivid, still humming with presence. But something has shifted. The air tastes different now, charged with a luminous electricity that makes your skin hum.`,
    `The dream doesn't end. It deepens. The ${dreamRef} remains, but transformed — more real than before. You feel the boundary between sleeping and waking dissolve like morning mist, and suddenly you're *there* again — more present than before.`,
    `You return to the dream's central moment — the ${dreamRef} exactly as you remember, yet subtly changed. This time you are not merely experiencing it. You are choosing it. The landscape recognizes you, and every element turns its face toward your arrival.`,
  ];
  lines.push(openings[Math.floor(Math.random() * openings.length)] + "\n\n");

  // Middle sections based on symbols found
  if (hasWater) {
    const waterWord = symbolWords.find(s => ["water", "ocean", "river", "rain"].includes(s)) || "water";
    lines.push(`The ${waterWord} is alive with intention now. It doesn't merely flow — it *communicates*, each ripple a syllable in a language older than words. You kneel at its edge and see not your reflection but your becoming — the version of you that exists just beyond this moment, shimmering with possibility. The ${waterWord} rises to meet your fingertips, warm as tears, cool as forgiveness.\n\n`);
  }

  if (hasNature) {
    const natureWord = symbolWords.find(s => ["forest", "tree", "garden", "flower", "mountain"].includes(s)) || "forest";
    lines.push(`The ${natureWord} breathes around you. Trees lean in as if they've been waiting to share a secret, their leaves whispering in a rhythm that matches your heartbeat. Roots like ancient veins pulse beneath your feet, connecting everything — the earth remembers every step you've ever taken, and it has grown something beautiful in every footprint you left behind.\n\n`);
  }

  if (hasFlight) {
    lines.push("And then you rise. Not with effort but with permission — as if gravity has been holding you close and has finally agreed to let you see from above. The world below arranges itself into a pattern you couldn't perceive from the ground: everything connected, everything purposeful, even the parts that once seemed chaotic. From here, your life is a constellation.\n\n");
  }

  if (hasDarkness) {
    lines.push("The darkness is not empty. It's full — full of the things you haven't yet named, the feelings you haven't yet felt, the truths you haven't yet spoken. But here, in this sacred dark, they're not frightening. They glow with a bioluminescent patience, waiting for you to be ready. And you realize: you *are* ready. You've been ready longer than you knew.\n\n");
  }

  if (hasLight) {
    const lightWord = symbolWords.find(s => ["light", "sun", "star", "moon", "fire"].includes(s)) || "light";
    lines.push(`The ${lightWord} pours in from a direction that has no name — not above, not ahead, but from the place where meaning lives. It illuminates everything without casting shadows, a light that reveals without judging, that warms without burning. Under its gaze, you feel seen — not observed, but truly *seen* — and for the first time, being seen feels like coming home.\n\n`);
  }

  // If no specific symbols matched, build from keywords
  if (!hasWater && !hasNature && !hasFlight && !hasDarkness && !hasLight) {
    const kw1 = dreamWords[0] || "unknown";
    const kw2 = dreamWords[1] || "mystery";
    const kw3 = dreamWords[2] || "silence";
    lines.push(`The ${kw1} reshapes itself around your attention. Where you look, detail blooms — textures you can feel with your eyes, sounds that have color, distances that carry emotion. The ${kw2} is here too, woven into the fabric of this place like a thread of gold in dark cloth.\n\n`);
    lines.push(`You move toward it, and with each step the world becomes more itself — clearer, more vivid, more honest. The ${kw3} arranges itself around you like an old friend arriving at a gathering, bearing a gift carried a long way to deliver.\n\n`);
  }

  // Transformation moment — reference dream words
  const pivotWord = dreamWords[Math.floor(Math.random() * Math.max(1, dreamWords.length))] || "dream";
  const transformations = [
    `And in this deep-dream space, a transformation begins. The ${pivotWord} was the catalyst all along — not dramatic, not frightening, as natural as a flower opening at dawn. You feel layers of old certainty falling away like autumn leaves, and beneath them: something green, something true, something that has been waiting with infinite patience to emerge.\n\n`,
    `Something shifts in the center of your chest — a warmth, an opening, like a door in a room you'd forgotten existed. The ${pivotWord} has unlocked it. Behind it: not answers, but the *ability* to live the questions beautifully. You understand now that the dream was never a riddle to solve but a landscape to inhabit, a frequency to tune to.\n\n`,
    `Time folds. Past and future meet in the palm of your hand, and the ${pivotWord} is the bridge between them. You see — with a clarity that brings tears — that every seemingly random event of your life has been a word in a sentence that is now, finally, becoming legible. The dream was the Rosetta Stone, and your heart is the translator.\n\n`,
  ];
  lines.push(transformations[Math.floor(Math.random() * transformations.length)]);

  // Closing — use dream-specific language
  const closingRef = dreamWords.slice(0, 2).map(w => `the ${w}`).join(" and ") || "these images";
  const closings = [
    `The dream begins to thin at the edges — ${closingRef} not fading, but transcribing themselves onto the inner walls of your waking consciousness. You'll carry these images like seeds in your pocket, and in the days to come, you'll notice them germinating in unexpected moments: a glance, a gesture, a sudden understanding. The dream is over. The dreaming has only begun.`,
    `Slowly, tenderly, the dream releases you — ${closingRef} lingering the way a wave releases the shore, knowing it will return. You surface into waking with something new inside you: not knowledge exactly, but a quality of attention, a willingness to see the world as the dream saw you — with wonder, with depth, with love.`,
    `As consciousness reclaims you, ${closingRef} don't vanish — they *translate*. Every image becomes a seed, every emotion a compass bearing, every symbol a key to a door you haven't reached yet. You wake not from the dream but *with* it, carrying its luminous cargo into the waiting world.`,
  ];
  lines.push(closings[Math.floor(Math.random() * closings.length)]);

  return lines.join("");
}

// ─── Build Analysis JSON (same format as AI version) ─

export function generateAnalysis(text: string, mood?: string): {
  archetypes: string[];
  emotions: string[];
  themes: string[];
  summary: string;
  imagePrompt: string;
} {
  const symbols = findMatchingSymbols(text);
  const archetypes = detectArchetypes(symbols, text);
  const emotions = detectEmotions(symbols, text, mood);
  const themes = detectThemes(symbols, text);

  // Generate summary
  const keywords = extractKeywords(text).slice(0, 5);
  const summaryThemes = themes.slice(0, 3).join(", ");
  const summary = `A dream exploring themes of ${summaryThemes}, featuring imagery of ${keywords.slice(0, 3).join(", ")}. The unconscious mind speaks through symbols of ${archetypes.slice(0, 2).map(a => a.replace("The ", "").toLowerCase()).join(" and ")}.`;

  const imagePrompt = generateImagePrompt(symbols, text, mood);

  return { archetypes, emotions, themes, summary, imagePrompt };
}

// ─── Main Engine: Generate Full Interpretation ───────

export function generateInterpretation(text: string, mood?: string): string {
  const symbols = findMatchingSymbols(text);
  const archetypes = detectArchetypes(symbols, text);
  const emotions = detectEmotions(symbols, text, mood);

  return buildInterpretation(text, mood, symbols, archetypes, emotions);
}

export function generateStory(text: string, mood?: string): string {
  const symbols = findMatchingSymbols(text);
  const interpretation = generateInterpretation(text, mood);
  return buildStory(text, symbols, interpretation);
}

// ─── Streaming Simulation (yields chunks) ────────────

export async function* streamInterpretation(text: string, mood?: string): AsyncGenerator<string> {
  const fullText = generateInterpretation(text, mood);
  // Simulate streaming by yielding word groups
  const words = fullText.split(" ");
  const chunkSize = 3;
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(" ") + " ";
    yield chunk;
    // Small delay to simulate streaming feel
    await new Promise(r => setTimeout(r, 15));
  }
}

export async function* streamStory(text: string, mood?: string): AsyncGenerator<string> {
  const fullText = generateStory(text, mood);
  const words = fullText.split(" ");
  const chunkSize = 3;
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(" ") + " ";
    yield chunk;
    await new Promise(r => setTimeout(r, 15));
  }
}
