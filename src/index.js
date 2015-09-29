import { getCurrentYear, getCurrentTerm } from './utils';
import rp from 'request-promise';
import cheerio from 'cheerio';

// Enable cookies for request (they would be used in subsequent requests)
var request = rp.defaults({ jar: true });

const DAYS = {
  "M": 1,
  "T": 2,
  "W": 3,
  "R": 4,
  "F": 5,
  "S": 6,
  "U": 7
}

const DAY_NAMES = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  7: 'Sun'
}

const PERIODS = {
  "0" :  0,
  "1" :  1,
  "2" :  2,
  "3" :  3,
  "4" :  4,
  "5" :  5,
  "6" :  6,
  "7" :  7,
  "8" :  8,
  "9" :  9,
  "10": 10,
  "A" : 11,
  "B" : 12,
  "C" : 13,
  "D" : 14,
}

const QUERY_URL = 'http://140.118.31.215/querycourse/ChCourseQuery/QueryCondition.aspx';
const RESULT_URL = 'http://140.118.31.215/querycourse/ChCourseQuery/QueryResult.aspx';

var parseHTMLRespond = function (body, response) {
  return {
    headers: response.headers,
    html: cheerio.load(body)
  }
};

var retry = function (maxRetries, fn) {
  return fn().catch(function(err) {
    if (maxRetries <= 0) {
      throw err;
    }
    return retry(maxRetries - 1, fn);
  });
}

export default class {

  constructor(attributes = {}) {
    this.year = attributes.year || getCurrentYear();
    this.term = attributes.term || getCurrentTerm();
    this.codeScope = attributes.codeScope;
    this.data = [];
  }

  getData() {
    return this.data;
  }

  crawl(options = {}) {
    return new Promise((resolve, reject) => {
      var data = this.data;
      var dataCount = 0;
      var dataProcessed = 0;

      var viewState = '';
      var viewStateGenerator = '';
      var eventValidation = '';
      var semesterList = [];
      var cookies = null;

      // Send the first request to get cookies and form validations
      request({ url: QUERY_URL, transform: parseHTMLRespond }).then((response) => {
        var { html } = response;

        // Set form validations
        viewState = html('input[name="__VIEWSTATE"]').attr('value');
        viewStateGenerator = html('input[name="__VIEWSTATEGENERATOR"]').attr('value');
        eventValidation = html('input[name="__EVENTVALIDATION"]').attr('value');
        semesterList = html('#semester_list option').map((index, element) => {
          let key = element.attribs.value.match(/^[a-z0-9 ]+/)[0].trim();

          return {
            key: key,
            value: element.attribs.value
          };
        }).get().reduce((obj, item) => {
          obj[item.key] = item.value;
          return obj;
        }, {});

        if (options.onProgressUpdate) options.onProgressUpdate(0.01);

      }).then(() => {
        // Submit the courses search request
        let form = {
          "__VIEWSTATE": viewState,
          "__VIEWSTATEGENERATOR": viewStateGenerator,
          "__EVENTVALIDATION": eventValidation,
          "Acb0101": 'on',
          "BCH0101": 'on',
          "semester_list": semesterList[`${this.year - 1911}${this.term}`],
          "Ctb0101": this.codeScope,
          "QuerySend": '送出查詢'
        };
        return request.post({ url: QUERY_URL, followAllRedirects: true, form: form });

      }).then(() => {
        // Visit the results page to get the results, this would be slow
        if (options.onProgressUpdate) options.onProgressUpdate(0.02);
        return request({ url: RESULT_URL, timeout: 300000, transform: parseHTMLRespond });

      }).then((response) => {
        // Courses list got, ready to proceed
        if (options.onProgressUpdate) options.onProgressUpdate(0.03);
        var { html } = response;
        process.response = response;

        // Map each course, construct simple courses array
        data = html('table tr').map((index, element) => {
          var tds = html(element).children('td');
          return {
            code: tds.eq(0).text(),
            name: tds.eq(1).text(),
            url: tds.eq(2).find('a').attr('href'),
            credits: parseInt(tds.eq(3).text()),
            required: (tds.eq(4).text() === '必'),
            full_semester: (tds.eq(5).text() === '全'),
            lecturer: tds.eq(6).text(),
            students_enrolled: parseInt(tds.eq(10).text()),
            notes: tds.eq(11).text()
          };
        }).get();

        data = data.filter((d) => d.url);
        dataCount = data.length;

      }).then(() => {
        // Dig into the URL of each course to get full information
        let promises = [];
        data.map((d) => {
          promises.push(retry(3, () => request({ url: d.url, transform: parseHTMLRespond }).then((response) => {
            var { html } = response;
            var timeLoc = html('#lbl_timenode').text().match(/([MFTSWUR][\dA-Z]+)(\((.*?)\))?/g) || [];
            var days = timeLoc.map((tl) => DAYS[tl.match(/^[A-Z]/)]);
            var periods = timeLoc.map((tl) => {
              let match = tl.match(/^[A-Z]([A-Z0-9]+)/);
              return (match ? PERIODS[match[1]] : null);
            });
            var locations = timeLoc.map((tl) => {
              let match = tl.match(/\((.+)\)/);
              return (match ? match[1] : null);
            });

            d.semester = html('#lbl_semester').text();
            d.objective = html('#tbx_object').text();
            d.outline = html('#tbx_content').text();
            d.textbook = html('#tbx_textbook').text();
            d.references = html('#tbx_refbook').text();
            d.notice = html('#tbx_note').text();
            d.grading = html('#tbx_grading').text();
            d.note = html('#tbx_remark').text();
            d.name_en = html('#lbl_engname').text();
            d.prerequisites = html('#lbl_precourse').text();
            d.website = html('#hlk_coursehttp').text();

            d.day_1 = days[0];
            d.day_2 = days[1];
            d.day_3 = days[2];
            d.day_4 = days[3];
            d.day_5 = days[4];
            d.day_6 = days[5];
            d.day_7 = days[6];
            d.day_8 = days[7];
            d.day_9 = days[8];
            d.period_1 = periods[0];
            d.period_2 = periods[1];
            d.period_3 = periods[2];
            d.period_4 = periods[3];
            d.period_5 = periods[4];
            d.period_6 = periods[5];
            d.period_7 = periods[6];
            d.period_8 = periods[7];
            d.period_9 = periods[8];
            d.location_1 = locations[0];
            d.location_2 = locations[1];
            d.location_3 = locations[2];
            d.location_4 = locations[3];
            d.location_5 = locations[4];
            d.location_6 = locations[5];
            d.location_7 = locations[6];
            d.location_8 = locations[7];
            d.location_9 = locations[8];
            d.day_periods = days.map((d, i) => `${DAY_NAMES[d]}${periods[i]}`).join(' ');

            return d;

          }).then((d) => {
            dataProcessed += 1;
            if (options.onProgressUpdate) options.onProgressUpdate(dataProcessed / dataCount);
            if (options.onDataReceived) options.onDataReceived(d);

          })).catch((e) => {
            console.error(e);
          }));
        });

        return Promise.all(promises);

      }).then(() => {
        // All done, yeah!
        this.data = data;
        resolve(data);

      }).catch((e) => {
        reject(e);
      });
    });
  }
};
