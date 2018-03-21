var express = require('express');
var router = express.Router();
// Register 
var Item = require('../models/item');



router.post('/add', (req, res) => {
    var value = req.body.name;
    var type = req.body.email;
    var name = req.body.password;   
    var year = req.body.year;
    var month = req.body.month;
    var user = req.user;
    
    if (value && type && name && user && year && month){
        var newItem = new User({
            value: value,
            type: type,
            name: name,
            user: user,
            year: year,
            month: month
        });
        Item.createItem(newItem, function(err, user){
            if(err) throw err;
            console.log(user);
        });
        return res.send({'Success': 'You have created a new item'})
    }
    return res.send('Error')
  });


router.get('/list', function(req, res){
    const user = req.user;
    const items = Item.find().where({user: user});
    res.send({'items': items})
});

router.post('/remove/:id', function(req, res){
    const id = req.params.id;
    const user = req.user;
    const items = Item.remove().where({_id: id});
    res.send({'items': items})
});

router.put('/:id', (req, res) => {
    Item.findOne({_id:req.params.id}, (err, foundObject) => {
      var value = req.body.name;
      var type = req.body.email;
      var name = req.body.password;
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