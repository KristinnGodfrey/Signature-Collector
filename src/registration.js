import express from 'express';
import xss from 'xss';
import { body, validationResult } from 'express-validator';
import { select, insert } from './db.js';

export const router = express.Router();

const nationalIdPattern = '^[0-9]{6}-?[0-9]{4}$';

const dateFormat = (data) => {
  data.forEach((d) => {
    const year = d.signed.getFullYear();
    const month = d.signed.getMonth();
    const day = d.signed.getDate();
    d.signed = (`${day}, ${month}, ${year}`);
  });
  return data;
};

router.get('/', async (req, res) => {
  let data = await select();

  data = dateFormat(data);
  const errorMessages = {};
  const errorTypes = {};

  if (data.length === 0) {
    res.render('index', {
      empty: 'Engar undirskriftir.',
      errorMessages,
      errorTypes,
      title: "Undiskriftarlisti",
    });
  }
  res.render('index', {
    data,
    empty: false,
    errorMessages,
    errorTypes,
    title: "Undiskriftarlisti",
  });
});

router.post('/',
  // validation
  body('name').isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
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

      let data = await select();
      data = dateFormat(data);

      return res.render('index', {
        data,
        empty: false,
        errorMessages,
        errorTypes,
        title: "Undiskriftarlisti",
      });
    }

    return next();
  },
  // sanitation
  body('name').trim().escape(),
  body('nationalId').blacklist('-'),

  async (req, res) => {
    const { name, nationalId, comment } = req.body;
    const safeName = xss(name);
    const safeNationalId = xss(nationalId);
    const safeComment = xss(comment);
    let { anonymous } = req.body;
    if (anonymous === 'on') anonymous = true;
    else anonymous = false;

    await insert(safeName, safeNationalId, safeComment, anonymous);

    let data = await select();
    data = dateFormat(data);
    const errorMessages = {};
    const errorTypes = {};

    return res.render('index', {
      data,
      empty: false,
      errorMessages,
      errorTypes,
      title: "Undiskriftarlisti",
    });
  });