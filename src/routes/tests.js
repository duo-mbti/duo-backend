const express = require('express');
const pool = require('../db');
const { calculateMbti } = require('../scoring');

const router = express.Router();

// GET /tests/questions - 20문항 목록 조회 (trait은 노출하지 않음)
router.get('/questions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, order_no, dimension, story_text, option_a_text, option_b_text
       FROM questions
       ORDER BY order_no`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '문항을 불러오지 못했습니다.' });
  }
});

// POST /tests/submit - 답변 제출 및 채점
// body: { answers: [{ questionId: number, choice: 'a' | 'b' }, ...] } (20개)
router.post('/submit', async (req, res) => {
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length !== 20) {
    return res.status(400).json({ error: 'answers는 20개의 항목을 가진 배열이어야 합니다.' });
  }

  try {
    const questionIds = answers.map((a) => a.questionId);
    const result = await pool.query(
      `SELECT id, dimension, option_a_trait, option_b_trait
       FROM questions
       WHERE id = ANY($1)`,
      [questionIds]
    );
    const questionMap = new Map(result.rows.map((q) => [q.id, q]));

    const scoringInput = answers.map(({ questionId, choice }) => {
      const question = questionMap.get(questionId);
      if (!question) {
        throw new Error(`존재하지 않는 문항입니다: ${questionId}`);
      }
      const trait = choice === 'a' ? question.option_a_trait : choice === 'b' ? question.option_b_trait : null;
      if (!trait) {
        throw new Error(`choice는 'a' 또는 'b'여야 합니다. (questionId: ${questionId})`);
      }
      return { dimension: question.dimension, answer: trait };
    });

    const { mbti, counts } = calculateMbti(scoringInput);
    res.json({ mbti, counts });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /tests/result/:mbti - MBTI 유형별 결과 페이지 콘텐츠 조회
router.get('/result/:mbti', async (req, res) => {
  const mbti = req.params.mbti.toUpperCase();

  if (!/^[EI][SN][FT][PJ]$/.test(mbti)) {
    return res.status(400).json({ error: '유효하지 않은 MBTI 유형입니다.' });
  }

  try {
    const result = await pool.query(
      `SELECT type, title, description, image_url
       FROM mbti_types
       WHERE type = $1`,
      [mbti]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '해당 유형의 콘텐츠를 찾을 수 없습니다.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '결과를 불러오지 못했습니다.' });
  }
});

module.exports = router;
