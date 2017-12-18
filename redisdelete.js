var redis = require('redis');
var bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);

var config = require('./config.json');//тянем наши ipшники и порты для редиса
var readsso =require("./readsso.js");//тянем наш самописный модуль для парсинга sso из файла 
var redis_cluster = config.host;
var port = config.port;
var arrfordel = readsso.spisok;
var fs = require('fs');
var util = require('util');
var config = require('./config.json');//тянем наши ipшники и порты для редиса

//Запись в лог файл и преобразование обработки console.log
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;
console.log = function(d) { //
	log_file.write(util.format(d) + '\n');
	log_stdout.write(util.format(d) + '\n');
};

var getMaster = function(callback) {
	Object.keys(redis_cluster).map(function(name, index) {
		var host = redis_cluster[name];
		
		var redisClient = redis.createClient({host: host, port: port});
		
		redisClient.role(function(err,reply) {
			if(reply[0]=='master') {
				callback(redisClient);
			} else {
				redisClient.quit();
			}
		});
	});
};

getMaster(function(redisClient){
	console.log('Host ' + redisClient.options.host + ' is master');
	
	console.log('Searching ' + arrfordel.length + ' items');
	
	Promise.all(arrfordel.map(function(item){
		return redisClient.keysAsync('*' + item + '*');
	})).then(function(search_results){
		var keys = [].concat.apply([], search_results);
		
		console.log('Found ' + keys.length + ' keys');
		
		Promise.all(keys.map(function(key){
			return redisClient.delAsync(key);
		})).then(function(replies){
			var deletedCount = replies.reduce(function(previousValue, currentValue){
				return previousValue + currentValue;
			}, 0);
			
			console.log('Deleted ' + deletedCount + ' keys');
			
			redisClient.quit();
		});
	});
});