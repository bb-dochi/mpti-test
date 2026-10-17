const names = {
    LIPS: "Tile Fairy",
    LIPT: "Certified Immersionist",
    LICS: "Card Shark",
    LICT: "Chaos Gremlin",

    LAPS: "VP Hoarder",
    LAPT: "Lore Nerd",
    LACS: "The Saboteur",
    LACT: "The Interrogator",

    HAPS: "The Architect",
    HAPT: "Concept Crafter",
    HACS: "Market Mogul",
    HACT: "The Commander",

    HIPS: "Value Hunter",
    HIPT: "Main Character Energy",
    HICS: "The Menace",
    HICT: "The Bulldozer",
};

const matches = {
    LIPS: ["LAPS", "HICT"],
    LIPT: ["LAPT", "HACS"],
    LICS: ["LACS", "HAPT"],
    LICT: ["LACT", "HAPS"],

    LAPS: ["LIPS", "HACT"],
    LAPT: ["LIPT", "HICS"],
    LACS: ["LICS", "HIPT"],
    LACT: ["LICT", "HIPS"],

    HAPS: ["HIPS", "LICT"],
    HAPT: ["HIPT", "LICS"],
    HACS: ["HICS", "LIPT"],
    HACT: ["HICT", "LAPS"],

    HIPS: ["HAPS", "LACT"],
    HIPT: ["HAPT", "LACS"],
    HICS: ["HICT", "LAPT"],
    HICT: ["HACT", "LIPS"],
};

const details = {
    LIPS: [
        "AP Immunity",
        "Why worry about everyone else's board when you could make your own look perfect? You trust your instincts, slot pieces into place without hesitation, and live for that satisfying moment when everything fits just right.",
        "Cascadia, Sagrada, Project L — personal puzzle games where you can peacefully build your own little masterpiece.",
    ],

    LIPT: [
        "Instant Character Attachment",
        "Cold calculations matter less to you than the art, atmosphere, and emotional highs of the game. You genuinely suffer when your team is in danger and light up over beautiful components. Give you a thematic or cooperative game where everyone can root for each other, and you're fully invested.",
        "Dixit, Once Upon a Time, Telestrations — imaginative games where pictures and stories spiral into wonderfully unexpected places.",
    ],

    LICS: [
        "Poker Face",
        "You don't need dense rules or an epic storyline—just a chance to bluff, read the room, and get inside someone's head. Forget careful card counting; you'd rather catch one nervous glance, call it out, and land the perfect psychological hit.",
        "Cockroach Poker, Skull, Love Letter — short, spicy bluffing games won through facial expressions, confidence, and shameless lies.",
    ],

    LICT: [
        "Maximum Trolling",
        "Winning is optional; making the wildest possible move is not. You love the politics, table talk, and chaos that happen inside a game's theme. Logic and airtight alibis are overrated when confidence and sheer momentum can turn the whole table upside down.",
        "Saboteur, BANG!, King of Tokyo — chaotic games where one unexpected move can derail the entire table.",
    ],

    LAPS: [
        "Value Calculator",
        "Theme is nice, but efficiency is the real game. While everyone else places tiles by feel, you're quietly thinking, “Wait—that loses me one point.” Even in a light game, you'll squeeze every last bit of value out of every move and celebrate each tiny gain.",
        "Splendor, Point Salad, Century: Spice Road — efficiency games that turn even the smallest gain into precious victory points.",
    ],

    LAPT: [
        "Read Every Word",
        "“Oh, so that's why this character has that ability!” Nothing beats the moment when theme and mechanics click perfectly into place. You don't just soak up the atmosphere—you connect scattered clues, flavor text, and rules until you've excavated the entire world.",
        "Unlock!, MicroMacro: Crime City, murder mystery games — mysteries where every clue and story detail brings you closer to the full truth.",
    ],

    LACS: [
        "Calculated Sabotage",
        "You read your opponents' plans and know exactly where to hit them where it hurts. Scoring points is fine, but perfectly blocking an escape route and watching someone's entire plan fall apart? That's the real dopamine hit.",
        "Quoridor, Kahuna, Blokus — tactical games about reading your opponent's expansion and shutting down the crucial routes.",
    ],

    LACT: [
        "Pressure Interrogation",
        "You don't win arguments by being the loudest. You pull up past votes, track every inconsistency, and dismantle someone's story point by point until they have nowhere left to run. Cold logic is how you take control of the table.",
        "The Resistance: Avalon, Decrypto, One Night Ultimate Werewolf — deduction games where every contradiction can expose someone's true identity.",
    ],

    HAPS: [
        "The Big Picture",
        "You want a victory built on calculation and cause and effect, not lucky breaks. Nothing feels better than watching every part of your system turn together like a perfectly built machine—though occasionally, thinking ten turns ahead makes you overlook the one resource sitting right in front of you.",
        "Terraforming Mars, Carnegie, Gaia Project — heavy strategy games where you build one massive engine from the opening turn to final scoring.",
    ],

    HAPT: [
        "Commit to the Bit",
        "Pure point optimization gets boring fast. You want to use every corner of a big, complex ruleset to build a strategy that perfectly fits your character, faction, or personal concept. If the final result feels like an epic character arc, that's a real victory.",
        "Spirit Island, Root, Gloomhaven — strategy games that let you fully commit to the unique identity of your character or faction.",
    ],

    HACS: [
        "First-Mover Advantage",
        "You don't play heavy Euros just to score quietly in your own corner. You want control of the entire economy and infrastructure. Forget smashing someone's building—you'd rather monopolize the resources and networks they depend on until the system itself shuts them out.",
        "Brass: Birmingham, Barrage, Food Chain Magnate — economic games where controlling resources, markets, and infrastructure means controlling the table.",
    ],

    HACT: [
        "Cut the Supply Lines",
        "You rule over sprawling maps, territorial struggles, and wars for influence. While keeping your own position secure, you tighten the pressure through careful formations, resource control, and blocked supply lines until your opponents have nowhere left to breathe.",
        "War of the Ring, Root, Scythe — strategy games where you command armies, resources, and territory across the entire map.",
    ],

    HIPS: [
        "Best Move Right Now",
        "Why commit to one elaborate master plan when you can spot the juiciest move every single turn? You have great instincts, see opportunities quickly, and prefer growing your own board over attacking others. Even when a plan collapses, you effortlessly pivot to the next-best option.",
        "The Castles of Burgundy, Grand Austria Hotel, The Voyages of Marco Polo — Euros that reward finding the most valuable move in every changing board state.",
    ],

    HIPT: [
        "Create the Narrative",
        "One victory point can't compete with doing what your character would actually do. You love grand worlds and personal stories, and you'd rather complete an unforgettable journey than spend the whole game calculating how to attack someone. Afterward, you're more likely to recount your character's adventure than your final score.",
        "Arkham Horror: The Card Game, Mage Knight, Pandemic Legacy — deep strategy games where character growth and epic storytelling matter as much as winning.",
    ],

    HICS: [
        "Predatory Blocking Instinct",
        "You love the weighty systems of heavy Euros, but quietly playing multiplayer solitaire bores you. You instinctively spot the move that will hurt an opponent most, then poke at their weak point before they can recover. Sometimes ruining their plan is simply more satisfying than improving your own score.",
        "Food Chain Magnate, Age of Steam, Pax Pamir: Second Edition — highly interactive strategy games that reward relentless pressure on your opponents' weakest points.",
    ],

    HICT: [
        "Charge First, Calculate Later",
        "You live for epic games filled with war, betrayal, and glorious conflict. Careful efficiency can't compete with raw momentum and dramatic revenge. If someone provokes you, you're perfectly willing to abandon first place and spend the rest of the game dragging them down with you.",
        "Tyrants of the Underdark, Dune: Imperium, Small World — area-control games where concentrated force and influence can flip the entire board.",
    ],
};

