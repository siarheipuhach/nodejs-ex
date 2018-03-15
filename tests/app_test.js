var server   = require('../server'),
    chai     = require('chai'),
    chaiHTTP = require('chai-http'),
    should   = chai.should();

chai.use(chaiHTTP);

reqServer = process.env.HTTP_TEST_SERVER || server

describe('Basic routes tests', function() {

    
})
