import express from 'express';
import { router } from './registration.js';

const { PORT: port = 3000 } = process.env;

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.set('views', './views');
app.set('view engine', 'ejs');

app.use('/', router);

function notFoundHandler(req, res, next) { // eslint-disable-line
  res.status(404).render('error', { title: '404', error: '404 Fannst ekki' });
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  res.status(500).render('error', { title: 'Villa', err, error: "500 Villa kom upp" });
}

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
