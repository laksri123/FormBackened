import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db.js';

const router = express.Router();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });


router.get('/sections', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sections');
    console.log("result isss=>", result)
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});


router.get('/subsections/:sectionId', async (req, res) => {
  try {
    const { sectionId } = req.params;
    const result = await pool.query(
      'SELECT * FROM subsections WHERE section_id = $1',
      [sectionId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subsections' });
  }
});


router.post('/submit', upload.array('images'), async (req, res) => {
  const { section_id, subsection_id, question_text, type, options } = req.body;

  try {
    const parsedOptions = JSON.parse(options); // options = JSON.stringify([...])

    const questionRes = await pool.query(
      'INSERT INTO questions(section_id, subsection_id, question_text, type) VALUES ($1, $2, $3, $4) RETURNING id',
      [section_id, subsection_id, question_text, type]
    );

    const questionId = questionRes.rows[0].id;

    for (let i = 0; i < parsedOptions.length; i++) {
      const imagePath = req.files[i] ? req.files[i].filename : null;
      await pool.query(
        'INSERT INTO options(question_id, option_text, marks, image) VALUES ($1, $2, $3, $4)',
        [questionId, parsedOptions[i].option, parsedOptions[i].marks, imagePath]
      );
    }

    res.status(200).json({ success: true, message: 'Form submitted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
