//---------------------\\
//------VARIABLES------\\
//---------------------\\

//HTML Variables
var canvas;
var ctx;
var divCurrency;
var scientific;
var title;
//Game Data Variables
var fields = [];
var fieldData = {};
var currentFieldIndex = 0;
var balance = {};

//----------------------\\
//----GAME FUNCTIONS----\\
//----------------------\\

//Field functions
var Field = function(id, growthColors, mColor){
	this.id = id;	
	this.growthColors = growthColors;
	this.mColor = mColor;
}

var FieldData = function(){
	var grid;
	var size;
	var timeout;
	this.x = 0;
	this.y = 0;
	this.maxGrowth = 2;
	this.growthSpeed = 10;
	this.growthPower = 0.05;
	this.totalTicks = 0;
	this.moneyMade = new Number(0,0);
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
function createNumber(base){
	let v = base;
	let e = 0;
	while(v >= 10){
		v /= 10;
		e++;
	}
	while(v < 1){
		v *= 10;
		e--;
	}
	return new Number(v, e);
}

function cloneNumber(num){
	return new Number(num.value, num.exponent);
}

var Number = function(value, exponent){
	
	this.value = value;
	this.exponent = exponent;
	
	this.add = function(number){
		if(this.exponent - number.exponent < 10){
			this.value += number.value * Math.pow(10, number.exponent - this.exponent);
			while(this.value >= 10){
				this.value /= 10;
				this.exponent++;
			}
		}
	}
	
	this.subtract = function(number){
		if(this.exponent - number.exponent < 10){
			this.value -= number.value * Math.pow(10, number.exponent - this.exponent);
			while(this.value < 1){
				this.value *= 10;
				this.exponent--;
			}
		}
	}
	
	this.multiply = function(number){
		this.exponent += number.exponent;
		this.value *= number.value;
		if(this.value != 0){
			while(this.value >= 10){
				this.value /= 10;
				this.exponent++;
			}
			while(this.value < 1){
				this.value *= 10;
				this.exponent--;
			}
		}
	}
	
	this.divide = function(number){
		
		this.exponent -= number.exponent;
		this.value /= number.value;
		if(this.value != 0){
			while(this.value >= 10){
				this.value /= 10;
				this.exponent++;
			}
			while(this.value < 1){
				this.value *= 10;
				this.exponent--;
			}
		}
	}
	
	this.compare = function(number){
		
		if(this.exponent > number.exponent){
			return 1;
		} else {
			if(this.exponent == number.exponent){
				if(this.value > number.value)
					return 1;
				else if(this.value < number.value)
					return -1;
				else
					return 0;
			} else {
				return -1;
			}
		}
		return 0;
		
	}
	
	this.makeLookGood = function(){
		if(scientific.checked){
			let e = Math.floor(this.value*10)/10;
			if((""+e).length == 1)
				e += ".0";
			return e + "e" + this.exponent;
		} else {
			let groups = ["", "K", "M", "B", "T", "Qu", "Qt", "Sx", "Sp", "O", "N", "D", "Ud", "Dd", "Td", "Qud", "Qtd"];
			let v = this.value * Math.pow(10, this.exponent%3);
			let r = v > 100 ? 1 : v > 10 ? 10 : 100;
			let s = "" + (this.exponent>0?Math.floor(v*r)/r:Math.floor(this.value*Math.pow(10,this.exponent)*100)/100);
			if(s.split(".").length == 1 && r != 1)
				s+= ".";
			while((r == 100 && s.split(".")[1].length < 2) || (r == 10 && s.split(".")[1].length < 1))
				s += "0";
			return s + (this.exponent > 0 ? " " + groups[Math.floor(this.exponent/3)] : "");
			
		}
	}
	
}



function colorGradient(field, dist){

	let c1 = field.growthColors[Math.floor(dist)];
	let c2 = field.growthColors[Math.floor(dist)+1];
	arr = [];
	for(var i = 0; i < 3; i++){
		arr.push(c1[i] + Math.floor((c2[i]-c1[i])*(dist%1)));
	}
	return arr;
}

function moveMachine(data){

	let my = data.size-1;
	if(data.x==0&&data.y==0){
		data.y+=1;
	}else if(data.y==0){
		
		data.x--;
		
	}
	else if(data.x%2==0){
		if(data.y==my){
			data.x++;
		}else{
			data.y++;
		}
		
	}else{
		
		if(data.y==1&&data.x!=my){
			data.x++;
		}else{
			data.y--;
		}
		
	}

}

function growField(data){

	for(var i = 0; i < data.growthSpeed; i++){
		
		let x = Math.floor(Math.random()*data.size);
		let y = Math.floor(Math.random()*data.size);
		
		data.grid[y][x] = Math.min(data.grid[y][x]+data.growthPower, data.maxGrowth-0.01);
		

	}	

}

function tick(){
	
	let field = fields[currentFieldIndex];
	let data = fieldData[field.id];

	moveMachine(data);
	growField(data);
	var moneyEarned = new Number(0,0);
	if(data.grid[data.y][data.x]>0.9){

		data.grid[data.y][data.x] = 0;
		moneyEarned.add(new Number(1,0));
		balance["Money"].add(moneyEarned);
		data.moneyMade.add(moneyEarned);
		updateCurrency("Money");
	}
	data.totalTicks++;
	let persec = cloneNumber(data.moneyMade);
	persec.divide(createNumber(data.totalTicks));
	persec.multiply(createNumber(1000/data.timeout));
	title.innerHTML = field.id + " (" + persec.makeLookGood() + " /s)"
	setTimeout(tick, data.timeout);
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
		if(currency == "Mold"){
			let a = document.createElement("a");
			a.href = "https://www.reddit.com/r/incremental_games/comments/9fx5dc/lawnmowing_game/e60m605";
			currencyDiv.appendChild(a);
			a.appendChild(e);
		}else{
	
			currencyDiv.appendChild(e);
		
		}
	}
	e.innerHTML = currency + " -> " + balance[currency].makeLookGood();
}

