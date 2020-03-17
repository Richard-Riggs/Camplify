// Input URL query formatted as object (e.g., {sort: 'recent', page: 2})
// Return URL query string (e.g., ?sort=recent&page=2)
module.exports.queryString = function(query) {
  let queryString = "?";
  Object.keys(query).forEach((field, i) => {
    if (query[field] || query[field] === 0) {
      queryString += `${!i ? "" : "&"}${field}=${query[field]}`;
    }
  });
  return queryString;
};
