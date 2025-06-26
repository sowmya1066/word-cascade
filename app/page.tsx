"use client"

import { useCallback } from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Flame, Award, Timer, Sun, Moon, AlertCircle, Target } from "lucide-react"

// Expanded word database - in a real app, you'd use a word API or larger database
const WORD_DATABASE = {
  TECH: [
    "CODE",
    "DATA",
    "WIFI",
    "CHIP",
    "BYTE",
    "SYNC",
    "HACK",
    "BOOT",
    "LINK",
    "NODE",
    "HTML",
    "JSON",
    "AJAX",
    "CORS",
    "REST",
    "CRUD",
    "SASS",
    "LESS",
    "YARN",
    "GULP",
    "BASH",
    "UNIX",
    "SUDO",
    "GREP",
    "CURL",
    "PING",
    "PORT",
    "HOST",
    "MESH",
    "GRID",
  ],
  FOOD: [
    "CAKE",
    "SOUP",
    "RICE",
    "MEAT",
    "FISH",
    "MILK",
    "EGGS",
    "CORN",
    "BEAN",
    "NUTS",
    "TACO",
    "SODA",
    "WINE",
    "BEER",
    "LIME",
    "MINT",
    "SAGE",
    "DILL",
    "KALE",
    "BEET",
    "PLUM",
    "PEAR",
    "FIGS",
    "OATS",
    "CHIA",
    "TOFU",
    "WRAP",
    "ROLL",
    "BOWL",
    "DISH",
  ],
  NATURE: [
    "TREE",
    "LEAF",
    "WIND",
    "RAIN",
    "SNOW",
    "MOON",
    "STAR",
    "ROCK",
    "SAND",
    "WAVE",
    "LAKE",
    "POND",
    "HILL",
    "PEAK",
    "CAVE",
    "MOSS",
    "FERN",
    "BARK",
    "TWIG",
    "ROOT",
    "DAWN",
    "DUSK",
    "MIST",
    "HAIL",
    "TIDE",
    "REEF",
    "CLAY",
    "SOIL",
    "GLEN",
    "VALE",
  ],
  ANIMALS: [
    "LION",
    "BEAR",
    "WOLF",
    "DEER",
    "BIRD",
    "FISH",
    "FROG",
    "DUCK",
    "HAWK",
    "SEAL",
    "CRAB",
    "CLAM",
    "MOTH",
    "WASP",
    "TICK",
    "MOLE",
    "LYNX",
    "PUMA",
    "IBEX",
    "NEWT",
    "TOAD",
    "SLUG",
    "WORM",
    "LARK",
    "CROW",
    "DOVE",
    "SWAN",
    "GOAT",
    "LAMB",
    "FOAL",
  ],
  COLORS: [
    "BLUE",
    "GOLD",
    "PINK",
    "GRAY",
    "TEAL",
    "LIME",
    "NAVY",
    "RUBY",
    "JADE",
    "ROSE",
    "CYAN",
    "AQUA",
    "PLUM",
    "SAGE",
    "RUST",
    "BUFF",
    "FAWN",
    "DRAB",
    "ECRU",
    "PUCE",
    "MAUVE",
    "OCHRE",
    "UMBER",
    "SEPIA",
    "CORAL",
    "PEACH",
    "IVORY",
    "CREAM",
    "WHEAT",
    "LINEN",
  ],
  COMMON: [
    "TIME",
    "YEAR",
    "WEEK",
    "HOUR",
    "WORK",
    "HOME",
    "LIFE",
    "LOVE",
    "HOPE",
    "FEAR",
    "IDEA",
    "MIND",
    "SOUL",
    "BODY",
    "HAND",
    "FACE",
    "EYES",
    "HAIR",
    "SKIN",
    "BONE",
    "DOOR",
    "WALL",
    "ROOM",
    "DESK",
    "BOOK",
    "PAGE",
    "WORD",
    "LINE",
    "TEXT",
    "NOTE",
  ],
}

// Alternative: Generate more random combinations (though less reliable for real words)
const CONSONANTS = "BCDFGHJKLMNPQRSTVWXYZ"
const VOWELS = "AEIOU"

const generateRandomWord = (): string => {
  // Pattern: CVCC, CCVC, CVCV (C=Consonant, V=Vowel)
  const patterns = ["CVCC", "CCVC", "CVCV", "VCCV"]
  const pattern = patterns[Math.floor(Math.random() * patterns.length)]

  return pattern
    .split("")
    .map((type) => {
      if (type === "C") {
        return CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)]
      } else {
        return VOWELS[Math.floor(Math.random() * VOWELS.length)]
      }
    })
    .join("")
}

interface LetterFeedback {
  letter: string
  status: "correct" | "present" | "absent"
}

interface GuessResult {
  guess: string
  feedback: LetterFeedback[]
}

interface WordPuzzle {
  id: number
  word: string
  category: string
  guesses: GuessResult[]
  completed: boolean
  attempts: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
}

