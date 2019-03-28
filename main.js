//---------------------\\
//------VARIABLES------\\
//---------------------\\

//HTML Variables
var canvas;
var ctx;
var divCurrency;
//Game Data Variables
var fields = [];
var fieldData = {};
var currentFieldIndex = 0;
var balance = {};

//----------------------\\
//----GAME FUNCTIONS----\\
//----------------------\\

//Field functions
var Field = function(id, barrenColor, grownColor, mColor){
	this.id = id;	
	this.barrenColor = barrenColor;
	this.grownColor = grownColor;
	this.mColor = mColor;
}

var FieldData = function(){
	var grid;
	var size;
	var timeout;
	var x = 0;
	var y = 0;
}

function initField(data){
	data.grid = [];
	for(var i = 0; i < data.size; i++){
		data.grid.push(new Array());
		for(var j = 0; j < data.size; j++)
			data.grid[i].push(Math.random());
 	}
}













//Other Game Functions

function colorGradient(c1, c2, dist){
	arr = [];
	for(var i = 0; i < 3; i++){
		arr.push(c1[i] + Math.floor((c2[i]-c1[i])*dist));
	}
	return arr;
}

function tick(){
	
	let field = fields[currentFieldIndex];
	let data = fieldData[field.id];
	let even = data.size%2==0;
	let my = data.size-1;
	if(data.x==0&&data.y==0){
		if(even){
			data.y+=1;
		}else{
			data.x+=1;
		}
	}else if((even&&data.y==0)||(!even&&data.y==my)){
		if(!even&&data.x==dy){
			data.force=true;
		}
		if(data.force){
			data.y++;
			if(data.y==my)
				data.force=false;
		}else{
			data.x--;
		}
	}
	else if(data.x%2==0==even){
		if(data.y==my||(!even&&data.y==my-1&&data.x!=my)){
			data.x++;
		}else{
			data.y++;
		}
		
	}else{
		
		if(data.y==0||(even&&data.y==1&&data.x!=my)){
			data.x++;
		}else{
			data.y--;
		}
		
	}
	
	setTimeout(tick, fieldData[fields[currentFieldIndex].id].timeout/10);
}

function buy(currency, price){
	if(balance[currency] != null && balance[currency] >= price){
		balance[currency] -= price;
		return true;
	}
	return false;
}

function updateCurrency(currency){
	let e = document.getElementById("c_" + currency);
	if(e==null){
		e=document.createElement("p");
		e.id = "c_" + currency;
		currencyDiv.appendChild(e);
	}
	e.innerHTML = "&nbsp;&nbsp;" + currency + " -> " + balance[currency];
}

//---------------------\\
//---OTHER FUNCTIONS---\\
//---------------------\\

function initAllFields(){
	fields.push(new Field("lawn", [64, 193, 0], [65, 124, 36], [255, 0, 0]));
}

function save(){
	fields.forEach(function(field){
		let data = fieldData[field.id];
		let str = "";
		str+="size="+data.size;
		str+=";timeout="+data.timeout;
		
		localStorage.setItem(field.id,str);
	});
	let currency = "";
	currency += "Money=" + balance["Money"];
	
	localStorage.setItem("currencies", currency);
}

function loadDataStr(id, str, def){
	if(str==null)
		return def;
	split = str.split(";");
	split.forEach(function(item){
		data = item.split("=");
		if(data[0]==id)
			return data[1];
	});
	return def;
}

function loadDataInt(id, str, def){
	if(str==null)
		return def;
	split = str.split(";");
	split.forEach(function(item){
		data = item.split("=");
		if(data[0]==id)
			return +data[1];
	});
	return def;
}

function loadCurrency(str, currency){
	balance[currency] = loadDataInt(currency, str, 0);
	updateCurrency(currency);
}

function load(){
	fields.forEach(function(field){
		let data = new FieldData();
		let save = localStorage.getItem(field.id);
		data.size = loadDataInt("size", save, 11);
		data.timeout = loadDataInt("timeout", save, 1000);
		data.x = 0;
		data.y = 0;
		data.force=false;
		initField(data);
		fieldData[field.id] = data;
	});
	
	let currency = localStorage.getItem("currencies");
	loadCurrency(currency, "Money");
}

function setup(){
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	divCurrency = document.getElementById("currencies");
	initAllFields();
	load();
}

function update(){
	
	var size = window.innerHeight/1.2;
	canvas.width = size;
	canvas.height = size;
	
}

function renderField(field, px, py, size){
	
	let data = fieldData[field.id];
	let tileSize = size/data.size;
	for(var y = 0; y < data.size; y++){
		for(var x = 0; x < data.size; x++){
			let color = colorGradient(field.barrenColor, field.grownColor, data.grid[y][x]);
			ctx.fillStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
			ctx.fillRect(x*tileSize+px, y*tileSize+py, tileSize, tileSize);
		}
	}

	ctx.fillStyle = "rgb(" + field.mColor[0] + "," + field.mColor[1] + "," + field.mColor[2] + ")";
	ctx.fillRect(data.x*tileSize+px, data.y*tileSize+py,tileSize,tileSize);
	
	
}

function render(){
	update();
	
	let canvasSize = canvas.width;
	
	renderField(fields[0],0,0,canvasSize/2);
	renderField(fields[0],canvasSize/2,canvasSize/2,canvasSize/2);
	
	ctx.fillStyle = "black";
	ctx.strokeRect(1,1,canvas.width-2,canvas.height-2);
	
}

window.onload = function(){
	console.log("Loaded");
	setup();
	
	setInterval(render, 40);
	setInterval(save, 20000);
	setTimeout(tick,1000);
	
}