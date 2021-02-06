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

const connectionString = 'postgres://vef2-2021:123@localhost/vef2-2021-v2';
const pool = new pg.Pool({ connectionString });

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// set views
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


app.get('/', async (req, res) => {
  const data = await select();
  res.render('index', {data: data});
});

app.post('/post-safe', async (req, res) => {
  const name = req.body.name;
  const nationalId = req.body.nationalId;
  const comment = req.body.comment;

  
  const anonymous = req.body.anonymous;


  // const safeData = xss(data);
  await insert(name,nationalId,comment,anonymous);

  const data2 = await select();
  // þetta data í parameternum er ekki sama og ofangreint data
  res.render('index', {data: data2});
});

const port = 3000;

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
