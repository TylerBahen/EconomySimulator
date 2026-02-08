var version = 'Alpha'

//var tinycolor = require('tinycolor2')
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
//const Database = require("@replit/database")
//const db = new Database()
const CryptoJS = require("crypto-js");
const fetch = require('node-fetch');

const encrypt = (text) => {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
};

const decrypt = (data) => {
  return CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
};

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  } catch (error) {
    console.error('Unable to fetch data:', error);
  }
}

function fetchNames() {
  return fetchData(`https://randomuser.me/api/?nat=US&inc=name&results=1000`);
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

var names = [{'first':'John','last':'Doe'}]


function generateEmployee() {
  try {
    var firstNames
    var lastNames
      
          const firstName = pickRandom(names.results).name.first
          const lastName = pickRandom(names.results).name.last
          var newSpeed = (Math.round(Math.random()*6)+7)
          if(newSpeed<10){
            newSpeed++
          }
          if(newSpeed>10){
            newSpeed--
          }
          var wage = Math.floor(newSpeed*0.6)+Math.round((Math.floor(Math.random()*4)-2)/2)
          while (wage<5){
            wage++
          }
          var lumXP = Math.floor(Math.random()*1000)
          var minXP = Math.floor(Math.random()*1000)
          var oilXP = Math.floor(Math.random()*1000)
          var refXP = Math.floor(Math.random()*1000)
          var fabXP = Math.floor(Math.random()*1000)
          employees.push({name:`${firstName} ${lastName}`,speed:newSpeed,wage:wage,payday:0,xp:{'Lumber':lumXP,'Mine':minXP,'Oil':oilXP,'Refinery':refXP,'Fabrication':fabXP}})
  } catch(error) {
    console.error('Unable to generate name:', error);
  }
}

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
})
app.get('/play',function(req,res) {
  res.sendFile(__dirname + '/game.html');
})
app.get('/newgame',function(req,res) {
  res.sendFile(__dirname + '/newgame.html')
})
app.get('/employeeManager',function(req,res) {
  res.sendFile(__dirname + '/employManager.html')
})

app.get('/globe.png',function(req, res){
  res.sendFile(__dirname + '/globe.png')
})

var users = []
var items = ['Wood','Stone','Steel','Copper','Silicon','Oil','Coal','Iron','Quartz']
var modifications = ['Semi Autonomus Mining Unit','Chainsaw Set']
var marketPrices = {Wood:5,Stone:5,Steel:15,Copper:10,Silicon:25,Oil:20,Coal:3,Quartz:4,Iron:6}
var selling = []
var buying = []
var employees = []

var genericFormats = ['{adjective} {adjective} Company','The {adjective} {identifier} Company','The {adjective} {identifier} Company','{identifier} Inc.','The {adjective} {identifier} Company','The {adjective} {identifier} Company','{identifier} Inc.','{identifier}, {identifier}, and More','Unnamed {adjective} Business']
var genericIdentifiers = ['Garbage','Goods','Supplies','Stuff','Sludge','Junk','Stuff','Objects']
var genericAdjectives = ['Stinky','Generic','Local','Overpriced','Low-Quality','Shady','Mediocre','Big','Sincere','Reasonable']
function genericName(){
  var gname = pickRandom(genericFormats)
  gname = gname.replace('{adjective}',pickRandom(genericAdjectives))
  gname = gname.replace('{adjective}',pickRandom(genericAdjectives))
  gname = gname.replace('{identifier}',pickRandom(genericIdentifiers))
  gname = gname.replace('{identifier}',pickRandom(genericIdentifiers))
  return gname
}

function tickMin(){
  shakeEmployees()
  console.log(marketPrices)
  setTimeout(tickMin,60000)
}
function tickSec(){
  setTimeout(tickSec,1000)
  botSell()
  botBuy()
  botRequest()
  botFulfill()
}
function botSell(){
  if(Math.floor(Math.random()*15*(Math.ceil(users.length/5)/2))==0){
    var item = items[Math.floor(Math.random()*items.length)]
    var quantity = Math.ceil(Math.random()*10)
    selling.push({type:item,quantity:quantity,price:Math.ceil((marketPrices[item]*1.1)*quantity),ownername:genericName()})
  }
}
function botBuy(){
  if(Math.floor(Math.random()*15*(Math.ceil(users.length/5)/2))==0){
    var item = items[Math.floor(Math.random()*items.length)]
    var bestDeal = null
    selling.forEach((pointer,index) => {
      if(pointer.price/pointer.quantity<=marketPrices[item]+10&&pointer.type==item){
        if(bestDeal==null || pointer.price/pointer.quantity<selling[bestDeal].price/selling[bestDeal].quantity){
          bestDeal = index
        }
      }
    })
    if(bestDeal!=null){
      sold = selling[bestDeal]
      io.to(sold.ownerid).emit('sold',sold)
      selling.splice(bestDeal,1)
    }
  }
}
function botRequest(){
  if(Math.floor(Math.random()*15*Math.ceil((users.length/5)/2))==0){
    var item = items[Math.floor(Math.random()*items.length)]
    var quantity = Math.ceil(Math.random()*10)
    buying.push({type:item,quantity:quantity,price:Math.floor((marketPrices[item]*0.9)*quantity),requestername:genericName()})
  }
}
function botFulfill(){
  if(Math.floor(Math.random()*15*(Math.ceil(users.length/5)/2))==0){
    var item = items[Math.floor(Math.random()*items.length)]
    var bestDeal = null
    buying.forEach((pointer,index) => {
      if(pointer.price/pointer.quantity>=marketPrices[item]-10&&pointer.type==item){
        if(bestDeal==null || pointer.price/pointer.quantity>buying[bestDeal].price/buying[bestDeal].quantity){
          bestDeal = index
        }
      }
    })
    if(bestDeal!=null){
      sold = buying[bestDeal]
      io.to(sold.requesterid).emit('fulfilled',sold)
      buying.splice(bestDeal,1)
    }
  }
}

