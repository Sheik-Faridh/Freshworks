const UTILS = require('../lib/helper');
require('dotenv').config();

class Articles {
  constructor(folder_id,category_id) {
    this.folder_id = folder_id;
    this.category_id = category_id;
  }

  create(body) {
    const API_URL = `https://<%= iparam.domain %>.freshservice.com/solution/categories/${this.category_id}/folders/${this.folder_id}/articles.json`;
    return $request
      .post(API_URL, UTILS.buildFSRequestHeaders(body))
      .catch(e => {
        throw e;
      });
  }

  update(id, body) {
    const API_URL = `https://<%= iparam.domain %>.freshservice.com/solution/categories/${this.category_id}/folders/${this.folder_id}/articles/${id}.json`;
    return $request
      .put(API_URL, UTILS.buildFSRequestHeaders(body))
      .catch(e => {
        throw e;
      });
  }

  delete(id) {
    const API_URL = `https://<%= iparam.domain %>.freshservice.com/solution/categories/${this.category_id}/folders/${this.folder_id}/articles/${id}.json`;
    return $request
      .put(API_URL, UTILS.buildFSRequestHeaders())
      .catch(e => {
        throw e;
      });
  }
}

const ARTICLES = new Articles(process.env.FOLDER_ID,process.env.CATEGORY_ID);
exports = ARTICLES;
