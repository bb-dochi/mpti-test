export const DEFAULT_LANGUAGE = "kr";

export const normalizeLanguage = (language) => (language === "en" ? "en" : DEFAULT_LANGUAGE);

export const homeCopy = {
    kr: {
        title: "당신은 어떤 미플인가요?",
    },

    en: {
        title: "What Kind of Meeple Are You?",
    },
};

const englishQuestions = [
    ["You have three hours for game night. What would you rather play?", "Several shorter games with plenty of variety.", "One big game from setup to final scoring."],
    [
        "Someone starts teaching a new game. What are you thinking?",
        "Keep the teach under five minutes. I want something we can jump right into.",
        "A twenty- or thirty-minute teach is fine if the game is worth it.",
    ],
    ["What are you more likely to say after a game?", "Want to play something else?", "Let's run it back—I want to try a different strategy."],
    ["How do you feel about a really thinky game?", "My brain is melting! I'd rather laugh and unwind.", "Bring it on. Finding the best move is incredibly satisfying."],
    ["Which game would you rather keep in your collection?", "A reliable crowd-pleaser that hits the table often.", "A deep game with new strategies to explore every time."],
    ["When my turn starts, what do I look at first?", "My own board and the strategy I'm building.", "The table state and what everyone else is doing."],
    ["Someone deliberately gets in the way of my main strategy. How do I feel?", "It's frustrating when a plan I've worked on falls apart.", "That's player interaction! Adapting is part of the fun."],
    [
        "Even when you lose, what makes you think, “That was a great game”?",
        "Pulling off the strategy I had in mind, regardless of my final score.",
        "A game packed with clever plays, counterplays, and mind games.",
    ],
    ["After the game, what sticks with you the most?", "The moves I could have played better.", "The table talk, clever plays, and memorable moments."],
    ["Which kind of game do you prefer?", "A game where I can focus on building my own engine or strategy.", "A game with plenty of competition, cooperation, and player interaction."],
    ["When my turn starts, how do I usually make my move?", "I look at the current board state and go with what feels right.", "I think a few turns ahead before committing to a move."],
    ["Another player is taking a long turn. What am I doing?", "I watch their move and reassess the board when my turn comes.", "I plan my next move—and a few backup options—in advance."],
    ["In a game with a lot of luck, I...", "Roll with the results and adapt as I go.", "Plan for several possible outcomes, including the worst-case scenario."],
    ["When I can't decide between two moves, I...", "Compare them briefly and pick the one that feels better.", "Calculate the value of each move and choose the most efficient one."],
    ["A surprise event completely wrecks my plan. What do I do?", "Change course and work with the new board state.", "I need a moment to rethink my entire game plan."],
    ["When learning a new game, what do you want to hear about first?", "The setting, story, and who we're playing as.", "The core mechanics and how scoring works."],
    ["Which component upgrade would you rather have?", "Detailed miniatures and chunky metal coins that bring the theme to life.", "A custom insert that makes setup and teardown quick and easy."],
    [
        "What makes you think, “This game is amazing”?",
        "Getting completely immersed in the theme and the story unfolding at the table.",
        "Watching the mechanics come together as my engine or combo kicks off.",
    ],
    ["When playing an abstract strategy game, I...", "Can enjoy it, but I'd rather play something with a strong theme.", "Don't need a theme if the gameplay is good enough."],
    [
        "What are you more likely to say when reviewing a game?",
        "“The theme is so immersive!” The world and presentation stand out to me first.",
        "“That's such a clever design!” The mechanics and systems stand out to me first.",
    ],
    ["Which game are you more excited to play?", "A brand-new game with mechanics and themes I haven't tried before.", "A tried-and-true favorite I already know I love."],
    ["What's your ideal player count for game night?", "One or two—quick turns and a focused battle of wits.", "Three or four—the sweet spot for most games.", "Five or more—the more, the merrier!"],
    ["Your group opens a game nobody has played before. What do you do?", "Hand me the rulebook—I'll learn it and teach everyone.", "Give me the teach and I'll pick it up as we play!"],
];

export const localizeQuestion = (question, language) => {
    if (normalizeLanguage(language) === "kr") return question;

    const translation = englishQuestions[question.id - 1];

    if (!translation) return question;

    return {
        ...question,
        question: translation[0],
        options: question.options.map((option, index) => ({
            ...option,
            text: translation[index + 1],
        })),
    };
};

const englishTags = {
    "#신작_개척자": "#New_Game_Explorer",
    "#검증된_명작파": "#Tried_and_True_Fan",
    "#솔플_혹은_듀오": "#Solo_or_Duo",
    "#정석의_4인팟": "#Four_Player_Sweet_Spot",
    "#텐션폭발_파티": "#The_More_the_Merrier",
    "#룰마스터": "#Rulemaster",
};

export const localizeTag = (tag, language) => (normalizeLanguage(language) === "en" ? englishTags[tag] || tag : tag);
