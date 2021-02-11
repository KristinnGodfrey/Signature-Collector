import express from 'express';
import { select } from './db.js';
import { router } from './registration.js';

const { PORT: port = 3000 } = process.env;

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.set('views', './views');
app.set('view engine', 'ejs');

app.use('/', router);

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


 

function notFoundHandler(req, res, next) { // eslint-disable-line
  res.status(404).render('error', { title: '404', error: '404 fannst ekki' });
}

function errorHandler(error, req, res, next) { // eslint-disable-line
  console.error(error);
  res.status(500).render('error', { title: 'Villa', error });
}

app.use(notFoundHandler);
app.use(errorHandler);


app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
