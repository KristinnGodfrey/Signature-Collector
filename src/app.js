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

  // nationalId = body('nationalId').blacklist('-');
  // console.log(nationalId);
  if (nationalId.length != 10) {
    
    nationalIdBool = false;
  }

  return formErrs;
};

app.get('/', async (req, res) => {
  const data = await select();

  let formattedDates = dateFormat(data);
  
  let empty;
  if (data.length == 0) {
    res.render('index', {empty: "Engar undirskriftir.", formattedDates: formattedDates});
  }
  res.render('index', {data: data, empty: false, formattedDates: formattedDates});
});

app.post(
  '/', 
  // validation
  body('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
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
    console.log(req.body.nationalId);
    let formattedDates = dateFormat(data);
    return res.render('index', {data: data, empty: false, formattedDates: formattedDates});
  }
);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
