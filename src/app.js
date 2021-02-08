import pg from 'pg';
import express from 'express';
import xss from 'xss';
import dotenv from 'dotenv';
import { insert, select }  from './db.js';

// dotenv.config();

const {   
  PORT: port = 3000,
} = process.env;

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.set('views', './views');
app.set('view engine', 'ejs');

function dateFormat(data) {
  let datesArr = []
  data.forEach(d => {
    let year = d.signed.getFullYear();
    let month = d.signed.getMonth();
    let day = d.signed.getDate();
    datesArr.push(`${day}, ${month}, ${year}`);
  })
  return datesArr;
}

app.get('/', async (req, res) => {
  const data = await select();
  // empty villuobj senda i render
  let formErrs = {};

  let formattedDates = dateFormat(data);
  
  let empty;
  if (data.length == 0) {
    res.render('index', {empty: "Engar undirskriftir.", formattedDates: formattedDates});
  }
  res.render('index', {data: data, empty: false, formattedDates: formattedDates});
});

app.post('/', async (req, res) => {
  const {name, nationalId, comment} = req.body;
  let anonymous = req.body.anonymous;
  if(anonymous == "on") anonymous = true;
  else anonymous = false;

  // const safeData = xss(data);
  await insert(name,nationalId,comment,anonymous);

  const data = await select();
  // þetta data í parameternum er ekki sama og ofangreint data
  let formattedDates = dateFormat(data);

  res.render('index', {data: data, empty: false, formattedDates: formattedDates});
});

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
