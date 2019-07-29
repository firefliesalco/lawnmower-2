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
		let groups = ["", "K", "M", "B", "T", "Qu", "Qt", "Sx", "Sp", "O", "N", "D", "Ud", "Dd", "Td", "Qud", "Qtd"];

		if(scientific.checked){
			let e = Math.floor(this.value*10)/10;
			if((""+e).length == 1)
				e += ".0";
			return e + this.exponent==0?"":("e" + this.exponent);
		} else {
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
