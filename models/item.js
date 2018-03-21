var mongoose = require('mongoose');



var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';


mongoose.connect('mongodb://admin:admin@ds119059.mlab.com:19059/financer');

var db = mongoose.connection;

var ItemSchema = mongoose.Schema({
    type: {
        type: String,
    },
    value: {
        type: Number
    },
    name: {
        type: String
    },
    month: {
        type: String
    },
    year: {
        type: Number
    },
    user: {
        type: Schema.Types.ObjectId, ref: 'User'
    }

});

var Item = module.exports = mongoose.model('Item', ItemSchema);

module.exports.createItem = function(newItem, callback){
    newItem.save(callback);
};

module.exports.getItemById = function(id, callback){
    Item.findById(id, callback);
};
