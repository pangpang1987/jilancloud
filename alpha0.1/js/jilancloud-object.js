//
//  jilancloud.js - version 0.1
//  a Mining Ventilation Simulation System
//
//  Copyright (c) 2013 Shanghai Jilan Software Co.,Ltd.
//  Physics code, copyright (c) 2013 PANGPANG&LILy (Zhaodong Liu)
//

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

function JLsystem(canvas_name) {
	var system = this;
	//鼠标位置
	var mouse_position = new JLCoord();

	system.timer = new JLTimer();
	system.position = new JLCoord();

	//画布类
	var canvas = new JLCanvas(canvas_name, system);

	//数据
	function data(datas) {
		this.nodes = new JLObjectArray(datas.Node, JLNode);
		this.edges = new JLObjectArray(datas.Edge, JLEdge);
		this.fans = new JLObjectArray(datas.Fan, JLFan);
		this.gates = new JLObjectArray(datas.Gate, JLGate);
		//this.nodes.bind(datas.Node);
		//this.edges.bind(datas.Edge);
	}

	var click = new action_click();
	function action_click(time) {
		var _this = this;
		var times = time ? time : 1;
		var coords = new Array(times);
		var captures = new Array(times);
		var changed = false;
		var array_index = 0;

		this.change = function() {
			changed = true;
		}

		this.click = function() {
			if (array_index < times) {
				if (!changed) {
					system.toSystem(mouse_position).print();
					coords[array_index] = system.toSystem(mouse_position);
					captures[array_index] = system.capture(system.data);
					array_index++;
					_this.clicked();
				}
			}

		}

		this.set = function(index, coord) {
			var i = index == null ? array_index - 1 : index;
			coords[i] = coord;
		}

		this.clicked = function() {
			changed = false;
		}

		this.getPoint = function(index) {
			if (array_index > index) {
				return coords[index];
			} else
				return false;
		}
		//获取捕捉的首位，今后被捕捉确定代替
		this.getCapture = function(index) {
			if (captures[index]) {
				if (captures[index].fans[0]) {
					return captures[index].fans[0];
				}
				if (captures[index].nodes[0]) {
					return captures[index].nodes[0];
				}
				if (captures[index].edges[0]) {
					return captures[index].edges[0];
				}
			}
			return null;
		}
		//无法确定时候返回全部的capture对象
		this.getCaptures = function(index) {
			return captures[index] ? captures[index] : false;
		}
		//获取Node方便
		this.getNode = function(index) {
			return captures[index].nodes[0] ? captures[index].nodes[0] : false;
		}
		//获取Edge方便
		this.getEdge = function(index) {
			return captures[index].edges[0] ? captures[index].edges[0] : false;
		}
		//如果node为true，返回当前鼠标到index的点的直线
		this.getLine = function(index, node) {
			if (node) {
				return new JLLine(node.coord, system.toSystem(mouse_position));
			}
			return new JLLine(_this.getPoint(index), system.toSystem(mouse_position));
		}
		this.reset = function(time) {
			click = new action_click( time ? time : 1);
		}
	}

	var drawReferenceLine = function(e) {
		var canvas = new JLCanvas("canvas_drawing", system);
		drawCapture({
			node : true
		});
		//stageI
		if (system.controller.draw_edge && click.getPoint(0)) {
			var node = click.getNode(0);
			if (node) {
				canvas.drawReferenceLine(system.toScreen(click.getLine(0, node)));
			} else {
				canvas.drawReferenceLine(system.toScreen(click.getLine(0)));
			}
		}
		//stageII
		if (system.controller.draw_edge && click.getPoint(1)) {
			system.controller.drawEdge();
			var node1 = click.getNode(0);
			var node2 = click.getNode(1);
			//判断两点重复!!
			if (node1 == node2 && node1) {
				alert('两点重复！');
			} else if (click.getPoint(0).equal(click.getPoint(1))) {
				alert('point两点重复！');
			} else {
				//注意事件顺序，先添加edge，后重置状态
				if (!node1) {
					node1 = New(JLNode, {
						"coord" : click.getPoint(0)
					}).create();
					system.data.nodes.add(node1);
				}
				if (!node2) {
					node2 = New(JLNode, {
						"coord" : click.getPoint(1)
					}).create();
					system.data.nodes.add(node2);
				}

				New(JLEdge, {
					"sNode" : node1.ID,
					"eNode" : node2.ID,
					"sNodeAuthKey" : node1.AuthKey,
					"eNodeAuthKey" : node2.AuthKey
				}).create();
			}
			//重置状态
			drawCapture(null);
			canvas.clear();
			click.reset();
		}
		//cancel
		if (e && e.keyCode == 27) {
			drawCapture(null);
			canvas.clear();
			system.controller.drawEdge();
		}

	}
	var addFan = function(evt) {
		var canvas = new JLCanvas("canvas_drawing", system);
		canvas.clear();
		drawCapture({
			edge : true
		});
		var edge = system.capture(system.data).edges[0];
		if (system.controller.draw_fan && edge) {
			var point = system.geometry.pointLineCross(system.toSystem(mouse_position), edge.getLine(system.data.nodes));
			if (point) {
				var fan = New(JLFan, {
					"coord" : point
				});
				canvas.drawFan(fan);
			}
			fan = null;
		}
		if (click.getPoint(0) && click.getEdge(0)) {

			var point = system.geometry.pointLineCross(click.getPoint(0), click.getEdge(0).getLine(system.data.nodes));

			if (point) {
				var edge = click.getEdge(0);
				drawCapture(null);
				canvas.clear();
				system.controller.drawFan();
				New(JLFan, {
					"edge" : edge.ID,
					"edgeAuthKey" : edge.AuthKey,
					"coord" : point
				}).create();
			}
		}
		//cancel
		if (evt && evt.keyCode == 27) {
			drawCapture(null);
			canvas.clear();
			system.controller.drawFan();
		}
		click.reset();
	}
	var drawCap = function(evt) {
		drawCapture();
	}
	var dataCap = function(evt) {
		fillDataForm(null);
		var capture = click.getCapture(0);
		fillDataForm(capture);
		click.reset();
	}
	var drawCapture = function(type) {
		var canvas = new JLCanvas("canvas_capture", system);
		canvas.clear();
		if (!type) {
			if (type === null) {
				return;
			}
			if (type === undefined) {
				type = {
					node : true,
					edge : true,
					fan : true
				}
			}
		}
		var capture = system.capture(system.data);
		if (type.fan && capture.fans[0]) {
			var fan = New(JLFan, capture.fans[0]);
			fan.patternCircle = new JLPattern(true, "#7fff00", 3);
			fan.patternLeaf = new JLPattern(true, "#7fff00", 2, true, "#006400");
			canvas.drawFan(fan);
			fan = null;
			return;
		}
		if (type.gate && capture.gates[0]) {
			var gate = New(JLGate, capture.fans[0]);
			fan.patternCircle = new JLPattern(true, "#7fff00", 3);
			fan.patternLeaf = new JLPattern(true, "#7fff00", 2, true, "#006400");
			canvas.drawFan(fan);
			fan = null;
			return;
		}
		
		if (type.node && capture.nodes[0]) {
			var node = New(JLNode, capture.nodes[0]);
			node.pattern = new JLPattern(true, "#7fff00", 3);
			canvas.drawNode(node);
			return;
		}
		if (type.edge && capture.edges[0]) {
			var edge = capture.edges[0];
			//edge.pattern = new JLPattern(null, "#7fff00", sys.toScreen(30), true, "#7fff00");
			canvas.drawEdge(edge, {
				pattern : new JLPattern(null, "#7fff00", sys.toScreen(30), true, "#7fff00")
			});
			canvas.drawEdge(edge, {
				pattern : new JLPattern(null, "#ffffff", system.toScreen(24), null, null)
			});
			return;
		}
	}
	function controller() {
		var _this = this;

		var drawing = function(e) {
			var canvas = new JLCanvas("canvas_drawing", system);
			canvas.clear();
			if (_this.type == JLEdge) {
				drawCapture({
					node : true,
					//分割
					edge : true
				});
				//stage I
				if (click.getPoint(0)) {
					var node = click.getNode(0);
					if (node) {
						canvas.drawReferenceLine(system.toScreen(click.getLine(0, node)));
					} else {
						canvas.drawReferenceLine(system.toScreen(click.getLine(0)));
					}
				}
				//stage II
				if (click.getPoint(1)) {
					//system.controller.drawEdge();
					var node1 = click.getNode(0);
					var node2 = click.getNode(1);
					//判断两点重复
					if (node1 == node2 && node1) {
						alert('两点重复！');
					} else if (click.getPoint(0).equal(click.getPoint(1))) {
						alert('point两点重复！');
					} else {
						if (!node1) {
							node1 = New(JLNode, {
								"coord" : click.getPoint(0)
							}).create();
							system.data.nodes.add(node1);
						}
						if (!node2) {
							node2 = New(JLNode, {
								"coord" : click.getPoint(1)
							}).create();
							system.data.nodes.add(node2);
						}
						New(JLEdge, {
							"sNode" : node1.ID,
							"eNode" : node2.ID,
							"sNodeAuthKey" : node1.AuthKey,
							"eNodeAuthKey" : node2.AuthKey
						}).create();
					}
					_this.drawOff();
				}
			}
			if (_this.type == JLFan) {
				drawCapture({
					edge : true
				});
				var edge = system.capture(system.data).edges[0];
				if (edge) {
					var point = system.geometry.pointLineCross(system.toSystem(mouse_position), edge.getLine(system.data.nodes));
					if (point) {
						var fan = New(JLFan, {
							"coord" : point
						});
						canvas.drawFan(fan);
					}
					fan = null;
				}
				if (click.getPoint(0) && click.getEdge(0)) {
					var point = system.geometry.pointLineCross(click.getPoint(0), click.getEdge(0).getLine(system.data.nodes));
					if (point) {
						var edge = click.getEdge(0);
						New(JLFan, {
							"edge" : edge.ID,
							"edgeAuthKey" : edge.AuthKey,
							"coord" : point
						}).create();
						_this.drawOff();
					}
				}
			}
			
			if(_this.type == JLGate) {
				drawCapture({
					edge : true
				});
				var edge = system.capture(system.data).edges[0];
				if (edge) {
					var point = system.geometry.pointLineCross(system.toSystem(mouse_position), edge.getLine(system.data.nodes));
					if (point) {
						var gate = New(JLGate, {
							"edge" : edge.ID,
							"coord" : point
						});
						canvas.drawGate(gate);
					}
					fan = null;
				}
				if (click.getPoint(0) && click.getEdge(0)) {
					var point = system.geometry.pointLineCross(click.getPoint(0), click.getEdge(0).getLine(system.data.nodes));
					if (point) {
						var edge = click.getEdge(0);
						New(JLGate, {
							"edge" : edge.ID,
							"edgeAuthKey" : edge.AuthKey,
							"coord" : point
						}).create();
						_this.drawOff();
					}
				}
			}
			if (e && e.keyCode == 27) {
				system.controller.drawOff();
			}
		}

		this.draw = false;
		this.drawType = null;

		this.drawOn = function(obj) {
			_this.capture(false);
			fillDataForm(null);
			if (obj.isA(JLEdge)) {
				click.reset(2);
				_this.type = JLEdge;
			}
			if (obj.isA(JLFan)) {
				click.reset();
				_this.type = JLFan;
			}
			if(obj.isA(JLGate)) {
				click.reset();
				_this.type = JLGate;
			}
			
			$('body').live("keydown", drawing);
			$('#'+canvas_name).live("mousemove", drawing);
			$('#'+canvas_name).live("click", drawing);
		}
		this.drawOff = function() {
			_this.type = null;
			drawCapture(null);
			var temp = new JLCanvas("canvas_drawing");
			temp.clear();
			click.reset();
			$('body').die("keydown", drawing);
			$('#'+canvas_name).die("mousemove", drawing);
			$('#'+canvas_name).die("click", drawing);
		}

		this.draw_edge = false;
		this.draw_fan = false;
		this.capture_element = false;

		this.drawEdge = function() {
			if (!_this.draw_edge) {
				$('#drawE').html("绘制中");
				//关闭侧边栏捕捉
				_this.capture(false);
				fillDataForm(null);

				click.reset(2);
				document.body.live("keydown", drawReferenceLine);
				canvas.screen.live("mousemove", drawReferenceLine);
				canvas.screen.live("click", drawReferenceLine);
				_this.draw_edge = true;
			} else {
				$('#drawE').html("分支");

				document.body.die("keydown", drawReferenceLine);
				canvas.screen.die("mousemove", drawReferenceLine);
				canvas.screen.die("click", drawReferenceLine);
				_this.draw_edge = false;
			}
		}

		this.drawFan = function() {
			if (!_this.draw_fan) {
				$('#drawF').html("绘制中");
				//关闭侧边栏捕捉
				_this.capture(false);
				fillDataForm(null);
				click.reset();
				document.body.addEventListener("keydown", addFan, false);
				canvas.screen.addEventListener("mousemove", addFan, false);
				canvas.screen.addEventListener("click", addFan, false);
				_this.draw_fan = true;
			} else {
				$('#drawF').html("风机");
				click.reset();
				canvas.screen.removeEventListener("mousemove", addFan, false);
				canvas.screen.removeEventListener("click", addFan, false);
				_this.draw_fan = false;
			}
		}

		this.capture = function(on_or_off) {
			if (on_or_off !== undefined) {
				_this.capture_element = !on_or_off;
			}

			if (!_this.capture_element) {
				$('#capture').html("捕捉中");
				click.reset();
				canvas.screen.addEventListener("mousemove", drawCap, false);
				canvas.screen.addEventListener("click", dataCap, false);
				_this.capture_element = true;
				console.log("capture", system.controller.capture_element);
			} else {
				$('#capture').html("捕捉");
				canvas.screen.removeEventListener("mousemove", drawCap, false);
				canvas.screen.removeEventListener("click", dataCap, false);
				_this.capture_element = false;
				console.log("capture", system.controller.capture_element);
			}
		}
	}


	system.graft = function(datas) {
		//console.log(datas);
		//alert(datas);
		system.data = new data(datas);

	}
	system.regraft = function(datas) {
		for (var type in datas) {
			system.data[type].bind(datas[type]);
		}

	}

	system.parameter = {
		zoom : {
			index : 4,
			minIndex : 3,
			maxIndex : 6,
			maxWidth : 10000,
			maxHeight : 8000,
			originalIndex : 4,
			array : [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100],
			expandArray : [0.1, 0.05, 0.02, 0.01]
		},
		track : {
			defaultDistance : 5,
			defaultNode : 10,
			defaultEdge : 8,
			defaultFan : 10
		}
	}

	system.init = function() {

		system.controller = new controller();
		//设定图元系统
		JLMetaFile.setSys(system);

		//取消用户选择
		canvas.screen.onselectstart = function() {
			return false;
		}// ie
		canvas.screen.onmousedown = function() {
			return false;
		}// mozilla
		var mouseClick = function(evt) {
			switch(evt.button) {
				case 0:
					mouseClickLB(evt);
					break;
				case 1:
					mouseClickMB(evt);
					break;
				default:
					mouseClickRB();
					break;
			}
		}
		var mouseUp = function(evt) {
			switch(evt.button) {
				case 0:
					mouseUpLB(evt);
					break;
				case 1:
					mouseUpMB(evt);
					break;
				default:
					break;
			}
		}
		var move = function() {
			$('#' + canvas_name).css('cursor', 'move');
			system.position.x = system.formal_coord.x - mouse_position.x * system.scale;
			system.position.y = system.formal_coord.y - mouse_position.y * system.scale;
			system.boundCheck();
			system.draw();
			click.change();
		}
		var moveFinish = function() {
			canvas.screen.removeEventListener('mousemove', move, false);

			$('#' + canvas_name).css('cursor', 'crosshair');
		}
		var moveLeave = function() {
			click.change();
			canvas.screen.removeEventListener('mousemove', move, false);
			$('#' + canvas_name).css('cursor', 'crosshair');
		}
		var mouseClickLB = function(evt) {
			click.clicked();
			system.formal_coord = system.toSystem(mouse_position);
			canvas.screen.addEventListener('mousemove', move, false);
		}
		var mouseUpLB = function(evt) {
			click.click();
			moveFinish();
		}
		var mouseClickMB = function(evt) {
			system.formal_coord = system.toSystem(mouse_position);
			canvas.screen.addEventListener('mousemove', move, false);
		}
		var mouseUpMB = function(evt) {
			moveFinish();
		}
		var mouse_move = function(evt) {
			var e = evt || window.event;
			var x = e.pageX || (e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
			var y = e.pageY || (e.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
			x = x - canvas.offset.x;
			y = y - canvas.offset.y;
			mouse_position.set(x, y);
			$("#mouse").html(mouse_position.x + "," + mouse_position.y);
			$('#sys').html(system.toSystem(mouse_position).x + "," + system.toSystem(mouse_position).y)
		}
		var mouse_wheel = function(evt) {
			var wheel = 0;
			if (evt.wheelDelta)
				wheel = evt.wheelDelta;
			else if (evt.detail) {
				wheel = -1 * evt.detail;
			}
			if (wheel > 0) {//向上
				system.zoomIn(mouse_position);

			} else if (wheel < 0) {//向下
				system.zoomOut(mouse_position);
			}
			//console.log(wheel);
		}
		var eventHandler = function() {
			var base = $('#' + canvas_name);

			base.die();

			base.live('mouseup', function(evt) {
				evt.stopPropagation();
				mouseUp(evt);
			});

			base.live('mousedown', function(evt) {
				evt.stopPropagation();
				mouseClick(evt);
			});

			base.live('mousemove',mouse_move);

			base.live('mouseleave', moveLeave);
			system.scale = system.parameter.zoom.array[system.parameter.zoom.originalIndex];
			// 判断firefox
			isFirefox = (navigator.userAgent.indexOf("Firefox") != -1);
			//鼠标滚轮事件
			mousewheel = isFirefox ? "DOMMouseScroll" : "mousewheel";

			canvas.screen.addEventListener(mousewheel, mouse_wheel, false);

			//$('#' + canvas_name).unbind('mouseleave', moveFinish);
			//$('#' + canvas_name).unbind('mouseleave', out_click);
		}
		//数据载入
		var target = document.getElementById('spinner');
		var spinner = new Spinner({
			lines : 13, // The number of lines to draw
			length : 7, // The length of each line
			width : 5, // The line thickness
			radius : 12, // The radius of the inner circle
			corners : 1, // Corner roundness (0..1)
			rotate : 0, // The rotation offset
			color : '#000', // #rgb or #rrggbb
			speed : 1, // Rounds per second
			trail : 60, // Afterglow percentage
			shadow : false, // Whether to render a shadow
			hwaccel : true, // Whether to use hardware acceleration
			className : 'spinner', // The CSS class to assign to the spinner
			zIndex : 2e9, // The z-index (defaults to 2000000000)
			top : 'auto', // Top position relative to parent in px
			left : '130px' // Left position relative to parent in px);
		});
		$.ajax({
			url : "php/object.php",
			async : true,
			beforeSend : function(xhr) {
				spinner = spinner.spin(target);
				$('#message_board').fadeIn(100);
			},
			dataType : "json",
			success : function(data) {
				if (data.status) {
					sys.graft(data);
					eventHandler();
					spinner.stop();
					$('#message_board').fadeOut(500);
					system.draw();
				} else {
					alert('别想悄悄的进村！请登录');
					window.location = 'index.html';
				}
			},
			error : function(jqXHR, message) {
				console.log(message);
			}
		})
		//初始画面

	}

	system.geometry = new geometry();
	//捕捉
	system.capture = function(objects, point, distance) {

		var captured = {
			nodes : [],
			edges : [],
			fans : []
		};

		//捕捉算法
		var node_capture = function(n, p, d) {
			var dis = system.geometry.pointDistance(system.toScreen(n.coord), p);
			if (dis <= d) {
				return d;
			} else {
				return false;
			}
		}
		var edge_capture = function(e, p, d) {
			var dis = system.geometry.PLDistance(p, system.toScreen(e.getLine(system.data.nodes)));
			if (dis <= d) {
				return d;
			} else {
				return false;
			}
		}
		var fan_capture = function(f, p, d) {
			var dis = system.geometry.pointDistance(system.toScreen(f.coord), p);
			if (dis <= d) {
				return d;
			} else {
				return false;
			}
		}
		for (var element in objects) {
			var obj = objects[element];
			if (element == "nodes") {
				var dis = distance ? distance : system.parameter.track.defaultNode;
				var p = point ? point : mouse_position;
				var nodes = obj.getArray();
				var tracks = new Array();
				for (var i in nodes) {
					if (node_capture(nodes[i], p, dis)) {
						tracks.push(nodes[i]);
					}
				}
				captured.nodes = tracks;
			}
			if (element == "edges") {
				var dis = distance ? distance : system.parameter.track.defaultEdge;
				var p = point ? point : mouse_position;
				var edges = obj.getArray();
				var tracks = new Array();
				for (var i in edges) {
					if (edge_capture(edges[i], p, dis)) {
						tracks.push(edges[i]);
					}
				}
				captured.edges = tracks;
			}
			if (element == "fans") {
				var dis = distance ? distance : system.parameter.track.defaultFan;
				var p = point ? point : mouse_position;
				var fans = obj.getArray();
				var tracks = new Array();
				for (var i in fans) {
					if (fan_capture(fans[i], p, dis)) {
						tracks.push(fans[i]);
					}
				}
				captured.fans = tracks;
			}
		}
		return captured;
	}

	system.boundCheck = function() {
		var co = system.toSystem(new JLCoord());
		if (co.x < 0)
			system.position.x = 0;
		if (co.y < 0)
			system.position.y = 0;
		co = system.toSystem(new JLCoord(canvas.width, canvas.height));
		var zoom = system.parameter.zoom;
		if (co.x > zoom.maxWidth)
			system.position.x = zoom.maxWidth - canvas.width * system.scale;
		if (co.y > zoom.maxHeight)
			system.position.y = zoom.maxHeight - canvas.height * system.scale;
		//system.position.parseInt();
	}

	system.zoomIn = function(co) {

		//动态缩放
		if (system.timer.getZoomStatus()) {
			return;
		} else {
			system.timer.zoom();
		}

		if (co === undefined) {
			co = new JLCoord(canvas.width / 2, canvas.height / 2);
		}
		var point = system.toSystem(co);
		var zoom = system.parameter.zoom;
		if (zoom.index > zoom.minIndex) {
			system.scale = zoom.array[--zoom.index];
			system.position.x = point.x - co.x * system.scale;
			system.position.y = point.y - co.y * system.scale;
		}
		system.boundCheck();
		system.draw();
		click.change();
	}
	system.zoomOut = function(co) {

		//动态缩放
		if (system.timer.getZoomStatus()) {
			return;
		} else {
			system.timer.zoom();
		}

		if (co === undefined) {
			co = new JLCoord(canvas.width / 2, canvas.height / 2);
		}
		var point = system.toSystem(co);
		var zoom = system.parameter.zoom;
		if (zoom.index < zoom.maxIndex) {
			system.scale = zoom.array[++zoom.index];
			system.position.x = point.x - co.x * system.scale;
			system.position.y = point.y - co.y * system.scale;
		}
		system.boundCheck();
		system.draw();
		click.change();
	}

	system.toScreen = function(arg) {
		if (!isNaN(arg)) {
			var num;
			num = arg / system.scale;
			return num;
		}

		if ( arg instanceof JLCoord) {
			var co = new JLCoord();
			co.x = (arg.x - system.position.x) / system.scale;
			co.y = (arg.y - system.position.y) / system.scale;
			return co;
		}
		if ( arg instanceof JLLine) {
			var point1 = system.toScreen(arg.point1);
			var point2 = system.toScreen(arg.point2);
			var line = new JLLine(point1, point2);
			return line;
		}
		if ( arg instanceof JLCircle) {
			var co = system.toScreen(arg.center);
			var radius = system.toScreen(arg.radius);
			return new JLCircle(co, radius);
		}
	}
	//转换屏幕对象到系统对象
	system.toSystem = function(arg) {
		if (!isNaN(arg)) {
			var num;
			num = arg * system.scale;
			return num;
		}

		if ( arg instanceof JLCoord) {
			var co = new JLCoord();
			co.x = system.position.x + arg.x * system.scale;
			co.y = system.position.y + arg.y * system.scale;
			return co;
		}
		if ( arg instanceof JLLine) {
			var point1 = system.toSystem(arg.point1);
			var point2 = system.toSystem(arg.point2);
			var line = new JLLine(point1, point2);
			return line;
		}
	}
	//判断系统对象是否在屏幕内
	system.inScreen = function(arg) {
		if ( arg instanceof JLCoord) {
			var line = new JLLine(system.position, system.toSystem(canvas.width, canvas.height));
			return system.geometry.pointInRect(arg, line);
		}

		if ( arg instanceof JLLine) {
			if (system.inScreen(arg.point1) || system.inScreen(agr.point2)) {
				return true;
			} else {
				var point1 = system.position;
				var point2 = system.toSystem(canvas.width, canvas.height);
				var point3 = system.toSystem(0, canvas.height);
				var point4 = system.toSystem(canvas.width, 0);
				var cross1 = system.geometry.lineCross(line, new JLLine(point1, point2));
				var cross2 = system.geometry.lineCross(line, new JLLine(point3, point4));
				if (cross1 || cross2) {
					return true;
				}
			}
			return false;
		}
	}
	//判断相关图元
	system.getRelations = function(arg) {
		var obj = {
			node : [],
			edge : [],
			fan : []
		};
		if (arg.isA(JLFan)) {
			obj.fan.push(arg);
		}
		if (arg.isA(JLEdge)) {
			obj.edge.push(arg);
			obj.fan = system.data.fans.findByEdge(arg.ID);
			if (system.getEdgesRelated(arg.sNode).length == 1) {
				obj.node.push(system.data.nodes.find(arg.sNode));
			}
			if (system.getEdgesRelated(arg.eNode).length == 1) {
				obj.node.push(system.data.nodes.find(arg.eNode));
			}
		}
		if (arg.isA(JLNode)) {
			obj.node.push(arg);
			obj.edge = system.getEdgesRelated(arg.ID);
			for (i in obj.edge) {
				obj.node = obj.node.concat(system.getRelations(obj.edge[i]).node);
				obj.fan = obj.fan.concat(system.getRelations(obj.edge[i]).fan);
			}
		}
		return obj;
	}
	system.getEdgesRelated = function(nid) {
		var arr = [];
		var edges = system.data.edges.getArray();
		for (var i in edges) {
			if (edges[i].sNode == nid || edges[i].eNode == nid) {
				arr.push(edges[i]);
			}
		}
		return arr;
	}

	system.draw = function() {
		var paint = new JLCanvas("canvas_base", system);
		paint.clear();
		paint.begin();
		system.data.edges.eachDo(paint.drawEdge);
		system.data.edges.eachDo(paint.drawEdge, {
			pattern : new JLPattern(null, "#ffffff", system.toScreen(24), null, null)
		});

		system.data.edges.eachDo(paint.drawArrow);

		system.data.nodes.eachDo(paint.drawNode);
		system.data.fans.eachDo(paint.drawFan);
		system.data.gates.eachDo(paint.drawGate);
		/*
		 if (system.controller.draw_edge) {
		 drawReferenceLine();
		 }
		 */
		if (system.controller.capture_element) {
			drawCapture();
		}
		if (system.controller.draw_fan) {
			drawFan();
		}
		paint.close();
	}
}

function geometry() {
	var geo = this;
	var square = function(x) {
		return x * x;
	}
	//求线段长度
	this.lineLength = function(line) {
		var distance = square(line.point1.x - line.point2.x) + square(line.point1.y - line.point2.y);
		return Math.sqrt(distance);
	}
	//求两点间距离
	this.pointDistance = function(point1, point2) {
		var distance = square(point1.x - point2.x) + square(point1.y - point2.y);
		return Math.sqrt(distance);
	}
	//求线段中点
	this.middlePoint = function(line) {
		var x = (line.point1.x + line.point2.x) / 2;
		var y = (line.point1.y + line.point2.y) / 2;
		return new JLCoord(x, y);
	}
	//求点到线距离
	this.PLDistance = function(point, line) {
		var a = geo.pointDistance(line.point2, point);
		var b = geo.pointDistance(line.point1, point);
		var c = geo.lineLength(line);
		if (a == 0 || b == 0) {
			return 0;
		}
		if (c == 0) {
			return false;
		}
		if (square(a) >= square(b) + square(c)) {
			return b;
		}
		if (square(b) >= square(a) + square(c)) {
			return a;
		}
		var l = (a + b + c) / 2;
		//海伦公式求面积
		var s = Math.sqrt(l * (l - a) * (l - b) * (l - c));
		return 2 * s / c;
	}
	//求两线焦点, 不相交返回false
	this.lineCross = function(line1, line2) {
		// 三角形abc 面积的2倍
		var area_abc = (line1.point1.x - line2.point1.x) * (line1.point2.y - line2.point1.y) - (line1.point1.y - line2.point1.y) * (line1.point2.x - line2.point1.x);
		// 三角形abd 面积的2倍
		var area_abd = (line1.point1.x - line2.point2.x) * (line1.point2.y - line2.point2.y) - (line1.point1.y - line2.point2.y) * (line1.point2.x - line2.point2.x);
		// 面积符号相同则两点在线段同侧,不相交 (对点在线段上的情况,本例当作不相交处理);
		if (area_abc * area_abd >= 0) {
			return false;
		}
		// 三角形cda 面积的2倍
		var area_cda = (line2.point1.x - line1.point1.x) * (line2.point2.y - line1.point1.y) - (line2.point1.y - line1.point1.y) * (line2.point2.x - line1.point1.x);
		// 三角形cdb 面积的2倍
		// 注意: 这里有一个小优化.不需要再用公式计算面积,而是通过已知的三个面积加减得出.
		var area_cdb = area_cda + area_abc - area_abd;
		if (area_cda * area_cdb >= 0) {
			return false;
		}
		//计算交点坐标
		var t = area_cda / (area_abd - area_abc);
		var dx = t * (line1.point2.x - line1.point1.x), dy = t * (line1.point2.y - line1.point1.y);
		var cross = new JLCoord(line1.point1.x + dx, line1.point1.y + dy);
		return cross;
	}
	//求垂足
	this.pointLineCross = function(point, line) {
		var x0 = point.x, y0 = point.y;
		var x1 = line.point1.x, y1 = line.point1.y;
		var x2 = line.point2.x, y2 = line.point2.y;
		k = ((x0 - x1) * (x2 - x1) + (y0 - y1) * (y2 - y1)) / ((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
		var p = new JLCoord(x1 + k * (x2 - x1), y1 + k * (y2 - y1));

		if (geo.pointInRect(p, line)) {
			return p;
		}
		return null;
	}
	//获取已知线段平行线段,direction为0则为顺时针线，1为逆时针线，2为双线，返回两线数组
	this.getParallel = function(line, distance, direction) {
		var x1 = line.point1.x;
		var x2 = line.point2.x;
		var y1 = line.point1.y;
		var y2 = line.point2.y;
		var dx = distance;
		var x3 = (y2 - y1) * dx / Math.sqrt(square(x2 - x1) + square(y2 - y1));
		var y3 = (x1 - x2) * dx / Math.sqrt(square(x2 - x1) + square(y2 - y1));
		var x4 = (y1 - y2) * dx / Math.sqrt(square(x2 - x1) + square(y2 - y1));
		var y4 = (x2 - x1) * dx / Math.sqrt(square(x2 - x1) + square(y2 - y1));

		var points;
		point[0] = new JLCoord(x3 + x1, y3 + y1);
		point[1] = new JLCoord(x3 + x2, y3 + y2);
		point[2] = new JLCoord(x4 + x1, y4 + y1);
		point[3] = new JLCoord(x4 + x2, y4 + y2);
		var line = new Array(2);
		line[0] = new JLLine(point[0], point[1]);
		line[1] = new JLLine(point[2], point[3]);
		switch(direction) {
			case 0:
				return line[0];
				break;
			case 1:
				return line[1];
				break;
			case 2:
				return line;
				break;
			default:
				console.log("There is error");
				break;
		}
	}
	//求距已知点沿线距离点
	//rotate为旋转角
	this.pointAlongLine = function(point, line, distance, rotate) {
		rotate = rotate ? rotate : 0;
		var ang = (geo.gradient(line) + rotate) * Math.PI / 180;
		var x = point.x + Math.cos(ang) * distance;
		var y = point.y + Math.sin(ang) * distance;

		return new JLCoord(x, y);
	}
	//判断点是否在矩形区域内,line为对角线
	this.pointInRect = function(point, line) {
		var maxX = Math.max(line.point1.x, line.point2.x);
		var minX = Math.min(line.point1.x, line.point2.x);
		var maxY = Math.max(line.point1.y, line.point2.y);
		var minY = Math.min(line.point1.y, line.point2.y);
		if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) {
			return true;
		} else {
			return false;
		}
	}

	this.gradient = function(object, nodes) {
		var line;

		if (object._type) {
			if (object.isA(JLEdge)) {
				line = object.getLine();
			}
			if (object.isA(JLStructure)) {
				line = object.getEdge().getLine();
			}
		}
		if ( object instanceof JLLine) {
			line = object;
		}
		var x1 = line.point1.x;
		var x2 = line.point2.x;
		var y1 = line.point1.y;
		var y2 = line.point2.y;
		if (x1 == x2) {
			return y1 > y2 ? -90 : 90;
		}
		var tan = Math.atan2((y2 - y1), (x2 - x1));
		var angle = tan / Math.PI * 180;
		return angle;
	}
}

function JLCoord(x, y) {
	var co = this;
	if ( x instanceof Object) {
		co.x = parseFloat(x.x);
		co.y = parseFloat(x.y);
	} else {
		co.x = x ? parseFloat(x) : 0;
		co.y = y ? parseFloat(y) : 0;
	}
	this.set = function(x, y) {
		co.x = parseFloat(x);
		co.y = parseFloat(y);
	}
	this.parseInt = function() {
		co.x = parseInt(co.x);
		co.y = parseInt(co.y);
	}
	this.print = function() {
		console.log(co.x + "," + co.y);
	}
	this.equal = function(x, y) {
		if ( x instanceof Object) {
			return co.x == x.x && co.y == x.y
		}
		return co.x == x && co.y == y;
	}
}

function JLCoord3D(x, y, z) {
	var co = this;
	co.x = x ? x : 0;
	co.y = y ? y : 0;
	co.z = z ? z : 0;

}

function JLLine(point1, point2) {
	var line = this;
	line.point1 = point1;
	line.point2 = point2;
}

function JLCircle(center, radius) {
	var circle = this;
	circle.center = center;
	circle.radius = radius;
}

function JLCanvas(canvas_id, system) {
	var canvas = document.getElementById(canvas_id);
	var context = canvas.getContext('2d');

	var paint = this;
	this.screen = canvas;
	this.offset = new JLCoord(canvas.offsetLeft, canvas.offsetTop);
	this.width = canvas.width;
	this.height = canvas.height;
	this.print = function() {
		console.log(this.width + "," + this.height);
	}
	this.begin = function() {
		context.beginPath();
	}
	this.close = function() {
		context.closePath();
	}
	this.drawLine = function(line, pattern, opt) {
		context.beginPath();
		context.moveTo(line.point1.x, line.point1.y);
		context.lineTo(line.point2.x, line.point2.y);
		if (pattern === undefined) {
			pattern = new JLPattern();
		}
		pattern.set(context, opt);
		if (pattern.stroke) {
			context.stroke();
		}
		context.closePath();
	}
	this.drawCircle = function(circle, pattern) {
		context.moveTo(circle.center.x + circle.radius, circle.center.y);
		context.beginPath();
		context.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2, true);
		if (pattern === undefined) {
			pattern = new JLPattern();
		}
		pattern.set(context);
		if (pattern.stroke) {
			context.stroke();
		}
		if (pattern.fill) {
			context.fill();
		}
		context.closePath();
	}
	this.drawCircleArc = function(circle, start_angle, end_angle, clockwise, pattern, bottom) {
		context.moveTo(circle.center.x + circle.radius, circle.center.y);
		context.beginPath();
		context.arc(circle.center.x, circle.center.y, circle.radius, start_angle / 180 * Math.PI, end_angle / 180 * Math.PI, clockwise);
		if (bottom) {
			context.closePath();
		}

		if (pattern === undefined) {
			pattern = new JLPattern();
		}
		pattern.set(context);
		if (pattern.stroke) {
			context.stroke();
		}
		if (pattern.fill) {
			context.fill();
		}
		context.closePath();
	}

	this.drawArc = function(start_point, point1, point2, radius, pattern, bottom) {
		context.moveTo(start_point.x, start_point.y);
		context.beginPath();
		context.arcTo(point1.x, point1.y, point2.x, point2.y, radius);
		if (pattern === undefined) {
			pattern = new JLPattern();
		}
		pattern.set(context);
		if (pattern.stroke) {
			context.stroke();
		}
		if (pattern.fill) {
			context.fill();
		}
		context.closePath();
	}
	this.drawNode = function(node) {
		var pattern = node.pattern ? node.pattern : new JLPattern(true, "#666666", system.toScreen(2));
		var circle = system.toScreen(new JLCircle(node.coord, 10));
		paint.drawCircle(circle, pattern);
	}
	this.drawEdge = function(edge, args) {
		var pattern = edge.pattern ? edge.pattern : new JLPattern(null, "#00bfff", system.toScreen(30), true, "rgba(128,128,128,0.5)");
		var opt = null;
		if (args) {
			if (args.pattern) {
				pattern = args.pattern;
			}
			if (args.opt) {
				opt = args.opt;
			}
		}
		var line = system.toScreen(edge.getLine(system.data.nodes));
		paint.drawLine(line, pattern, opt);
	}

	this.drawEdgeInner = function(edge) {
		var pattern = edge.pattern ? edge.pattern : new JLPattern(null, "#00bfff", system.toScreen(30), true, "rgba(128,128,128,0.5)");

		var line = system.toScreen(edge.getLine(system.data.nodes));
		var opt = {
			lineCap : "butt",
			lineJoin : "butt"
		};
		paint.drawLine(line, pattern, opt);
		var pattern = edge.pattern ? edge.pattern : new JLPattern(null, "#ffffff", system.toScreen(24), null, null);
		paint.drawLine(line, pattern, opt);
	}
	this.drawFan = function(fan) {
		var diameter = 22;
		var pattern = fan.patternCircle ? fan.patternCircle : new JLPattern(true, "#4169E1", system.toScreen(3), true, "#F8F8FF");
		var circle = system.toScreen(new JLCircle(fan.coord, diameter));

		var d = diameter / 2 * Math.SQRT1_2;
		var alpha = system.timer.getFanAlpha(fan);
		alpha = (alpha == undefined ? 45 : alpha);
		var delta1 = diameter / 2 * Math.sin(Math.PI * alpha / 180);
		var delta2 = diameter / 2 * Math.cos(Math.PI * alpha / 180);

		var circle1 = system.toScreen(new JLCircle(new JLCoord(fan.coord.x - delta2, fan.coord.y - delta1), diameter / 2));
		var circle2 = system.toScreen(new JLCircle(new JLCoord(fan.coord.x - delta1, fan.coord.y + delta2), diameter / 2));
		var circle3 = system.toScreen(new JLCircle(new JLCoord(fan.coord.x + delta1, fan.coord.y - delta2), diameter / 2));
		var circle4 = system.toScreen(new JLCircle(new JLCoord(fan.coord.x + delta2, fan.coord.y + delta1), diameter / 2));
		paint.drawCircle(circle, pattern);

		var patternLeaf = fan.patternLeaf ? fan.patternLeaf : new JLPattern(true, "#C0C0C0", system.toScreen(2), true, "#A9A9A9");

		paint.drawCircleArc(circle1, alpha, alpha + 180, true, patternLeaf, true);
		paint.drawCircleArc(circle2, alpha - 90, alpha + 90, true, patternLeaf, true);
		paint.drawCircleArc(circle3, alpha + 90, alpha - 90, true, patternLeaf, true);
		paint.drawCircleArc(circle4, alpha + 180, alpha, true, patternLeaf, true);
	}

	this.drawGate = function(gate) {
		var diameter = 22;
		var pattern = gate.pattern ? gate.patter : new JLPattern(true, "#4169E1", system.toScreen(3), true, "#F8F8FF");
		var circle = system.toScreen(new JLCircle(gate.coord, diameter));
		var alpha = system.geometry.gradient(gate);
		paint.drawCircleArc(circle, alpha - 90, alpha + 90, true, pattern, true);
	}

	this.drawArrow = function(edge) {
		//var pattern = edge.pattern ? edge.pattern : new JLPattern(null, "#ffffff", system.toScreen(24), null, null);
		var line = system.toScreen(edge.getLine(system.data.nodes));
		var width = system.toScreen(10);
		var length = system.geometry.lineLength(line);
		if (width < 3 || length < 20) {
			return;
		}
		var pattern = new JLPattern(true, "#a9a9a9", 1, true, "#D3D3D3");
		var middlePoint = system.geometry.middlePoint(line);

		var point1 = system.geometry.pointAlongLine(middlePoint, line, sys.toScreen(5), 90);
		var point2 = system.geometry.pointAlongLine(middlePoint, line, sys.toScreen(5), 270);
		var alongPoint1 = system.geometry.pointAlongLine(middlePoint, line, sys.toScreen(15), 0);
		var alongPoint2 = system.geometry.pointAlongLine(middlePoint, line, sys.toScreen(15), 180);

		context.beginPath();
		context.moveTo(middlePoint.x, middlePoint.y);
		context.lineTo(point1.x, point1.y);
		context.lineTo(alongPoint1.x, alongPoint1.y);
		context.lineTo(point2.x, point2.y);
		context.lineTo(middlePoint.x, middlePoint.y);
		context.lineTo(alongPoint2.x, alongPoint2.y);
		pattern.set(context);
		if (pattern.stroke) {
			context.stroke();
		}
		if (pattern.fill) {
			context.fill();
		}
		context.closePath();

	}

	this.drawReferenceLine = function(line) {
		paint.clear();
		paint.drawLine(line, new JLPattern(true, "#a6a6a6", 1));
	}

	this.clear = function() {
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
}

function JLPattern(stroke, strokeColor, strokeWidth, fill, fillColor) {
	var pattern = this;
	this.stroke = stroke ? stroke : true;
	this.strokeColor = strokeColor ? strokeColor : " #000000";
	this.strokeWidth = strokeWidth ? strokeWidth : 1;
	this.fill = fill ? fill : false;
	this.fillColor = fillColor ? fillColor : " #ffffff";

	this.set = function(ctx, opt) {
		opt = opt ? opt : {
			lineCap : "round",
			lineJoin : "round"
		};

		ctx.lineCap = opt.lineCap;
		ctx.lineJoin = opt.lineJoin;

		ctx.lineWidth = pattern.strokeWidth;
		ctx.strokeStyle = pattern.strokeColor;
		ctx.fillStyle = pattern.fillColor;
	}
}

function JLObjectArray(data, type) {
	var array = new Array();
	var obj = this;
	var form = type;
	this.size = 0;
	this.add = function(element) {
		array[element.ID] = element;
		obj.size++;
	}
	for (var i in data) {
		var element = New(form, data[i]);
		obj.add(element);
	}

	this.type = function() {
		return type;
	}

	this.bind = function(datas) {
		array = [];
		for (var i in datas) {
			var element = New(form, datas[i]);
			obj.add(element);
		}
	}
	this.find = function(id) {
		var id = id;
		if (array[id]) {
			return array[id];
		} else
			return null;
	}

	this.findByEdge = function(id) {
		var arr = [];
		for (var i in array) {
			if (array[i].edge == id) {
				arr.push(array[i]);
			}
		}
		return arr;
	}

	this.set = function(id, data) {
		if (!data)
			return;
		if (data.isA(type)) {
			array[id] = data;
		} else {
			var element = New(form, data);
			array[id] = element;
		}
	}

	this.remove = function(id) {
		delete array[id];
	}

	this.each = function(fn) {
		//------
		//added foreach code for old ie and w3c standered

		if (!Array.prototype.forEach) {
			Array.prototype.forEach = function(fun, thisp) {
				var len = this.length;
				if ( typeof fun != "function")
					throw new TypeError();

				var thisp = arguments[1];
				for (var i = 0; i < len; i++) {
					if ( i in this)
						fun.call(thisp, this[i], i, this);
				}
			}
		}

		//-----
		array.forEach(fn);
	}
	this.getArray = function() {
		return array;
	}
	this.eachDo = function(fn, args) {
		for (var id in array) {
			fn.call(array[id], array[id], args);
		}
	}
}

//图元类
var JLMetaFile = Class(object, {
	_create : function(data) {
		this.ID = data.ID;
		this.AuthKey = data.AuthKey;
		this.name = data.name;
	},
	setSys : function(sys) {
		this.sys = sys;
	},
	getSys : function() {
		return this.sys;
	},
	create : function(data) {
		var method = "create";
		var obj = data ? New(type, data) : this;
		JLRequest(method, obj, true);
	},
	update : function(data) {
		var method = "update";
		var obj = data ? New(type, data) : this;
		JLRequest(method, obj, true);
	},
	remove : function(data) {
		var method = "delete";
		var obj = data ? New(type, data) : this;
		JLRequest(method, obj, true);
	}
})

var JLNode = Class(JLMetaFile, {
	_create : function(data) {
		JLMetaFile._create.call(this, data);
		this.coord = new JLCoord(data.coord);
	},
	create : function(data) {
		var method = "create";
		var obj = data ? New(type, data) : this;
		var result = JLRequest(method, obj, false);
		return New(JLNode, result);
	}
})

//Edge类
var JLEdge = Class(JLMetaFile, {
	_create : function(data) {
		JLMetaFile._create.call(this, data);
		this.sNode = data.sNode;
		this.sNodeAuthKey = data.sNodeAuthKey;
		this.eNode = data.eNode;
		this.eNodeAuthKey = data.eNodeAuthKey;
		this.R = data.R;
		this.Q0 = data.Q0;
		this.Q = data.Q;
		this.H = data.H;
	},
	getLine : function(nodes) {
		nodes = nodes ? nodes : this.getSys().data.nodes;
		return new JLLine(nodes.find(this.sNode).coord, nodes.find(this.eNode).coord);
	}
})

//构造物类
var JLStructure = Class(JLMetaFile, {
	_create : function(data) {
		JLMetaFile._create.call(this, data);
		this.edge = data.edge;
		this.edgeAuthKey = data.edgeAuthKey;
		this.coord = new JLCoord(data.coord);
	},
	getEdge : function() {
		return this.getSys().data.edges.find(this.edge);
	}
})
var JLGate = Class(JLStructure, {
	_create : function(data) {
		JLStructure._create.call(this, data);
		this.R = data.R;
	}
})

//风机类的曲线
function JLFanA(data) {
	this.a0 = data.a0;
	this.a1 = data.a1;
	this.a2 = data.a2;
}

var JLFan = Class(JLStructure, {
	_create : function(data) {
		JLStructure._create.call(this, data);
		this.Q = data.Q;
		this.H = data.H;
		this.A = data.A ? new JLFanA(data.A) : new JLFanA({});
	}
})

function JLParameter(type) {
	var url;
	switch(type) {
		case JLNode:
			url = 'php/node.php';
			break;
		case JLEdge:
			url = 'php/edge.php';
			break;
		case JLFan:
			url = 'php/fan.php';
			break;
		case JLGate:
			url = 'php/gate.php';
			break;
		default:
			break;
	}
	var param = {
		url : url
	};
	return param;
}

function JLRequest(method, obj, sync, dataType) {
	var url = JLParameter(obj._type()).url;
	//生成请求json
	var request = {
		"method" : method,
		"data" : obj
	}
	var json_text = JSON.stringify(request);
	var postArray = {
		json : json_text
	};
	//返回格式
	var return_type = dataType ? dataType : "json";
	//结果
	var result;
	console.log(postArray);
	$.ajax({
		async : sync,
		url : url,
		type : "POST",
		data : postArray,
		dataType : return_type,
		success : function(data) {
			console.log("return:", data);
			result = data;
			if (sync) {
				if (result.status) {
					element = New(obj._type(), result.data);
					ajaxHandler(method, element);
				} else {
					console.log('error:' + result.message)
				}
			}

		},
		error : function(jqXHR, text) {
			console.log("Wrong:" + text);
			result = false;
		}
	})
	if (!sync) {
		return result.data;
	}
}

function ajaxHandler(method, object) {
	var system = object.getSys();
	var objectArray;
	for (var t in system.data) {
		if (system.data[t].type() == object._type()) {
			objectArray = system.data[t];
		}
	}
	switch(method) {
		case 'create':
			objectArray.add(object);
			break;
		case 'update':
			objectArray.set(object.ID, object);
			break;
		case 'delete':
			objectArray.remove(object.ID);
			break;
		default:
			break;
	}
	system.draw();
}

function UpladFile(url) {
	var fileObj = document.getElementById('file').files[0];
	// js 获取文件对象
	var FileController = url;
	// 接收上传文件的后台地址

	// FormData 对象
	var form = new FormData();
	form.append("author", "test");
	// 可以增加表单数据
	form.append("file", fileObj);
	// 文件对象

	// XMLHttpRequest 对象
	var xhr = new XMLHttpRequest();
	xhr.open("post", FileController, true);
	xhr.responseType = 'text';
	xhr.onload = function() {
		if (this.status == 200) {
			console.log(this.response);
			var result = JSON.parse(this.response);
			if (result.status) {
				$('#progressBar').hide();
				$('#percentage').hide();
				alert('DXF文件上传完成，系统即将重新加载!');
				sys.init();
			} else {
				console.log('error:' + result.message)
			}
		}
	};
	xhr.upload.addEventListener("progress", progressFunction, false);
	xhr.send(form);
}

function progressFunction(evt) {
	$('#progressBar').show();
	$('#percentage').show();
	var progressBar = document.getElementById("progressBar");
	var percentageDiv = document.getElementById("percentage");
	if (evt.lengthComputable) {
		console.log(evt.total + "loaded: " + evt.loaded);
		progressBar.max = evt.total;
		progressBar.value = evt.loaded;
		percentageDiv.innerHTML = Math.round(evt.loaded / evt.total * 100) + "%";
	}
}

function JLTimer() {
	var zoom = false;
	this.zoom = function() {
		if (zoom) {
			return;
		} else {
			zoom = true;
			zoom_reset();
		}
	}
	this.getZoomStatus = function() {
		return zoom;
	}
	var zoom_reset = function() {
		setTimeout(function() {
			zoom = false
		}, 400);
	}
	var fan_alpha = new Array();
	var fan_timer = new Array();
	var fan_status = new Array();

	//获取风机的运行状态 1/2为运行，0为停机
	this.getFanStatus = function(fan) {
		if (!fan_status[fan.ID]) {
			return 0;
		} else
			return fan_status[fan.ID];
	}
	// clockwise为方向 true为顺时针，false为逆时针
	this.startFan = function(fan, clockwise, rpm) {
		var canvas = new JLCanvas("canvas_animate", sys);
		if (!fan_timer[fan.ID]) {
			fan_alpha[fan.ID] = 0;
			var wise = rpm ? rpm : 1;

			if (clockwise) {
				fan_status[fan.ID] = 2;
				//顺时针
				wise = -1 * wise;
			} else {
				fan_status[fan.ID] = 1;
				//逆时针
				wise = wise;
			}

			fan_timer[fan.ID] = window.setInterval(function() {
				canvas.clear();
				fan_alpha[fan.ID] = fan_alpha[fan.ID] + wise * 6;
				canvas.drawFan(fan);
			}, 33.3);
		}
	}
	this.stopFan = function(fan) {
		var canvas = new JLCanvas("canvas_animate", sys);
		if (fan_status[fan.ID]) {
			fan_status[fan.ID] = 0;
			fan_alpha[fan.ID] = undefined;
			window.clearInterval(fan_timer[fan.ID]);
			fan_timer[fan.ID] = undefined;
			canvas.clear();
			sys.draw();
		}
	}

	this.getFanAlpha = function(fan) {
		return fan_alpha[fan.ID];
	}
}



$('#zoomIn').click(function() {
	sys.zoomIn();
});
$('#zoomOut').click(function() {
	sys.zoomOut();
});

$('#drawE').click(function() {
	//sys.controller.drawEdge();
	sys.controller.drawOn(JLEdge);
});

$('#drawF').click(function() {
	sys.controller.drawOn(JLFan);
});

$('#drawG').click(function() {
	sys.controller.drawOn(JLGate);
});
//var edge;
$('#capture').click(function() {
	sys.controller.capture();
});

$('#band').click(function() {
	messageband('成功', '已成功加载', 'info');
});



$('#test').click(function() {
	var gate = New(JLGate, {
		ID : 9,
		coord : new JLCoord(1167, 361),
		edge : 28
	});
	sys.data.gates.add(gate);
});

$('#test1').click(function() {
	var gate = New(JLGate, {
		ID : 9,
		coord : new JLCoord(1167, 361),
		edge : 28
	});
	sys.timer.stopFan(fan);
});

$('#reset').click(function() {
	if (confirm("确定重置数据？所有数据将被删除")) {
		$.ajax({
			url : "php/reset.php",
			async : true,
			dataType : "json",
			success : function(data) {
				if (data.status) {
					sys.init();
					console.log("reset!");
				} else {
					console.log("Error:" + data.message.toString());
				}
			},
			error : function(jqXHR, message) {
				console.log(message);
			}
		})
	} else {
		console.log("cancel");
	}
});

$('#network_calculate').click(function() {
	console.log('cal');
	$.ajax({
		url : "php/cal.php",
		async : true,
		dataType : "json",
		success : function(data) {
			console.log(data);
			if (data.status == 1) {
				sys.regraft({
					edges : data.Edge
				});
				alert("网络解算完成 请查看数据");
			} else {
				alert("数据有误，无法计算");
			}
		},
		error : function(jqXHR, message) {
			console.log(message);
		}
	})
})


var sys = new JLsystem("canvas1");

sys.init();
