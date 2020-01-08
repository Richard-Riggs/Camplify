
module.exports.dbSortQuery = function(sortQuery) {
    switch (sortQuery) {
        case 'recent': return { createdAt: 'descending'};
        case 'reviews': return { commentCount: 'descending' };
        default: return { createdAt: 'descending'};
    }
};