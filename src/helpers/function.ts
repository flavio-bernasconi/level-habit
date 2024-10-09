// Costanti di base
const BASE_POINTS = 10
const INCREMENT_FACTOR = 0.5

// Calcola i punti necessari per un livello specifico
function getPointsForLevel(level: number) {
  return Math.round(BASE_POINTS * (1 + INCREMENT_FACTOR * (level - 1)))
}

// Calcola il totale dei punti necessari fino a un certo livello
export function getTotalPointsUpToLevel(level: number) {
  let total = 0
  for (let i = 1; i <= level; i++) {
    total += getPointsForLevel(i)
  }
  return total
}

// Determina il livello attuale basato sui punti totali
export function getCurrentLevel(totalPoints: number) {
  let level = 1
  let accumulatedPoints = 0

  while (true) {
    const pointsForNextLevel = getPointsForLevel(level)
    if (accumulatedPoints + pointsForNextLevel > totalPoints) {
      break
    }
    accumulatedPoints += pointsForNextLevel
    level++
  }

  return {
    level,
    currentLevelPoints: totalPoints - accumulatedPoints,
    nextLevelPoints: getPointsForLevel(level),
    totalPointsToNextLevel: getTotalPointsUpToLevel(level) - totalPoints
  }
}

// Calcola la percentuale di completamento del livello attuale
export function getLevelProgress(totalPoints: number) {
  const levelInfo = getCurrentLevel(totalPoints)
  return {
    ...levelInfo,
    percentage: Math.round(
      (levelInfo.currentLevelPoints / levelInfo.nextLevelPoints) * 100
    )
  }
}
