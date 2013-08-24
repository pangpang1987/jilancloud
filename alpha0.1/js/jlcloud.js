//继承实现
var object = {
	isA : function(type) {
		var _self = this
		while (_self) {
			if (_self == type)
				return true
			_self = _self._type()
			if (_self == object) {
				return false;
			}
		}
		return false
	}
}

function Class(base, define) {
	function class_() {//构造一个原型
		this._type = function() {
			return base;
		}//因为是构造原型，所以这个_type属性属于原型，而不是实例。
		for (var member in define)//遍历定义体，把定义体中的每个属性复制给原型
		this[member] = define[member]
	}


	class_.prototype = base//原型的类的原型。给原型的原型传递base对象的所有属性（即定义在基类中的所有方法），相当于间接给原型传递属性。。。。这话怎么这么绕呢
	return new class_ //返回构造好的原型
}

function New(clazz, params) {
	function new_() {//根据原型构造对象
		this._type = function() {
			return clazz;
		}//这个对象有个_type，指向原型，供内部使用。
		clazz._create.call(this, params) //调用原型的构造方法，把参数传进去。//改动apply->call
	}


	new_.prototype = clazz//从原型继承方法
	return new new_ //构造并返回对象
}


function JLSystem(canvas_name){
	var system = this;
	
	var mouse_position = new JLCoord(); //鼠标位置
	system.position = new JLCoord(); //系统绝对坐标
	
	
	function click(time){
		var click = this;
		var times = time ? time : 1;
		var coords = new Array(times);
		var captures = new Array(times);
		var changed = false;
		var index = 0;
		this.change = function() {
			changed = true;
		}
		
		this.click = function() {
			if (index < times) {
				if (!changed) {
					//system.toSystem(mouse_position).print();
					coords[index] = system.toSystem(mouse_position);
					captures[index] = system.capture(system.data);
					index++;
					click.clicked();
				}
				changed = false;
			}

		}
		
		this.clicked = function(){
			changed = false;
		}
		
		this.setPoint = function(i, coord) {
			i = i == null ? index - 1 : i;
			coords[i] = coord;
		}
		this.setCapture = function(i,obj){
			i = i== null?index-1:i;
			captures[i] = obj;
		}
		
		this.getPoint = function(index) {
			if (array_index > index) {
				return coords[index];
			} else
				return false;
		}
		
		this.getCapture = function(index) {
			if (captures[index]) {
				return captures[index];
			}
			return null;
		}
	}
}