const matchDescriptions = {
    LIPS: {
        good: "No pointless interference—just two players peacefully optimizing their own puzzles and scoring engines.",
        bad: "Their reckless charges and dramatic grudges are exhausting when all you want is a quick, satisfying puzzle.",
    },

    LIPT: {
        good: "Their deep knowledge of the lore gives you even more reasons to get emotionally invested in the world.",
        bad: "They squeeze every resource and critical route so mercilessly that your cozy game night stops feeling cozy.",
    },

    LICS: {
        good: "You trade clever blocks and shameless bluffs, happily destroying everyone's mental stability together.",
        bad: "You're trying to stir up some quick table drama while they're busy constructing a painfully serious epic build.",
    },

    LICT: {
        good: "Your wild accusations and their relentless cross-examinations guarantee that the table is never quiet.",
        bad: "One impulsive troll move can throw sand into the machine they've spent three hours carefully designing.",
    },

    LAPS: {
        good: "You both focus on clean optimization and efficient scoring without getting in each other's way.",
        bad: "They crush the tiny supply line you've been using to collect your precious points one at a time.",
    },

    LAPT: {
        good: "They give your painstaking lore discoveries exactly the dramatic reactions they deserve.",
        bad: "You want to dig into the story, but they keep wrecking the pace with relentless, instinctive interference.",
    },

    LACS: {
        good: "A spicy duo built on calculated blocking, shameless bluffing, and making everyone else miserable.",
        bad: "You perfectly close off every escape route, only for them to ignore efficiency and choose the most dramatic move instead.",
    },

    LACT: {
        good: "Cold logic meets chaotic confidence, and together you can carry an entire social deduction game.",
        bad: "No matter how tightly you corner them, they casually pivot to the next-best move and escape with all the value.",
    },

    HAPS: {
        good: "A peaceful heavy-Euro partnership where one player adapts on the fly while the other builds the perfect long-term engine.",
        bad: "Their random trolling throws a wrench into the elegant machine you've spent the last three hours constructing.",
    },

    HAPT: {
        good: "You're both more invested in epic character arcs and thematic storytelling than cold-blooded optimization.",
        bad: "You're building an epic saga, and they keep breaking the mood with cheap bluffs and casual trash talk.",
    },

    HACS: {
        good: "A brutal rivalry where calculated control and predatory interference tear each other's systems apart.",
        bad: "You trap them with perfect efficiency, only to feel awkward when they get genuinely sad about losing the cozy vibe.",
    },

    HACT: {
        good: "Calculated control and reckless aggression collide head-on, turning the board into a full-scale war movie.",
        bad: "Your grand military strategy completely wipes out the tiny supply route they were using to collect one point at a time.",
    },

    HIPS: {
        good: "Your flexible short-term plays and their carefully engineered big picture coexist beautifully on a peaceful board.",
        bad: "You're busy grabbing the best move available, and they keep dragging you back into old votes and forgotten table logs.",
    },

    HIPT: {
        good: "You both respect each other's dramatic character arcs and thematic choices without turning everything into a bloodbath.",
        bad: "You're setting off on a grand adventure, and they keep scattering obstacles across your path just because they can.",
    },

    HICS: {
        good: "Instinctive disruption meets full-force aggression, turning the entire game into an interactive nightmare.",
        bad: "You want to shake up the board, but they keep stopping to analyze lore, flavor text, and thematic consistency.",
    },

    HICT: {
        good: "Raw momentum crashes into calculated control, creating an all-out war across the map.",
        bad: "You're performing a glorious battle dance while they sit in the corner, quietly matching tiles on their own board.",
    },
};

