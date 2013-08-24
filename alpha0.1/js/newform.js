// Serialize forms to JSON
(function($) {
	$.fn.serializeObject = function() {

		var self = this, json = {}, push_counters = {}, patterns = {
			"validate" : /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
			"key" : /[a-zA-Z0-9_]+|(?=\[\])/g,
			"push" : /^$/,
			"fixed" : /^\d+$/,
			"named" : /^[a-zA-Z0-9_]+$/
		};

		this.build = function(base, key, value, type) {
			base[key] = value;
			return base;
		};

		this.push_counter = function(key) {
			if (push_counters[key] === undefined) {
				push_counters[key] = 0;
			}
			return push_counters[key]++;
		};

		$.each($(this).serializeArray(), function() {

			// skip invalid keys
			if (!patterns.validate.test(this.name)) {
				return;
			}

			var k, keys = this.name.match(patterns.key), merge = this.value, reverse_key = this.name, type = this.type;

			while (( k = keys.pop()) !== undefined) {

				// adjust reverse_key
				reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

				// push
				if (k.match(patterns.push)) {
					merge = self.build([], self.push_counter(reverse_key), merge, type);
				}

				// fixed
				else if (k.match(patterns.fixed)) {
					merge = self.build([], k, merge, type);
				}

				// named
				else if (k.match(patterns.named)) {
					merge = self.build({}, k, merge, type);
				}
			}

			json = $.extend(true, json, merge);
		});

		return json;
	};
})(jQuery);

var formClassName;
var formType;
function fillDataForm(data) {

	$('.panel').hide();

	var type = [{
		cname : JLEdge,
		name : "edge",
		hname : "巷道"
	}, {
		cname : JLNode,
		name : "node",
		hname : "节点"
	}, {
		cname : JLFan,
		name : "fan",
		hname : "风机"
	}, {
		cname : JLGate,
		name : "gate",
		hname : "构筑物"
	}];
	//数据空
	if (data === null) {
		return;
	}

	for (var i in type) {
		if (data.isA(type[i].cname)) {
			formType = type[i];
			formClassName = "." + type[i].name;
			$('.panel-title' + formClassName).html(type[i].hname)
		}
	}
	$.each($('input' + formClassName), function() {
		$(this).val('');
	});

	for (var i in data) {
		var name = i;

		if ( typeof (data[i]) == "object") {
			for (var j in data[i]) {
				jqstring = "[" + j + "]";
				var jqstring = 'input' + formClassName + '[name = "' + i + '[' + j + ']"]';
				$(jqstring).val(data[i][j]);
			}
		} else {
			var jqstring = 'input' + formClassName + '[name = "' + i + '"]';
			$(jqstring).val(data[i]);
		}
	}

	if (data.isA(JLEdge)) {
		$('#edge-length').val(sys.geometry.lineLength(data.getLine()).toFixed(2));
	}
	if (data.isA(JLFan)) {
		switch(sys.timer.getFanStatus(data)) {
			case 0:
				$('#fan-control').bootstrapSwitch('setState', false);
				break;
			default:
				$('#fan-control').bootstrapSwitch('setState', true);
				break;
		}
	}

	$(".panel" + formClassName).slideDown();
	$(".input-number").trigger('input');
}

fillDataForm(null);

$('#bugReportSend').click(function() {
	var json_text = $('#bugDetail').val();
	var postArray = {
		bug : json_text
	};
	//返回格式
	var return_type = "json";
	$.ajax({
		async : true,
		url : 'php/bug.php',
		type : "POST",
		data : postArray,
		dataType : return_type,
		beforeSend : function() {
			$('#bugReport').modal('hide');
		},
		success : function(data) {
			console.log("return:", data);
			var content = alertMessage(data.status, data.message);
		},
		error : function(jqXHR, text) {
			console.log("Wrong:" + text);
		}
	})
});

$('#edge-reverse').click(function() {
	var form = $('form' + formClassName);
	var edge = New(JLEdge, form.serializeObject());
	var temp;
	temp = edge.sNode;
	edge.sNode = edge.eNode;
	edge.eNode = temp;
	temp = edge.sNodeAuthKey;
	edge.sNodeAuthKey = edge.eNodeAuthKey;
	edge.eNodeAuthKey = temp;
	edge.update();
});

$('button.update').click(function() {
	var form = $('form' + formClassName);
	var element = New(formType.cname, form.serializeObject());
	element.update();
	return false;
});

$('button.delete').click(function() {
	var form = $('form' + formClassName);
	var element = New(formType.cname, form.serializeObject());
	sys.controller.draw_delete = element;
	sys.draw();
	var alert = alertMessage(11, '确认删除？<br/> 此操作将会删除所有红色元素!', '<p><button id="confirm-delete" class="btn btn-danger">确定</button> <button id="cancel-delete" class="btn btn-warning">取消</button></p>')
	$('#cancel-delete').click(function() {
		$(alert).alert('close');
	});
	$('#confirm-delete').click(function() {
		sys.del(element);
		$(alert).alert('close');
	});
	//警告框关闭时清除画布
	$(alert).bind('closed.bs.alert', function() {
		var paint = new JLCanvas("canvas_drawing", sys);
		paint.clear();
		sys.controller.draw_delete = null;
	});

	return false;
})

$('#fan-control').on('switch-change', function(e, data) {
	/*
	 var $el = $(data.el)
	 , value = data.value;
	 console.log(e, $el, value);
	 */
	var form = $('form' + formClassName);
	var fan = New(formType.cname, form.serializeObject());

	switch(sys.timer.getFanStatus(fan)) {
		case 0:
			sys.timer.startFan(fan);
			break;
		default:
			sys.timer.stopFan(fan);
			break;
	}
});

function alertMessage(status, message, buttons) {
	var style = "";
	var disapear = false;
	var heading = "";
	var button = buttons ? buttons : "";

	switch(status) {
		case 0:
			style = 'alert-danger';
			heading = '警告'
			break;
		case 1:
			return;
		case 2:
			style = 'alert-info';
			heading = '提示';
			disapear = 2000;
			break;
		case 3:
			style = 'alert-success';
			heading = '成功';
			disapear = 2000;
			break;
		case 4:
			style = 'alert-danger';
			heading = '提示';
			disapear = 3000;
			break;
		case 10:
			style = 'alert-danger';
			heading = '错误';
			break;
		case 11:
			heading = '警告';
			break;
		case 12:
			style = 'alert-success';
			heading = '成功';
			break;
		default:
			return;
	}

	var content = document.createElement('div');
	$(content).append('<a class="close" data-dismiss="alert">&times;</a>' + '<p><strong>' + heading + '</strong></p>' + '<p>' + message + '</p>' + button)

	$(content).addClass('alert fade ' + style);
	$('#alerts').append(content);
	$(content).addClass('in');
	$(content).on('disapear', function() {
		$(this).alert('close');
	});
	if (disapear) {
		$.timer(disapear, function() {
			$(content).triggerHandler('disapear');
		}, true);
	}
	$('#redrawEdge').click(function() {
		$(this).parent().parent().alert('close');
		sys.controller.drawOn(JLEdge);
	});
	return content;
}
