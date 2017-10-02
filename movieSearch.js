const http = require('http');
const cheerio = require('cheerio');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.post('/', (req, res) => {
  res.send('post');
});

app.get('/app/search/:word', (req, finish) => {
  const { word } = req.params;

  function parseHTML(data, search) {
    let results = '';
    const $ = cheerio.load(data);
    const text = $('div[class=findSection]').find('h3[class=findSectionHeader]').first();
    const find = text.parent();
    let first = true;
    if (find.find('h3[class=findSectionHeader]').first().text() === 'Titles') {
      find.find('td[class=result_text]').each((i, element) => {
        element.children.forEach((elementNew) => {
          if (element.type === 'tag') {
            if (elementNew.children !== undefined) {
              elementNew.children.forEach((elementNewer) => {
                if (elementNewer.type === 'text') {
                  if (elementNewer.data.toLowerCase().charAt(0) ===
                  search.toLowerCase().charAt(0) && first !== true) {
                    results += '\n';
                  }
                  results += elementNewer.data;
                  first = false;
                }
              });
            }
          }
          if (elementNew.type === 'text') {
            if (elementNew.data !== ' ') {
              results += elementNew.data;
            }
          }
        });
      });
    }
    return results;
  }

  function queryIMDB(search) {
    return new Promise((resolve, reject) => {
      http.get({
        host: 'www.imdb.com',
        path: `/find?ref_=nv_sr_fn&q=${search}&s=all`,
      }, (res) => {
        let html = '';
        res.on('data', (data) => {
          html += data;
        }).on('error', (e) => {
          reject(e);
        }).on('end', () => {
          resolve(parseHTML(html, search));
        });
      });
    });
  }

  const fin = queryIMDB(word);

  fin.then((data) => {
    finish
      .status(200)
      .set('Content-Type', 'application/text')
      .send(`${data}`);
  });
});
// app.get('/api/search/:word', (req, res) => {
//   const { word } = req.params;
//   res
//   .status(200)
//   .set('Content-Type', 'application/text')
//   .send(queryIMDB(word));
// });

const port = process.env.PORT || 3000;
app.listen(3000, () => {
  console.log(`Server is listening on port ${port}`);
});
