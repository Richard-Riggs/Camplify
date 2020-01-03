//======================= MODULES =======================

const express        = require("express"),
      router         = express.Router(),
      moment         = require("moment");

//------------------------------------------------------

router.get('/test', function (req, res) {
    res.render('test');
});

module.exports = router;
