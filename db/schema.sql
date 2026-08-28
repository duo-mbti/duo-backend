-- MBTI 문항 (2지선다, 지표당 5문항 * 4지표 = 총 20문항)
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  order_no INTEGER NOT NULL UNIQUE,
  dimension VARCHAR(2) NOT NULL CHECK (dimension IN ('EI', 'SN', 'FT', 'PJ')),
  title VARCHAR(50) NOT NULL,
  story_text TEXT NOT NULL,
  option_a_text TEXT NOT NULL,
  option_a_trait CHAR(1) NOT NULL CHECK (option_a_trait IN ('E','I','S','N','F','T','P','J')),
  option_b_text TEXT NOT NULL,
  option_b_trait CHAR(1) NOT NULL CHECK (option_b_trait IN ('E','I','S','N','F','T','P','J')),
  CHECK (option_a_trait <> option_b_trait),
  CHECK (POSITION(option_a_trait IN dimension) > 0),
  CHECK (POSITION(option_b_trait IN dimension) > 0)
);

-- MBTI 16유형 결과 페이지 콘텐츠 (신화 테마)
CREATE TABLE IF NOT EXISTS mbti_types (
  type CHAR(4) PRIMARY KEY CHECK (type ~ '^[EI][SN][FT][PJ]$'),
  title VARCHAR(50) NOT NULL,
  epithet VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  keywords JSONB NOT NULL,
  image_url TEXT
);