export const englishCharacters = Object.fromEntries(
    Object.keys(names).map((id) => {
        const [passive, description, favor] = details[id];
        const [good, bad] = matches[id];

        return [
            id,
            {
                name: names[id],
                passive,
                description,
                favor,

                goodMatch: `${good} (${names[good]}) — ${matchDescriptions[id].good}`,

                badMatch: `${bad} (${names[bad]}) — ${matchDescriptions[id].bad}`,
            },
        ];
    }),
);

export const resultCopy = {
    kr: {
        invalid: (
            <>
                존재하지 않는 결과 유형이에요.
                <br />
                홈으로 돌아가 테스트를 다시 시작해 주세요!
            </>
        ),
        home: "홈으로 돌아가기",
        error: "[ERROR] 데이터를 불러올 수 없습니다.",
        back: "메인으로 복귀",
        loading: "[SYSTEM] 보드게임 성향 결과 로드 중...",
        axes: [["가벼움", "묵직함"], ["직관", "분석"], ["상호작용", "개인 전략"], ["테마", "시스템"]],
        analysis: "나의 성향 분석",
        passive: "▶ 패시브 스킬",
        style: "▶ 플레이 스타일",
        games: "🎲 추천 게임",
        good: "🟢 찰떡 파티원",
        bad: "🔴 상극 파티원",
        all: "[ 📜 모든 유형 살펴보기 ]",
        share: "카카오톡으로 결과 공유하기 🔗",
        copy: "테스트 링크 복사 📋",
        retry: "다시 테스트하기 🔄",
        follow: "더 많은 보드게임 이야기가 궁금하다면?",
        testCopied: "테스트 링크를 복사했어요!",
        resultCopied: "결과 링크를 복사했어요!",
        shareTitle: "MPTI - 보드게임 성향 테스트",
        shareText: (name) => `나의 보드게임 자아는 '${name}'입니다. 당신의 성향도 분석해 보세요!`,
        shareButton: "결과 확인하기 ♟️",
        pending: (id) => `♟️ [ ${id} 일러스트 준비 중 ]`,
        unknown: "미등록 미플",
        noData: "데이터 없음",
        missing: "로직 오류 혹은 데이터 누락",
    },

    en: {
        invalid: (
            <>
                That result type does not exist.
                <br />
                Please return home and take the test again.
            </>
        ),
        home: "Back to Home",
        error: "[ERROR] Unable to load result data.",
        back: "Back to Home",
        loading: "[SYSTEM] Loading your board game profile...",
        axes: [["Light", "Heavy"], ["Intuitive", "Analytical"], ["Interaction", "Personal Strategy"], ["Theme", "Mechanics"]],
        analysis: "Your Play Style",
        passive: "▶ PASSIVE SKILL",
        style: "▶ PLAY STYLE",
        games: "🎲 RECOMMENDED GAMES",
        good: "🟢 BEST MATCH",
        bad: "🔴 TOUGH MATCH",
        all: "[ 📜 Explore All Types ]",
        share: "Share Result 🔗",
        copy: "Copy Test Link 📋",
        retry: "RETAKE TEST 🔄",
        follow: "Want more board game stories?",
        testCopied: "Test link copied!",
        resultCopied: "Result link copied!",
        shareTitle: "MPTI - Board Game Personality Test",
        shareText: (name) => `My board game personality is '${name}'. Discover yours!`,
        shareButton: "View Result ♟️",
        pending: (id) => `♟️ [ ${id} illustration coming soon ]`,
        unknown: "Unknown Player",
        noData: "No data",
        missing: "Result data is missing",
    },
};
