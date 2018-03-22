var express = require('express');
var router = express.Router();
// Register 
var Item = require('../models/item');



router.post('/add', (req, res) => {
    var value = req.body.value;
    var type = req.body.type;
    var name = req.body.name;   
    var year = req.body.year;
    var month = req.body.month;
    var user = req.user;
    console.log(user, value, type, name, year, month);    
    if (value && type && name && user && year && month){
        console.log("HEREREREREREERER")
        var newItem = new Item({
            value: value,
            type: type,
            name: name,
            user: user,
            year: year,
            month: month
        });
        Item.createItem(newItem, function(err, item){
            console.log('Errors:')
            console.log(err)
            console.log('err')
            return res.send({'Success': 'You have created a new item'})
        });
    }
    return res.send('Error')
  });


router.get('/list', function(req, res){
    const user_id = req.user;
    if (!req.user) {
      res.statusCode = 403;
      return res.send({'Error': 'You are not logged in user'})
    }
    const items = Item.find().where({user: user_id}).exec(function(err, items){
        if (err) throw err;
        return res.send({'items': items})
    }
    );
    
});

router.post('/remove/:id', function(req, res){
    const id = req.params.id;
    const user = req.user;
    Item.remove().where({_id: id}).exec(function(err, item){
      if(err) throw err;
      res.send({'Success': 'Item was deleted successfully'})
    }
    );
});

router.put('/:id', (req, res) => {
    Item.findById(req.params.id, (err, foundObject) => {
      var value = req.body.value;
      var type = req.body.type;
      var name = req.body.name;
      if(value !== undefined) {
        foundObject.value = value
      }
      if(type !== undefined) {
        foundObject.type = type
      }
      if(name !== undefined) {
        foundObject.name = name
      }
      foundObject.save((e, updatedTodo) => {
        if(err) {
          res.status(400).send(e)
        } else {
          res.send(updatedTodo)
        }
      })
    })
  })

module.exports = router;