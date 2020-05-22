const ARTICLES = require('../model/articles');
const UTILS = require('../lib/helper');
const DATABASE = require('../model/database');
const SCHEDULE = require('../model/schedule');

exports = {
  createOrUpdateArticles: async function(dbData) {
    try {
      const articlesResponse = await UTILS.getArticles();
      const articles =
        articlesResponse.response === 'string'
          ? JSON.parse(articlesResponse.response).items
          : articlesResponse.response.items;
      for (let article of articles) {
        if (!dbData.processed_articles.includes(article.news_id)) {
          const id = article.news_id;
          const mappedData = dbData.mapped_articles.find(UTILS.findArticleMatched,{id});
          if (mappedData) await updateArticleAndSetRecord(mappedData, article);
          else await createArticleAndSetRecord(article);
        }
      }
      await DATABASE.update('set', {
        isCreateOrUpdateCompleted: true,
        processed_articles: []
      });
      const articlesMappedRecords = await DATABASE.get();
      exports.deleteArticles(articlesMappedRecords);
    } catch (e) {
      throw e;
    }
  },

  deleteArticles: async function(dbData) {
    try {
      const deletedArticlesResponse = await UTILS.getDeletedArticles();
      const deletedArticles =
        deletedArticlesResponse.response === 'string'
          ? JSON.parse(deletedArticlesResponse.response).items
          : deletedArticlesResponse.response.items;
      for (let article of deletedArticles) {
        const id = article.news_id;
        const mappedData = dbData.mapped_articles.find(UTILS.findArticleMatched,{id});
        if (mappedData) await deleteArticleAndUpdateRecord(mappedData, dbData);
      }
      await DATABASE.update('set', { 
        isDeleteCompleted: true 
      });
      exports.updateScheduleFrequency();
    } catch (e) {
      throw e;
    }
  },

  updateScheduleFrequency: async function() {
    try {
      const frequency = UTILS.calculateTimeInMinutes();
      await SCHEDULE.update({update_frequency:true}, frequency);
      await DATABASE.update('set', {
        isCreateOrUpdateCompleted: false,
        isDeleteCompleted: false
      });
      return null;
    } catch (e) {
      throw e;
    }
  }
};

async function createArticleAndSetRecord(article) {
  const body = buildBodyParamsForArticle(article);
  try {
    const response = await ARTICLES.create(body);
    const { id } = response.article;
    await DATABASE.update('append', {
      mapped_articles: [{ [article.news_id]: id }],
      processed_articles: [article.news_id]
    });
    return null;
  } catch (e) {
    console.error(`Something failed while creating the article for ${article.news_id}`);
    console.error(JSON.stringify(e));
    if (e.status && e.status === 429) throw e;
    else return null;
  }
}

async function updateArticleAndSetRecord(mappedData, article) {
  const id = mappedData[Object.keys(mappedData)[0]];
  const body = buildBodyParamsForArticle(article);
  try {
    await ARTICLES.update(id, body);
    await DATABASE.update('append', {
      processed_articles: [article.news_id]
    });
    return null;
  } catch (e) {
    console.error(`Failed to update the article where id = ${id}`);
    console.error(JSON.stringify(e));
    if (e.status && e.status === 429) throw e;
    else return null;
  }
}

function buildBodyParamsForArticle(article) {
  return {
    solution_article: {
      title: article.description,
      description: article.content,
      folder_id: ARTICLES.folder_id
    }
  };
}

async function deleteArticleAndUpdateRecord(mappedData, dbData) {
  const id = mappedData[Object.keys(mappedData)[0]];
  const mapped_records = [...dbData.mapped_articles];
  try {
    await ARTICLES.delete(id);
    const index = UTILS.getIndexOfRecord(mapped_records, id);
    mapped_records.splice(index, 1);
    await DATABASE.update('set', {
      mapped_articles: mapped_records
    });
    return null;
  } catch (e) {
    console.error(`Failed to delete the article id ${id}`);
    console.error(JSON.stringify(e));
    if (e.status && e.status === 429) throw e;
    else return null;
  }
}
