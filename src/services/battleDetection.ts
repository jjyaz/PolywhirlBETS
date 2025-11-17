export interface BattleDetectionResult {
  playerOne: string | null;
  playerTwo: string | null;
  winner: string | null;
  confidence: number;
  pattern: string;
}

interface DetectionPattern {
  name: string;
  regex: RegExp;
  extract: (match: RegExpMatchArray) => BattleDetectionResult;
  baseConfidence: number;
}

const BATTLE_PATTERNS: DetectionPattern[] = [
  {
    name: 'vs_format_with_winner',
    regex: /(\w+(?:\s+\w+)?)\s+vs\.?\s+(\w+(?:\s+\w+)?)\s*[-–|]\s*[Ww]inner:?\s*(\w+(?:\s+\w+)?)/,
    extract: (match) => ({
      playerOne: match[1]?.trim() || null,
      playerTwo: match[2]?.trim() || null,
      winner: match[3]?.trim() || null,
      confidence: 95,
      pattern: 'vs_format_with_winner',
    }),
    baseConfidence: 95,
  },
  {
    name: 'vs_format',
    regex: /(\w+(?:\s+\w+)?)\s+vs\.?\s+(\w+(?:\s+\w+)?)/i,
    extract: (match) => ({
      playerOne: match[1]?.trim() || null,
      playerTwo: match[2]?.trim() || null,
      winner: null,
      confidence: 85,
      pattern: 'vs_format',
    }),
    baseConfidence: 85,
  },
  {
    name: 'beats_format',
    regex: /(\w+(?:\s+\w+)?)\s+(?:beats?|defeats?|wins?\s+(?:against|over))\s+(\w+(?:\s+\w+)?)/i,
    extract: (match) => ({
      playerOne: match[1]?.trim() || null,
      playerTwo: match[2]?.trim() || null,
      winner: match[1]?.trim() || null,
      confidence: 90,
      pattern: 'beats_format',
    }),
    baseConfidence: 90,
  },
  {
    name: 'winner_declared',
    regex: /[Ww]inner:?\s*[-–]?\s*(\w+(?:\s+\w+)?)/,
    extract: (match) => ({
      playerOne: null,
      playerTwo: null,
      winner: match[1]?.trim() || null,
      confidence: 70,
      pattern: 'winner_declared',
    }),
    baseConfidence: 70,
  },
  {
    name: 'victory_format',
    regex: /(\w+(?:\s+\w+)?)\s+(?:victory|wins?!?)/i,
    extract: (match) => ({
      playerOne: match[1]?.trim() || null,
      playerTwo: null,
      winner: match[1]?.trim() || null,
      confidence: 75,
      pattern: 'victory_format',
    }),
    baseConfidence: 75,
  },
];

export function detectBattleFromTitle(title: string): BattleDetectionResult | null {
  title = title.trim();

  for (const pattern of BATTLE_PATTERNS) {
    const match = title.match(pattern.regex);
    if (match) {
      const result = pattern.extract(match);

      if (result.playerOne && result.playerOne.length > 20) {
        result.confidence -= 20;
      }
      if (result.playerTwo && result.playerTwo.length > 20) {
        result.confidence -= 20;
      }

      if (result.playerOne || result.playerTwo) {
        return result;
      }
    }
  }

  return null;
}

export function detectWinnerFromTitle(
  title: string,
  playerOne: string,
  playerTwo: string
): BattleDetectionResult | null {
  title = title.trim();
  const lowerTitle = title.toLowerCase();
  const p1Lower = playerOne.toLowerCase();
  const p2Lower = playerTwo.toLowerCase();

  const winnerPatterns = [
    {
      regex: new RegExp(`[Ww]inner:?\\s*[-–]?\\s*(${playerOne}|${playerTwo})`, 'i'),
      confidence: 95,
      pattern: 'explicit_winner',
    },
    {
      regex: new RegExp(`(${playerOne}|${playerTwo})\\s+(?:wins?!?|victory|defeats)`, 'i'),
      confidence: 90,
      pattern: 'winner_action',
    },
    {
      regex: new RegExp(`(${playerOne})\\s+(?:beats?|defeats?)\\s+${playerTwo}`, 'i'),
      confidence: 90,
      pattern: 'p1_beats_p2',
    },
    {
      regex: new RegExp(`(${playerTwo})\\s+(?:beats?|defeats?)\\s+${playerOne}`, 'i'),
      confidence: 90,
      pattern: 'p2_beats_p1',
    },
  ];

  for (const pattern of winnerPatterns) {
    const match = title.match(pattern.regex);
    if (match) {
      const detectedWinner = match[1]?.trim();
      return {
        playerOne,
        playerTwo,
        winner: detectedWinner || null,
        confidence: pattern.confidence,
        pattern: pattern.pattern,
      };
    }
  }

  if (lowerTitle.includes(p1Lower) && !lowerTitle.includes(p2Lower)) {
    if (lowerTitle.includes('win') || lowerTitle.includes('victory')) {
      return {
        playerOne,
        playerTwo,
        winner: playerOne,
        confidence: 70,
        pattern: 'single_player_with_win',
      };
    }
  }

  if (lowerTitle.includes(p2Lower) && !lowerTitle.includes(p1Lower)) {
    if (lowerTitle.includes('win') || lowerTitle.includes('victory')) {
      return {
        playerOne,
        playerTwo,
        winner: playerTwo,
        confidence: 70,
        pattern: 'single_player_with_win',
      };
    }
  }

  return null;
}

export function shouldCreateMarket(detection: BattleDetectionResult): boolean {
  return (
    detection.confidence >= 75 &&
    detection.playerOne !== null &&
    detection.playerTwo !== null &&
    detection.playerOne !== detection.playerTwo
  );
}

export function shouldAutoSettle(detection: BattleDetectionResult): boolean {
  return (
    detection.confidence >= 90 &&
    detection.winner !== null &&
    (detection.winner === detection.playerOne || detection.winner === detection.playerTwo)
  );
}

export function needsAdminReview(detection: BattleDetectionResult): boolean {
  return (
    detection.confidence >= 70 &&
    detection.confidence < 90 &&
    detection.winner !== null
  );
}