//---------------------\\
//---OTHER FUNCTIONS---\\
//---------------------\\

function initAllFields(){
	fields.push(new Field("Lawn", [[64, 193, 0], [65, 124, 36], [0, 247, 103], [205, 0, 247], [198, 0, 145], [150, 24, 61]], [255, 0, 0]));
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
	currency += "Money=" + balance["Money"].value + "e" + balance["Money"].exponent;
	
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

function loadDataNum(id, str, def){
	
	if(str==null)
		return def;
	split = str.split(";");
	split.forEach(function(item){
		data = item.split("=");
		data2 = data[1].split("e");
		if(data[0]==id)
			return new Number(+data2[0],+data2[1]);
	});
	return def;
	
}

function loadCurrency(str, currency, update){
	balance[currency] = loadDataNum(currency, str, new Number(0, 0));
	if(update)
		updateCurrency(currency);
}

function load(){
	fields.forEach(function(field){
		let data = new FieldData();
		let save = localStorage.getItem(field.id);
		data.size = loadDataInt("size", save, 10);
		data.timeout = loadDataInt("timeout", save, 50);
		initField(data);
		fieldData[field.id] = data;
	});
	
	let currency = localStorage.getItem("currencies");
	loadCurrency(currency, "Money", true);
	loadCurrency(currency, "Mulch");
	loadCurrency(currency, "Mold");
}

function setup(){
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	divCurrency = document.getElementById("currencies");
	scientific = document.getElementById("scientific");
	title = document.getElementById("title");
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
			let color = colorGradient(field, data.grid[y][x]);
			ctx.fillStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
			ctx.fillRect(x*tileSize+px, y*tileSize+py, tileSize+1, tileSize+1);
		}
	}

	ctx.fillStyle = "rgb(" + field.mColor[0] + "," + field.mColor[1] + "," + field.mColor[2] + ")";
	ctx.fillRect(data.x*tileSize+px, data.y*tileSize+py,tileSize,tileSize);
	
	
}

function render(){
	update();
	
	let canvasSize = canvas.width;
	
	renderField(fields[currentFieldIndex],0,0,canvasSize/2);
	renderField(fields[currentFieldIndex],canvas.width/2,canvas.height/2,canvasSize/2);
	
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