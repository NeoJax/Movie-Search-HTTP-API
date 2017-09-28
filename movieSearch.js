const http = require('http');
const cheerio = require('cheerio');
const express = require('express');

function parseHTML(data) {
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
                process.argv[2].toLowerCase().charAt(0) && first !== true) {
                  console.log();
                }
                process.stdout.write(elementNewer.data);
                first = false;
              }
            });
          }
        }
        if (elementNew.type === 'text') {
          if (elementNew.data !== ' ') {
            process.stdout.write(elementNew.data);
          }
        }
      });
    });
  }
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
        parseHTML(html);
        console.log();
      });
    });
  });
}

module.exports = { parseHTML, queryIMDB };

if (!module.parent) {
  queryIMDB(process.argv[2]);
}
