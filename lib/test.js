function queryString(query) {
    let queryString = "?";
    Object.keys(query).forEach((field, i) => {
        queryString += `${!i ? '' : '&' }${field}=${query[field]}`
    });
    return queryString;
}

let query = {
    page: 2
};

console.log(queryString(query));