import express from 'express';
import xss from 'xss';
import { insert, select }  from './db.js';
import { body, sanitize, validationResult } from 'express-validator';

const {   
  PORT: port = 3000,
} = process.env;

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.set('views', './views');
app.set('view engine', 'ejs');

const nationalIdPattern = '^[0-9]{6}-?[0-9]{4}$';

let dateFormat = (data) => {
  let datesArr = []
  data.forEach(d => {
    let year = d.signed.getFullYear();
    let month = d.signed.getMonth();
    let day = d.signed.getDate();
    datesArr.push(`${day}, ${month}, ${year}`);
  })
  return datesArr;
};

let checkFormErrs = (name, nationalId, comment) => {
  const nationalIdPattern = '^[0-9]{6}-?[0-9]{4}$';
  let formErrs = {};
  let nameBool;
  let nationalIdBool;
  let commentBool;
  
  if (name.length == 0) {
    nameBool = false;
    formErrs.push(nameBool);
  }

  if (nationalId.length != 10) {
    
    nationalIdBool = false;
  }

  return formErrs;
};

app.get('/', async (req, res) => {
  const data = await select();

  let formattedDates = dateFormat(data);
  let errorMessages = {};
  let errorTypes = {};
   
  
  let empty;
  if (data.length == 0) {
    res.render('index', {empty: "Engar undirskriftir.", formattedDates: formattedDates, errorMessages: errorMessages, errorTypes: errorTypes});
  }
  res.render('index', {data: data, empty: false, formattedDates: formattedDates, errorMessages: errorMessages, errorTypes: errorTypes});
});

app.post(
  '/', 
  // validation
  body('name')
    .isLength({ min: 1 })
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
      const errorMessages = errors.array().map(i => i.msg);
      const errorTypes = errors.array().map(i => i.param);

      const data = await select();      
      let formattedDates = dateFormat(data);

      return res.render('index', {data: data, empty: false, formattedDates: formattedDates, errorMessages: errorMessages, errorTypes: errorTypes});
    }

    next();
    
  },
  // sanitation
  body('name').trim().escape(),
  body('nationalId').blacklist('-'),

  async (req, res) => { 
    let {name, nationalId, comment} = req.body;
    let anonymous = req.body.anonymous;
    if(anonymous == "on") anonymous = true;
    else anonymous = false;

    await insert(name, nationalId, comment, anonymous);

    const data = await select();
    let formattedDates = dateFormat(data);
    let errorMessages = {};
    let errorTypes = {};

    return res.render('index', {data: data, empty: false, formattedDates: formattedDates, errorMessages: errorMessages, errorTypes: errorTypes });
  }

);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
