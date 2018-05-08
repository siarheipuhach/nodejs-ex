const fetch = require('node-fetch');
const cheerio = require("cheerio");

Tesseract = require('tesseract.js')

const scanImage = (filename = 'bill3.jpg') => Tesseract.recognize(filename, {lang: 'rus'})
  .then((result)=>{
	  var param = result.text.split(/\n/)[0];
	  var encodedParam = encodeURIComponent(param.split(/"/)[1])
	  fetch('http://kontakt.by/predprijatija/browse/?q_k=+'+encodedParam+'&q_l=%D0%91%D0%B5%D0%BB%D0%B0%D1%80%D1%83%D1%81%D1%8C')
	  .then(res =>res.text())
	  .then(body=>{
		  var $ = cheerio.load(body);
		  var names = [];
		  var type  = $('.company-block div .categories li a').each(function(i, elem){
			  names[i] = $(this).text();
			});	
			return new Set(names)
		}).then((output)=> output)
		.then(
			(output)=>{
				var priceValue;
				result.text.split(/\n/).map(function(item){	
					if (item.includes('ИТОГ')){
					thenum = item.match(/\d+\.*\d*/)
						priceValue = thenum[0];
				}
				})
				return {
					price: priceValue,
					tags: output
				}				
			}	
		)
})

module.exports.scanImage = scanImage;

