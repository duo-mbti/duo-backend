// 로직설계

// MBTI의 4개 지표. 각 지표마다 5문항씩, 총 20문항.
const DIMENSIONS = [
  ['E', 'I'],
  ['S', 'N'],
  ['F', 'T'],
  ['P', 'J'],
];

const QUESTIONS_PER_DIMENSION = 5;
const VALID_LETTERS = new Set(DIMENSIONS.flat());
const DIMENSION_OF = Object.fromEntries(
  DIMENSIONS.flatMap(([a, b]) => [[a, [a, b]], [b, [a, b]]])
);

/**
 * @param {{ dimension: string, answer: string }[]} answers
 *   - dimension: 'EI' | 'SN' | 'FT' | 'PJ' (문항이 속한 지표)
 *   - answer: 사용자가 고른 선택지에 대응하는 성향 letter (예: 'E' 또는 'I')
 *   총 20개(지표당 5개)가 들어와야 함.
 *
 * @returns {{
 *   mbti: string,
 *   counts: Record<string, number>,
 * }}
 */
function calculateMbti(answers) {
  if (!Array.isArray(answers)) {
    throw new Error('answers는 배열이어야 합니다.');
  }

  const counts = { E: 0, I: 0, S: 0, N: 0, F: 0, T: 0, P: 0, J: 0 };
  const dimensionTally = { EI: 0, SN: 0, FT: 0, PJ: 0 };

  answers.forEach((item, index) => {
    const { dimension, answer } = item ?? {};

    if (!dimensionTally.hasOwnProperty(dimension)) {
      throw new Error(`유효하지 않은 dimension입니다: "${dimension}" (index: ${index})`);
    }
    if (!VALID_LETTERS.has(answer)) {
      throw new Error(`유효하지 않은 answer입니다: "${answer}" (index: ${index})`);
    }
    const [left, right] = DIMENSION_OF[answer];
    if (`${left}${right}` !== dimension) {
      throw new Error(`answer(${answer})가 dimension(${dimension})에 속하지 않습니다. (index: ${index})`);
    }

    counts[answer] += 1;
    dimensionTally[dimension] += 1;
  });

  for (const [dimension, count] of Object.entries(dimensionTally)) {
    if (count !== QUESTIONS_PER_DIMENSION) {
      throw new Error(
        `지표 ${dimension}의 응답 개수가 올바르지 않습니다. (필요: ${QUESTIONS_PER_DIMENSION}, 받음: ${count})`
      );
    }
  }

  let mbti = '';

  for (const [left, right] of DIMENSIONS) {
    const leftCount = counts[left];
    const rightCount = counts[right];


    // 5문항 기준이라 동점(2.5:2.5)은 발생하지 않지만, 방어적으로 왼쪽 우선 처리
    mbti += leftCount >= rightCount ? left : right;
  }

  return { mbti, counts};
}

module.exports = { calculateMbti, DIMENSIONS, QUESTIONS_PER_DIMENSION };