function botAdapt(type,change){
  var itemChanges = []
  switch (type){
    case 'Oil':
      itemChanges = ['Stone','Steel','Copper','Silicon','Oil']
      break
    case 'Refinery':
      itemChanges = ['Coal','Coal','Iron','Oil','Quartz']
      break
    case 'Mine':
      itemChanges = ['Wood','Steel','Stone','Stone','Stone']
      break
    case 'Lumber':
      itemChanges = ['Wood','Wood']
  }
  if(change=='connect'){
    itemChanges.forEach((item) => {
      items.push(item)
    })
  }else if(change=='disconnect'){
    itemChanges.forEach((item) => {
      var index = items.indexOf(item);
      if (index !== -1) {
        items.splice(index, 1);
      }
    })
  }
  console.log(items)
}

function shakeEmployees(){
  var loops = Math.ceil(Math.random()*100)
  var i = 0
  fetchNames().then(res => {
    names = res
    while (i<loops){
      i++
      if(Math.floor(Math.random()*4)!=0){
        generateEmployee()
      }else{
        try{
          if(employees.length>10){
            employees.splice(Math.floor(Math.random()*employees.length))
          }
        }
        catch{}
      }
    }
  })
}

io.on('connection',function(client){
  client.emit('ioconnect')
  client.on('companyInfo',function(info,callback){
    console.log('Someone Connected')
    console.log(info)
    client.name = info.cname
    client.color = info.ccolor
    client.type = info.ctype
    callback(client.id,true)//client.id,tinycolor(client.color).isLight())
    info.id = client.id
    users.push({name:client.name,color:client.color,id:client.id,type:client.type})
    botAdapt(client.type,'connect')
  })
  client.on('disconnect',function(){
    console.log('Someone Disconnected')
    users.forEach((user,index) => {
      if(user.id===client.id){
        users.splice(index,1)
        botAdapt(client.type,'disconnect')
      }
    })
  })
  client.on('getMarket',function(callback){
    callback(selling,buying)
  })
  client.on('sellitem',function(item){
    selling.push(item)
  })
  client.on('requestitem',function(item){
    buying.push(item)
  })
  client.on('buyitem',function(item,callback){
    var found = false
    selling.forEach((pointer,index) => {
      if(JSON.stringify(item)==JSON.stringify(pointer)&&!found){
        try{
          io.to(item.ownerid).emit('sold',item)
        }
        catch(e){
          console.log(e)
        }
        selling.splice(index,1)
        callback(item)
        found = true
      }
    })
    if(client.id!=item.ownerid){
      if(marketPrices[item.type]<(item.price/item.quantity)){
        marketPrices[item.type] = ((marketPrices[item.type]*100)+2)/100
      }else if(marketPrices[item.type]>(item.price/item.quantity)){
        marketPrices[item.type] = ((marketPrices[item.type]*100)-2)/100
      }
    }
  })
  client.on('fulfillitem',function(item,callback){
    var found = false
    buying.forEach((pointer,index) => {
      if(JSON.stringify(item)==JSON.stringify(pointer)&&found==false){
        try{
        io.to(item.requesterid).emit('fulfilled',item)
        }
        catch(e){
          console.log(e)
        }
        buying.splice(index,1)
        callback(item)
        found = true
      }
    })
    if(client.id!=item.ownerid){
      if(marketPrices[item.type]<(item.price/item.quantity)){
        marketPrices[item.type] = ((marketPrices[item.type]*100)-2)/100
      }else if(marketPrices[item.type]>(item.price/item.quantity)){
        marketPrices[item.type] = ((marketPrices[item.type]*100)+2)/100
      }
    }
  })
  client.on('getEmployees',function(callback){
    callback(employees)
  })
  client.on('hire',function(name,callback){
    employees.forEach((employee,index) => {
      if(name==employee.name){
        try{
        callback(employees[index])
          employees.splice(index,1)
        }
        catch(e){
          console.log(e)
        }
      }
    })
  })
  client.on('fire',function(employee){
    employees.push(employee)
  })
})
  
server.listen(3000)
tickMin()
tickSec()
while (selling.length<25){
  var item = items[Math.floor(Math.random()*items.length)]
  var quantity = Math.ceil(Math.random()*10)
  selling.push({type:item,quantity:quantity,price:Math.ceil((marketPrices[item]*1.1)*quantity),ownername:genericName()})
}
while (buying.length<10){
  var item = items[Math.floor(Math.random()*items.length)]
  var quantity = Math.ceil(Math.random()*10)
  buying.push({type:item,quantity:quantity,price:Math.floor((marketPrices[item]*0.9)*quantity),requestername:genericName()})
}