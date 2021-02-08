/*
Keyrt með:
node 03.xss-persistent.js

Keyrir upp express þjón með formi á /
Upplýsingar eru vistaðar í gagnagrunn án þess að strengur sé hreinsaður m.t.t.
XSS (og annars!)
Á /data eru allar færslur úr grunni sýndar og þar með möguleiki á að sýna gögn
sem innihalda XSS.
*/


import pg from 'pg';
import express from 'express';
import xss from 'xss';
import dotenv from 'dotenv';
import { }  from './db.js';

dotenv.config();

const {
   PORT: port = 3000
} = process.env;

const connectionString = 'postgres://vef2-2021:123@localhost/vef2-2021-v2';
const pool = new pg.Pool({ connectionString });

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.set('views', './views');
app.set('view engine', 'ejs');

async function insert(name, nationalId, comment, anonymous) {
  const client = await pool.connect();
  try {    
    await client.query('INSERT INTO signatures(name, nationalId, comment, anonymous) VALUES ($1,$2,$3,$4)', [name, nationalId, comment, anonymous]);
  } catch (e) {
    console.error('Error', e);
  } finally {
    client.release();
  }
}

async function select() {
  const client = await pool.connect();

  try {
    const res = await client.query('SELECT * FROM signatures');
    return res.rows;
  } catch (e) {
    console.error('Error selecting', e);
  } finally {
    client.release();
  }
  return [];
}

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
