import express from 'express';
import xss from 'xss';
import { body, validationResult } from 'express-validator';
import { insert, select } from './db.js';

const { PORT: port = 3000 } = process.env;

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.set('views', './views');
app.set('view engine', 'ejs');

const nationalIdPattern = '^[0-9]{6}-?[0-9]{4}$';

const dateFormat = (data) => {
  const datesArr = [];
  data.forEach((d) => {
    const year = d.signed.getFullYear();
    const month = d.signed.getMonth();
    const day = d.signed.getDate();
    datesArr.push(`${day}, ${month}, ${year}`);
  });
  return datesArr;
};

app.get('/', async (req, res) => {
  const data = await select();

  const formattedDates = dateFormat(data);
  const errorMessages = {};
  const errorTypes = {};

  if (data.length === 0) {
    res.render('index', {
      empty: 'Engar undirskriftir.',
      formattedDates,
      errorMessages,
      errorTypes,
    });
  }
  res.render('index', {
    data,
    empty: false,
    formattedDates,
    errorMessages,
    errorTypes,
  });
});

app.post(
  '/',
  // validation
  body('name').isLength({ min: 1 }).withMessage('Nafn má ekki vera tómt'),
  body('nationalId')
    .isLength({ min: 1 })
    .withMessage('Kennitala má ekki vera tóm'),
  body('nationalId')
    .matches(new RegExp(nationalIdPattern))
    .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((i) => i.msg);
      const errorTypes = errors.array().map((i) => i.param);

      const data = await select();
      const formattedDates = dateFormat(data);

      return res.render('index', {
        data,
        empty: false,
        formattedDates,
        errorMessages,
        errorTypes,
      });
    }

    return next();
  },
  // sanitation
  body('name').trim().escape(),
  body('nationalId').blacklist('-'),

  async (req, res) => {
    const { name, nationalId, comment } = xss(req.body);
    let anonymous = xss(req.body.anonymous);
    if (anonymous === 'on') anonymous = true;
    else anonymous = false;

    await insert(name, nationalId, comment, anonymous);

    const data = await select();
    const formattedDates = dateFormat(data);
    const errorMessages = {};
    const errorTypes = {};

    return res.render('index', {
      data,
      empty: false,
      formattedDates,
      errorMessages,
      errorTypes,
    });
  },
);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