const DAILY_CHALLENGES = {
  0: {
    // Sunday
    name: "🔥 FIRE SUNDAY",
    description: "Blazing hot NATURE words!",
    category: "NATURE",
    bonus: "3x Score",
    timeLimit: 60,
    bgColor: "from-red-600 via-orange-500 to-yellow-400",
    icon: "🌋",
  },
  1: {
    // Monday
    name: "⚡ MEGA MONDAY",
    description: "Supercharged TECH words!",
    category: "TECH",
    bonus: "2.5x Score",
    timeLimit: 60,
    bgColor: "from-blue-600 via-purple-500 to-pink-400",
    icon: "💻",
  },
  2: {
    // Tuesday
    name: "🎯 TARGET TUESDAY",
    description: "Precision COLORS challenge!",
    category: "COLORS",
    bonus: "2x Score",
    timeLimit: 60,
    bgColor: "from-green-500 via-teal-400 to-blue-500",
    icon: "🎨",
  },
  3: {
    // Wednesday
    name: "🚀 WILD WEDNESDAY",
    description: "Untamed ANIMALS words!",
    category: "ANIMALS",
    bonus: "2.5x Score",
    timeLimit: 60,
    bgColor: "from-purple-600 via-pink-500 to-red-400",
    icon: "🦁",
  },
  4: {
    // Thursday
    name: "⚡ THUNDER THURSDAY",
    description: "Lightning fast COMMON words!",
    category: "COMMON",
    bonus: "2x Score",
    timeLimit: 60,
    bgColor: "from-yellow-500 via-orange-400 to-red-500",
    icon: "⚡",
  },
  5: {
    // Friday
    name: "🍕 FEAST FRIDAY",
    description: "Delicious FOOD words!",
    category: "FOOD",
    bonus: "3x Score",
    timeLimit: 60,
    bgColor: "from-orange-500 via-red-400 to-pink-500",
    icon: "🍕",
  },
  6: {
    // Saturday
    name: "💎 SUPER SATURDAY",
    description: "Mixed category MYSTERY!",
    category: "MIXED",
    bonus: "4x Score",
    timeLimit: 60,
    bgColor: "from-indigo-600 via-purple-500 to-pink-400",
    icon: "💎",
  },
}

