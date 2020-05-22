require('dotenv').config();

exports = {
  buildFSRequestHeaders: function(body) {
    const headers = {
      Authorization: `Basic <%= encode(iparam.api_key) %>`
    };
    if (body)
      return {
        headers,
        body,
        json: true
      };
    else
      return {
        headers,
        json: true
      };
  },

  buildUARequestHeaders: function() {
    const headers = {
      'X-API-Token-News-v2': '<%= iparam.access_token %>'
    };
    if (body)
      return {
        headers,
        body,
        json: true
      };
    else
      return {
        headers,
        json: true
      };
  },

  buildFSErrMessage: function(status) {
    switch (true) {
      case status === 404:
        return 'The Freshservice credentials are invalid';
      case status === 500:
        return 'Freshservice Internal server Error';
      case status === 504:
        return 'Freshservice Timeout Error';
      default:
        return 'Something went wrong in Freshservice';
    }
  },

  buildUAErrMessage: function(status) {
    switch (true) {
      case status === 400:
        return 'The Access Token is not valid';
      case status === 404:
        return 'Unrecognised resource requested';
      case status === 412:
        return 'The Access Token Headers not found in request';
      case status === 503:
        return 'API Service Unavaliable';
      case status === 504:
        return 'API Timeout Error';
      default:
        return 'Something went wrong in Articles API';
    }
  },

  getArticles: function() {
    return $request
      .get(process.env.ARTICLES_URL, exports.buildUARequestHeaders())
      .catch(e => {
        throw e;
      });
  },

  getDeletedArticles: function() {
    return $request
      .get(process.env.DELETED_ARTICLES_URL, exports.buildUARequestHeaders())
      .catch(e => {
        throw e;
      });
  },

  getIndexOfRecord: function(record,id){
    return record.findIndex(exports.findArticleMatched,{id});
  },

  findArticleMatched:function(mapped_data){
      return parseInt(Object.keys(mapped_data)[0]) === parseInt(this.id)
  },

  calculateTimeInMinutes: function() {
    let today = new Date();
    let tomorrow = exports.getNextDay();
    let diff = tomorrow - today;
    return Math.ceil(diff / (1000 * 60));
  },

  getNextDay: function() {
    let date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours('5');
    date.setMinutes('0');
    date.setSeconds('0');
    return date;
  }
};