export default function WordCascadeGame() {
  const [puzzles, setPuzzles] = useState<WordPuzzle[]>([])
  const [currentGuess, setCurrentGuess] = useState("")
  const [activePuzzleId, setActivePuzzleId] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [gameActive, setGameActive] = useState(false)
  const [level, setLevel] = useState(1)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [useRandomWords, setUseRandomWords] = useState(false)
  const [hintUsed, setHintUsed] = useState(false)
  const [gameMode, setGameMode] = useState<"classic" | "lightning" | "chain" | "battle">("classic")
  const [streak, setStreak] = useState(0)
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: "first_win", name: "First Victory", description: "Complete your first puzzle", icon: "🏆", unlocked: false },
    {
      id: "speed_demon",
      name: "Speed Demon",
      description: "Complete a puzzle in under 30 seconds",
      icon: "⚡",
      unlocked: false,
    },
    {
      id: "perfect_level",
      name: "Perfectionist",
      description: "Complete all puzzles in a level",
      icon: "💎",
      unlocked: false,
    },
    { id: "streak_5", name: "Hot Streak", description: "Get 5 correct guesses in a row", icon: "🔥", unlocked: false },
  ])
  const [dailyChallenge, setDailyChallenge] = useState(() => {
    const today = new Date().getDay()
    return DAILY_CHALLENGES[today as keyof typeof DAILY_CHALLENGES]
  })
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(() => {
    // Check if challenge was completed today
    const today = new Date().toDateString()
    const completedDate = localStorage.getItem("dailyChallengeCompletedDate")
    return completedDate === today
  })
  const [isDailyChallengeMode, setIsDailyChallengeMode] = useState(false)

  // Check if it's a new day and reset daily challenge
  useEffect(() => {
    const today = new Date().toDateString()
    const completedDate = localStorage.getItem("dailyChallengeCompletedDate")

    if (completedDate && completedDate !== today) {
      setDailyChallengeCompleted(false)
      localStorage.removeItem("dailyChallengeCompletedDate")
    }

    // Update daily challenge for new day
    const todayChallenge = DAILY_CHALLENGES[new Date().getDay() as keyof typeof DAILY_CHALLENGES]
    setDailyChallenge(todayChallenge)
  }, [])

  const checkAchievements = useCallback((type: string, data?: any) => {
    setAchievements((prev) =>
      prev.map((achievement) => {
        if (achievement.unlocked) return achievement

        switch (achievement.id) {
          case "first_win":
            if (type === "puzzle_completed") {
              return { ...achievement, unlocked: true }
            }
            break
          case "speed_demon":
            if (type === "puzzle_completed" && data?.timeLeft > 270) {
              // Completed in under 30 seconds
              return { ...achievement, unlocked: true }
            }
            break
          case "perfect_level":
            if (type === "level_completed" && data?.perfectLevel) {
              return { ...achievement, unlocked: true }
            }
            break
          case "streak_5":
            if (type === "streak" && data?.streak >= 5) {
              return { ...achievement, unlocked: true }
            }
            break
        }
        return achievement
      }),
    )
  }, [])

  const generatePuzzles = (count: number) => {
    const newPuzzles: WordPuzzle[] = []

    for (let i = 0; i < count; i++) {
      let word: string
      let category: string

      if (useRandomWords) {
        // Generate random word (may not be real English words)
        word = generateRandomWord()
        category = "RANDOM"
      } else {
        // Use curated word database (recommended for real games)
        const categories = Object.keys(WORD_DATABASE)
        category = categories[Math.floor(Math.random() * categories.length)]
        const words = WORD_DATABASE[category as keyof typeof WORD_DATABASE]
        word = words[Math.floor(Math.random() * words.length)]
      }

      newPuzzles.push({
        id: i,
        word,
        category,
        guesses: [],
        completed: false,
        attempts: gameMode === "lightning" ? 3 : 6, // Lightning mode has fewer attempts
      })
    }

    return newPuzzles
  }

  const startDailyChallenge = () => {
    let word: string
    let category: string = dailyChallenge.category

    if (category === "MIXED") {
      // Random category for Saturday
      const categories = Object.keys(WORD_DATABASE)
      category = categories[Math.floor(Math.random() * categories.length)]
    }

    const words = WORD_DATABASE[category as keyof typeof WORD_DATABASE]
    word = words[Math.floor(Math.random() * words.length)]

    const dailyPuzzle: WordPuzzle = {
      id: 0,
      word,
      category,
      guesses: [],
      completed: false,
      attempts: 6,
    }

    setPuzzles([dailyPuzzle])
    setActivePuzzleId(0)
    setGameActive(true)
    setTimeLeft(dailyChallenge.timeLimit)
    setScore(0)
    setHintUsed(false)
    setStreak(0)
    setIsDailyChallengeMode(true)
  }

  const startGame = () => {
    let puzzleCount: number
    let timeLimit: number

    switch (gameMode) {
      case "lightning":
        puzzleCount = Math.min(4 + level, 8) // Increases from 5 to 8 puzzles
        timeLimit = Math.max(90, 150 - level * 10) // Decreases from 150s to 90s
        break
      case "chain":
        puzzleCount = Math.min(3 + level, 7) // Increases from 4 to 7 puzzles
        timeLimit = Math.max(180, 270 - level * 15) // Decreases from 270s to 180s
        break
      case "battle":
        puzzleCount = Math.min(2 + level, 6) // Increases from 3 to 6 puzzles
        timeLimit = Math.max(120, 210 - level * 15) // Decreases from 210s to 120s
        break
      default: // classic
        puzzleCount = Math.min(3 + level, 6)
        timeLimit = 300 // 5 minutes
    }

    setPuzzles(generatePuzzles(puzzleCount))
    setActivePuzzleId(0)
    setGameActive(true)
    setTimeLeft(timeLimit)
    setScore(0)
    setHintUsed(false)
    setStreak(0)
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameActive, timeLeft])

  // Check if all puzzles are done
  useEffect(() => {
    if (gameActive && puzzles.length > 0) {
      const allPuzzlesDone = puzzles.every((p) => p.completed || p.attempts <= 0)
      if (allPuzzlesDone) {
        const completedPuzzles = puzzles.filter((p) => p.completed).length
        const perfectLevel = completedPuzzles === puzzles.length
        checkAchievements("level_completed", { perfectLevel })
        setGameActive(false)
      }
    }
  }, [puzzles, gameActive, checkAchievements])

  const calculateFeedback = (guess: string, target: string): LetterFeedback[] => {
    const guessArray = guess.toUpperCase().split("")
    const targetArray = target.split("")
    const feedback: LetterFeedback[] = []
    const targetUsed = new Array(4).fill(false)

    // First pass: mark greens
    for (let i = 0; i < 4; i++) {
      if (guessArray[i] === targetArray[i]) {
        feedback[i] = { letter: guessArray[i], status: "correct" }
        targetUsed[i] = true
      } else {
        feedback[i] = { letter: guessArray[i], status: "absent" }
      }
    }

    // Second pass: mark yellows
    for (let i = 0; i < 4; i++) {
      if (feedback[i].status === "absent") {
        for (let j = 0; j < 4; j++) {
          if (!targetUsed[j] && guessArray[i] === targetArray[j]) {
            feedback[i].status = "present"
            targetUsed[j] = true
            break
          }
        }
      }
    }

    return feedback
  }

  const handleSubmitGuess = () => {
    if (currentGuess.length !== 4 || activePuzzleId === null) return

    const puzzle = puzzles[activePuzzleId]
    if (!puzzle || puzzle.completed || puzzle.attempts <= 0) return

    const guess = currentGuess.toUpperCase()
    const feedback = calculateFeedback(guess, puzzle.word)
    const isCorrect = feedback.every((f) => f.status === "correct")

    const newGuess: GuessResult = { guess, feedback }

    setPuzzles((prev) =>
      prev.map((p) => {
        if (p.id === activePuzzleId) {
          const updatedPuzzle = {
            ...p,
            guesses: [...p.guesses, newGuess],
            attempts: p.attempts - 1,
            completed: isCorrect,
          }
          return updatedPuzzle
        }
        return p
      }),
    )

    if (isCorrect) {
      // Calculate score with mode multipliers
      let baseScore = 100
      const attemptBonus = puzzle.attempts * 10
      const timeBonus = Math.floor(timeLeft / 10)

      // Mode multipliers
      if (isDailyChallengeMode) {
        baseScore *= Number.parseFloat(dailyChallenge.bonus.replace("x Score", ""))
      } else {
        switch (gameMode) {
          case "lightning":
            baseScore *= 1.5
            break
          case "chain":
            baseScore *= 1.3
            break
          case "battle":
            baseScore *= 2
            break
        }
      }

      const totalScore = baseScore + attemptBonus + timeBonus
      setScore((prev) => prev + totalScore)

      // Update streak
      setStreak((prev) => {
        const newStreak = prev + 1
        checkAchievements("streak", { streak: newStreak })
        return newStreak
      })

      // Check achievements
      checkAchievements("puzzle_completed", { timeLeft })

      // Mark daily challenge as completed with today's date
      if (isDailyChallengeMode) {
        const today = new Date().toDateString()
        localStorage.setItem("dailyChallengeCompletedDate", today)
        setDailyChallengeCompleted(true)
      }
    } else {
      setStreak(0) // Reset streak on wrong guess
    }

    setCurrentGuess("")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const completedPuzzles = puzzles.filter((p) => p.completed).length
  const totalPuzzles = puzzles.length

  // Theme classes
  const themeClasses = {
    background: isDarkTheme
      ? "bg-gradient-to-br from-gray-900 via-black to-gray-800"
      : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
    card: isDarkTheme ? "bg-black/40 border-gray-600/30 backdrop-blur" : "bg-white/80 border-blue-300/50 backdrop-blur",
    text: isDarkTheme ? "text-white" : "text-gray-900",
    textSecondary: isDarkTheme ? "text-gray-300" : "text-gray-600",
    input: isDarkTheme ? "bg-black/30 border-gray-500/50 text-white" : "bg-white/50 border-blue-300/50 text-gray-900",
    puzzleCard: isDarkTheme
      ? "bg-black/50 border-gray-600/30 backdrop-blur"
      : "bg-white/70 border-blue-300/40 backdrop-blur",
  }

  const getModeDescription = (mode: string) => {
    switch (mode) {
      case "lightning":
        return `⚡ ${Math.min(4 + level, 8)} puzzles, ${Math.max(90, 150 - level * 10)}s, 3 attempts each - 1.5x score!`
      case "chain":
        return `🔗 ${Math.min(3 + level, 7)} connected puzzles, ${Math.max(180, 270 - level * 15)}s - 1.3x score!`
      case "battle":
        return `⚔️ ${Math.min(2 + level, 6)} puzzles, ${Math.max(120, 210 - level * 15)}s, compete with others - 2x score!`
      default:
        return "🎯 Classic mode with increasing difficulty"
    }
  }

  return (
    <div className={`min-h-screen p-4 ${themeClasses.background}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header with Theme Toggle */}
        <div className="text-center mb-6">
          <div className="flex justify-between items-center mb-4">
            <div></div> {/* Spacer */}
            <h1 className={`text-4xl font-bold mb-2 flex items-center justify-center gap-2 ${themeClasses.text}`}>
              <Flame className="w-8 h-8 text-orange-400" />
              Word Cascade
              <Flame className="w-8 h-8 text-orange-400" />
            </h1>
            <Button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              variant="outline"
              size="sm"
              className={`${isDarkTheme ? "bg-black/20 border-yellow-500/50 text-yellow-300" : "bg-white/50 border-gray-300 text-gray-700"}`}
            >
              {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
          <p className={themeClasses.textSecondary}>Solve multiple word puzzles simultaneously!</p>
        </div>

        {!gameActive && puzzles.length === 0 ? (
          /* Start Screen */
          <div className="space-y-6">
            {/* Daily Challenge Banner - ENHANCED */}
            <Card
              className={`max-w-md mx-auto border-2 transition-all duration-300 ${
                dailyChallengeCompleted ? "opacity-75 cursor-not-allowed" : "cursor-pointer transform hover:scale-105"
              } ${
                isDarkTheme
                  ? "bg-gradient-to-r " + dailyChallenge.bgColor + " border-yellow-400/70"
                  : "bg-gradient-to-r " + dailyChallenge.bgColor + " border-yellow-600/70"
              }`}
              onClick={dailyChallengeCompleted ? undefined : () => startDailyChallenge()}
            >
              <CardContent className="text-center p-6 relative overflow-hidden">
                {/* Fire animation background */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-transparent via-yellow-300/30 to-red-400/30 animate-pulse"></div>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className={`text-2xl ${dailyChallengeCompleted ? "" : "animate-bounce"}`}>
                      {dailyChallengeCompleted ? "✅" : dailyChallenge.icon}
                    </div>
                    <h3 className="font-bold text-white text-lg drop-shadow-lg">{dailyChallenge.name}</h3>
                    <div className={`text-2xl ${dailyChallengeCompleted ? "" : "animate-bounce"}`}>
                      {dailyChallengeCompleted ? "✅" : dailyChallenge.icon}
                    </div>
                  </div>

                  <p className="text-white/90 text-sm mb-2 drop-shadow">{dailyChallenge.description}</p>
                  <p className="text-white/80 text-xs mb-3">
                    ⏱️ 60 seconds • Single puzzle • {dailyChallenge.category} category
                  </p>

                  <div className="flex justify-center items-center gap-2 mb-3">
                    <Badge className="bg-yellow-500 text-black font-bold px-3 py-1 animate-pulse">
                      {dailyChallenge.bonus}
                    </Badge>
                    {dailyChallengeCompleted && (
                      <Badge className="bg-green-500 text-white font-bold px-3 py-1">✅ COMPLETED TODAY</Badge>
                    )}
                  </div>

                  <div className="text-white/90 text-sm font-bold">
                    {dailyChallengeCompleted ? (
                      <div>
                        <div className="mb-2">🎉 CHALLENGE COMPLETED! 🎉</div>
                        <div className="text-xs opacity-75">Come back tomorrow for a new challenge</div>
                      </div>
                    ) : (
                      <div className="animate-pulse">🔥 CLICK TO START 🔥</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Mode Selection */}
            <Card className={`max-w-md mx-auto ${themeClasses.card}`}>
              <CardContent className="p-6">
                <h3 className={`text-lg font-bold mb-4 text-center ${themeClasses.text}`}>Choose Game Mode</h3>
                <div className="space-y-3">
                  {["classic", "lightning", "chain", "battle"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setGameMode(mode as any)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        gameMode === mode
                          ? "border-blue-400 bg-blue-600/20"
                          : `border-gray-400 ${isDarkTheme ? "bg-gray-600/10 hover:bg-gray-600/20" : "bg-gray-100/50 hover:bg-gray-200/50"}`
                      }`}
                    >
                      <div className={`font-semibold ${themeClasses.text} capitalize mb-1`}>
                        {mode === "classic" && "🎯"} {mode === "lightning" && "⚡"} {mode === "chain" && "🔗"}{" "}
                        {mode === "battle" && "⚔️"} {mode}
                      </div>
                      <div className={`text-xs ${themeClasses.textSecondary}`}>{getModeDescription(mode)}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Main Start Card */}
            <Card className={`max-w-md mx-auto ${themeClasses.card}`}>
              <CardContent className="text-center p-8">
                <div className="mb-6">
                  <div className="text-6xl mb-4">🎯</div>
                  <h2 className={`text-2xl font-bold mb-2 ${themeClasses.text}`}>Level {level}</h2>
                  <p className={`${themeClasses.textSecondary} mb-4`}>{getModeDescription(gameMode)}</p>
                  <div className={`text-sm ${themeClasses.textSecondary} mb-4`}>
                    Level {level} Difficulty:
                    {gameMode === "lightning" &&
                      ` ${Math.min(4 + level, 8)} puzzles in ${Math.max(90, 150 - level * 10)}s`}
                    {gameMode === "chain" &&
                      ` ${Math.min(3 + level, 7)} puzzles in ${Math.max(180, 270 - level * 15)}s`}
                    {gameMode === "battle" &&
                      ` ${Math.min(2 + level, 6)} puzzles in ${Math.max(120, 210 - level * 15)}s`}
                    {gameMode === "classic" && ` ${Math.min(3 + level, 6)} puzzles in 5 minutes`}
                  </div>
                  <div className={`flex justify-center gap-4 text-sm ${themeClasses.textSecondary} mb-4`}>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      Score: {score}
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      Streak: {streak}
                    </div>
                  </div>
                </div>

                {/* Word Generation Options */}
                <div className="mb-6 space-y-3">
                  <div className={`text-sm ${themeClasses.textSecondary}`}>Word Generation:</div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => setUseRandomWords(false)}
                      variant={!useRandomWords ? "default" : "outline"}
                      size="sm"
                      className={!useRandomWords ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      Curated Words
                    </Button>
                    <Button
                      onClick={() => setUseRandomWords(true)}
                      variant={useRandomWords ? "default" : "outline"}
                      size="sm"
                      className={useRandomWords ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                      Random Words
                    </Button>
                  </div>
                </div>

                <Button onClick={startGame} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                  Start {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} Mode
                </Button>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className={`max-w-md mx-auto ${themeClasses.card}`}>
              <CardContent className="p-4">
                <h3 className={`text-lg font-bold mb-3 text-center ${themeClasses.text}`}>Achievements</h3>
                <div className="grid grid-cols-2 gap-2">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-2 rounded-lg border text-center ${
                        achievement.unlocked
                          ? "border-yellow-400 bg-yellow-600/20"
                          : `border-gray-400 ${isDarkTheme ? "bg-gray-600/10" : "bg-gray-100/50"}`
                      }`}
                    >
                      <div className="text-lg mb-1">{achievement.icon}</div>
                      <div className={`text-xs font-semibold ${themeClasses.text}`}>{achievement.name}</div>
                      <div className={`text-xs ${themeClasses.textSecondary}`}>{achievement.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : !gameActive && puzzles.length > 0 ? (
          /* Results Screen */
          <Card className={`max-w-md mx-auto ${themeClasses.card}`}>
            <CardContent className="text-center p-8">
              <div className="mb-6">
                {completedPuzzles === totalPuzzles ? (
                  <>
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className={`text-2xl font-bold mb-2 ${themeClasses.text} text-green-400`}>
                      Perfect! {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} Complete!
                    </h2>
                    <p className={`${themeClasses.textSecondary} mb-4`}>You solved all {totalPuzzles} puzzles!</p>
                  </>
                ) : completedPuzzles > 0 ? (
                  <>
                    <div className="text-6xl mb-4">👏</div>
                    <h2 className={`text-2xl font-bold mb-2 ${themeClasses.text} text-yellow-400`}>
                      Good Job! {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} Complete
                    </h2>
                    <p className={`${themeClasses.textSecondary} mb-4`}>
                      You solved {completedPuzzles} out of {totalPuzzles} puzzles
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">😔</div>
                    <h2 className={`text-2xl font-bold mb-2 ${themeClasses.text} text-red-400`}>
                      {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} Failed
                    </h2>
                    <p className={`${themeClasses.textSecondary} mb-4`}>No puzzles completed. Try again!</p>
                  </>
                )}

                <div className={`grid grid-cols-3 gap-4 text-sm ${themeClasses.textSecondary} mb-6`}>
                  <div className="flex items-center justify-center gap-1">
                    <Trophy className="w-4 h-4 text-green-400" />
                    <span>Completed: {completedPuzzles}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span>Failed: {totalPuzzles - completedPuzzles}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Award className="w-4 h-4 text-blue-400" />
                    <span>Score: {score}</span>
                  </div>
                </div>

                {/* Show newly unlocked achievements */}
                {achievements.filter((a) => a.unlocked).length > 0 && (
                  <div className="mb-4">
                    <h4 className={`text-sm font-bold ${themeClasses.text} mb-2`}>🏆 Achievements Unlocked!</h4>
                    <div className="flex justify-center gap-2">
                      {achievements
                        .filter((a) => a.unlocked)
                        .slice(-2)
                        .map((achievement) => (
                          <div key={achievement.id} className="text-center">
                            <div className="text-2xl">{achievement.icon}</div>
                            <div className={`text-xs ${themeClasses.textSecondary}`}>{achievement.name}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Daily Challenge Completion */}
                {isDailyChallengeMode && (
                  <div className="mb-4">
                    <div className={`p-4 rounded-lg border-2 bg-gradient-to-r ${dailyChallenge.bgColor}`}>
                      <h4 className="text-lg font-bold text-white text-center mb-2 drop-shadow-lg">
                        🔥 {dailyChallenge.name} COMPLETE! 🔥
                      </h4>
                      <div className="text-center text-white/90 text-sm">
                        <p>Category: {puzzles[0]?.category}</p>
                        <p>Bonus Applied: {dailyChallenge.bonus}</p>
                        <p className="font-bold mt-2">Come back tomorrow for a new challenge!</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {!isDailyChallengeMode && completedPuzzles >= Math.ceil(totalPuzzles / 2) ? (
                  <Button
                    onClick={() => {
                      setLevel((prev) => prev + 1)
                      setPuzzles([])
                      setActivePuzzleId(null)
                    }}
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Next Level ({level + 1}) - {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)}
                  </Button>
                ) : null}

                {!isDailyChallengeMode && (
                  <Button
                    onClick={() => {
                      setPuzzles([])
                      setActivePuzzleId(null)
                    }}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    Play Again
                  </Button>
                )}

                <Button
                  onClick={() => {
                    setPuzzles([])
                    setActivePuzzleId(null)
                    setLevel(1)
                    setScore(0)
                    setIsDailyChallengeMode(false)
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Back to Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Game Screen */
          <div className="space-y-6">
            {/* Game Stats */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <Badge className="bg-blue-600 text-white px-4 py-2">
                <Timer className="w-4 h-4 mr-1" />
                {formatTime(timeLeft)}
              </Badge>
              <Badge className="bg-green-600 text-white px-4 py-2">
                <Award className="w-4 h-4 mr-1" />
                Score: {score}
              </Badge>
              <Badge className="bg-orange-600 text-white px-4 py-2">
                <Flame className="w-4 h-4 mr-1" />
                Streak: {streak}
              </Badge>
              <Badge
                className={`text-white px-4 py-2 ${
                  isDailyChallengeMode ? `bg-gradient-to-r ${dailyChallenge.bgColor}` : "bg-purple-600"
                }`}
              >
                <Target className="w-4 h-4 mr-1" />
                {isDailyChallengeMode
                  ? dailyChallenge.name.split(" ")[1] // Gets "SUNDAY", "MONDAY", etc.
                  : gameMode.charAt(0).toUpperCase() + gameMode.slice(1)}
              </Badge>
            </div>

            {/* Progress */}
            <div className="max-w-md mx-auto">
              <div className={`flex justify-between text-sm mb-2 ${themeClasses.text}`}>
                <span>Progress</span>
                <span>
                  {completedPuzzles}/{totalPuzzles}
                </span>
              </div>
              <Progress value={(completedPuzzles / totalPuzzles) * 100} className="h-3" />
            </div>

            {/* Power-ups */}
            <div className="flex justify-center gap-2 flex-wrap">
              {!hintUsed && activePuzzleId !== null && (
                <Button
                  onClick={() => {
                    const puzzle = puzzles[activePuzzleId]
                    if (puzzle) {
                      alert(`Hint: The word contains the letter "${puzzle.word[0]}" in position 1`)
                      setHintUsed(true)
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className={`${
                    isDarkTheme
                      ? "bg-black/20 border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
                      : "bg-white/50 border-yellow-600/50 text-yellow-700 hover:bg-yellow-100/50"
                  }`}
                >
                  <Star className="w-4 h-4" />
                  Reveal Letter
                </Button>
              )}
            </div>

            {/* Input */}
            <div className="max-w-md mx-auto space-y-2">
              <Input
                value={currentGuess}
                onChange={(e) =>
                  setCurrentGuess(
                    e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z]/g, "")
                      .slice(0, 4),
                  )
                }
                onKeyPress={(e) => e.key === "Enter" && handleSubmitGuess()}
                placeholder="Enter 4-letter word"
                className={`text-center text-lg font-mono tracking-wider ${themeClasses.input}`}
                maxLength={4}
              />
              <Button
                onClick={handleSubmitGuess}
                disabled={currentGuess.length !== 4}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Submit Guess
              </Button>
            </div>

            {/* Mobile-Optimized Single Puzzle View */}
            <div className="max-w-md mx-auto">
              {/* Puzzle Navigation */}
              <div className="flex justify-center mb-4 gap-1 overflow-x-auto pb-2">
                {puzzles.map((puzzle) => (
                  <button
                    key={puzzle.id}
                    onClick={() => setActivePuzzleId(puzzle.id)}
                    className={`flex-shrink-0 w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all ${
                      activePuzzleId === puzzle.id
                        ? "border-blue-400 bg-blue-600 text-white"
                        : puzzle.completed
                          ? "border-green-400 bg-green-600 text-white cursor-pointer hover:bg-green-500"
                          : puzzle.attempts <= 0
                            ? "border-red-400 bg-red-600 text-white cursor-pointer hover:bg-red-500"
                            : puzzle.attempts <= 2
                              ? "border-red-400 bg-red-600/20 text-red-300"
                              : `border-gray-400 ${isDarkTheme ? "bg-gray-600/20 text-gray-300" : "bg-gray-200/50 text-gray-600"}`
                    }`}
                  >
                    {puzzle.completed ? (
                      <Trophy className="w-5 h-5" />
                    ) : puzzle.attempts <= 0 ? (
                      <div className="text-center">
                        <div className="text-xs">✗</div>
                        <div className="text-xs">{puzzle.id + 1}</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-xs">{puzzle.id + 1}</div>
                        <div className="text-xs">{puzzle.attempts}</div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Active Puzzle Display */}
              {activePuzzleId !== null && (
                <Card className={themeClasses.puzzleCard}>
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className={themeClasses.text}>Puzzle {activePuzzleId + 1}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600">{puzzles[activePuzzleId]?.attempts} attempts left</Badge>
                        {puzzles[activePuzzleId]?.completed && <Trophy className="w-5 h-5 text-yellow-400" />}
                      </div>
                    </div>
                    <p className={`${themeClasses.textSecondary} text-sm`}>
                      Category: {puzzles[activePuzzleId]?.category || "Unknown"}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Current Puzzle Grid */}
                    <div className="space-y-2">
                      {/* Show previous guesses */}
                      {puzzles[activePuzzleId]?.guesses.map((guess, index) => (
                        <div key={index} className="flex gap-2 justify-center">
                          {guess.feedback.map((letter, letterIndex) => (
                            <div
                              key={letterIndex}
                              className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-white text-lg border-2 ${
                                letter.status === "correct"
                                  ? "bg-green-500 border-green-400"
                                  : letter.status === "present"
                                    ? "bg-yellow-500 border-yellow-400"
                                    : "bg-gray-500 border-gray-400"
                              }`}
                            >
                              {letter.letter}
                            </div>
                          ))}
                        </div>
                      ))}

                      {/* Current guess preview */}
                      {!puzzles[activePuzzleId]?.completed && puzzles[activePuzzleId]?.attempts > 0 && (
                        <div className="flex gap-2 justify-center">
                          {Array.from({ length: 4 }, (_, letterIndex) => (
                            <div
                              key={letterIndex}
                              className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 border-blue-400 font-bold text-lg ${
                                isDarkTheme ? "bg-blue-900/30 text-white" : "bg-blue-100/50 text-gray-900"
                              }`}
                            >
                              {currentGuess[letterIndex] || ""}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Empty rows */}
                      {!puzzles[activePuzzleId]?.completed &&
                        puzzles[activePuzzleId]?.attempts > 0 &&
                        Array.from(
                          {
                            length: Math.max(
                              0,
                              (gameMode === "lightning" ? 2 : 5) - (puzzles[activePuzzleId]?.guesses.length || 0),
                            ),
                          },
                          (_, index) => (
                            <div key={`empty-${index}`} className="flex gap-2 justify-center">
                              {Array.from({ length: 4 }, (_, letterIndex) => (
                                <div
                                  key={letterIndex}
                                  className={`w-12 h-12 border-2 rounded-lg ${
                                    isDarkTheme ? "border-gray-600 bg-gray-800/30" : "border-gray-300 bg-gray-100/30"
                                  }`}
                                />
                              ))}
                            </div>
                          ),
                        )}
                    </div>

                    {/* Puzzle completed message */}
                    {puzzles[activePuzzleId]?.completed && (
                      <div
                        className={`text-center p-4 rounded-lg border ${
                          isDarkTheme ? "bg-green-900/30 border-green-500/50" : "bg-green-100/50 border-green-300/50"
                        }`}
                      >
                        <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                        <p className={`font-semibold ${isDarkTheme ? "text-green-300" : "text-green-700"}`}>
                          Puzzle Completed! ✅
                        </p>
                        <p className={`text-sm ${isDarkTheme ? "text-green-200" : "text-green-600"}`}>
                          Answer: <span className="font-mono font-bold">{puzzles[activePuzzleId]?.word}</span>
                        </p>
                        <p className={`text-xs ${isDarkTheme ? "text-green-200" : "text-green-600"}`}>
                          Solved in {(gameMode === "lightning" ? 3 : 6) - puzzles[activePuzzleId]?.attempts} attempts
                        </p>
                      </div>
                    )}

                    {/* Puzzle failed message */}
                    {puzzles[activePuzzleId]?.attempts <= 0 && !puzzles[activePuzzleId]?.completed && (
                      <div
                        className={`text-center p-4 rounded-lg border ${
                          isDarkTheme ? "bg-red-900/30 border-red-500/50" : "bg-red-100/50 border-red-300/50"
                        }`}
                      >
                        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <p className={`font-semibold ${isDarkTheme ? "text-red-300" : "text-red-700"}`}>Failed ❌</p>
                        <p className={`text-sm ${isDarkTheme ? "text-red-200" : "text-red-600"}`}>
                          Answer was: <span className="font-mono font-bold">{puzzles[activePuzzleId]?.word}</span>
                        </p>
                      </div>
                    )}

                    {/* Navigation buttons for mobile */}
                    <div className="flex justify-between pt-4">
                      <Button
                        onClick={() => {
                          const currentIndex = puzzles.findIndex((p) => p.id === activePuzzleId)
                          if (currentIndex > 0) {
                            setActivePuzzleId(puzzles[currentIndex - 1].id)
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className={`${
                          isDarkTheme
                            ? "bg-black/20 border-gray-500/50 text-gray-300"
                            : "bg-white/50 border-gray-300 text-gray-600"
                        }`}
                        disabled={puzzles.findIndex((p) => p.id === activePuzzleId) === 0}
                      >
                        ← Previous
                      </Button>

                      <Button
                        onClick={() => {
                          const currentIndex = puzzles.findIndex((p) => p.id === activePuzzleId)
                          if (currentIndex < puzzles.length - 1) {
                            setActivePuzzleId(puzzles[currentIndex + 1].id)
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className={`${
                          isDarkTheme
                            ? "bg-black/20 border-gray-500/50 text-gray-300"
                            : "bg-white/50 border-gray-300 text-gray-600"
                        }`}
                        disabled={puzzles.findIndex((p) => p.id === activePuzzleId) === puzzles.length - 1}
                      >
                        Next →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
