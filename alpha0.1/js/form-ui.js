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

function fillDataForm(data) {
	$.each($('p.attribute > input'), function() {
		$(this).val(null);
	});
	$('.notif').hide();
	$('div.particular').hide();
	if (data === null) {
		$('#data_wrapper').slideUp("slow");
		return;
	}
	$('#update').unbind('click');
	$('#delete').unbind('click');
	$('#fan_control_off').unbind('click');
	$('#fan_control_on').unbind('click');
	if (data.isA(JLFan)) {
		$('form.element').hide(0);
		form = $('form.fan');
		$('.fan.switch').show();
		switch(sys.timer.getFanStatus(data)) {
			case 0:
				$('#fan_control_off').attr("checked", true);
				$('#fan_control_on').attr("checked", false);
				break;
			default:
				$('#fan_control_on').attr("checked", true);
				$('#fan_control_off').attr("checked", false);
				break;
		}

		$('p.attribute > input.fan[name = "ID"]').val(data.ID);
		$('p.attribute > input.fan[name = "AuthKey"]').val(data.AuthKey);
		$('p.attribute > input.fan[name = "edge"]').val(data.edge);
		$('p.attribute > input.fan[name = "edgeAuthKey"]').val(data.edgeAuthKey);

		$('p.attribute > input.fan[name = "coord[x]"]').val(data.coord.x);
		$('p.attribute > input.fan[name = "coord[y]"]').val(data.coord.y)

		$('p.attribute > input.fan[name = "name"]').val(data.name);
		$('p.attribute > input.fan[name = "Q"]').val(data.Q);
		$('p.attribute > input.fan[name = "H"]').val(data.H);
		$('p.attribute > input.fan[name = "A[a0]"]').val(data.A.a0);
		$('p.attribute > input.fan[name = "A[a1]"]').val(data.A.a1);
		$('p.attribute > input.fan[name = "A[a2]"]').val(data.A.a2);

		$('#update').click(function() {
			var fan = New(JLFan, form.serializeObject());
			fan.update();
		})

		$('#delete').click(function() {
			if (confirm("确定删除风机？")) {
				var fan = New(JLFan, form.serializeObject());
				fan.remove();
			}
		})

		$('#fan_control_off').click(function() {
			sys.timer.stopFan(data);
		});
		$('#fan_control_on').click(function() {
			sys.timer.startFan(data);
		});

	}
	if (data.isA(JLNode)) {
		$('form.element').hide(0);

		form = $('form.node');

		$('p.attribute > input.node[name = "ID"]').val(data.ID);
		$('p.attribute > input.node[name = "AuthKey"]').val(data.AuthKey);
		$('p.attribute > input.node[name = "coord[x]"]').val(data.coord.x);
		$('p.attribute > input.node[name = "coord[y]"]').val(data.coord.y);
		$('p.attribute > input.node[name = "name"]').val(data.name);
		$('#update').click(function() {
			var node = New(JLNode, form.serializeObject());
			node.update();
		})
	}
	if (data.isA(JLEdge)) {
		$('form.element').hide(0);

		form = $('form.edge');
		$('p.attribute > input.edge[name = "ID"]').val(data.ID);
		$('p.attribute > input.edge[name = "AuthKey"]').val(data.AuthKey);

		$('p.attribute > input.edge[name = "sNode"]').val(data.sNode);
		$('p.attribute > input.edge[name = "sNodeAuthKey"]').val(data.sNodeAuthKey);
		$('p.attribute > input.edge[name = "eNode"]').val(data.eNode);
		$('p.attribute > input.edge[name = "eNodeAuthKey"]').val(data.eNodeAuthKey);

		$('input.edge[name = "name"]').val(data.name);
		$('p.attribute > input.edge[name = "R"]').val(data.R);
		$('p.attribute > input.edge[name = "Q0"]').val(data.Q0);
		$('p.attribute > input.edge[name = "Q"]').val(data.Q);
		$('p.attribute > input.edge[name = "H"]').val(data.H);
		$('#update').click(function() {
			var edge = New(JLEdge, form.serializeObject());
			edge.update();
		})
	}
	form.show(0);
	$('#data_wrapper').slideDown();
}

function messageband(topic, message, type) {
	$('.message-band').addClass(type);
	$('.message-band > h3').html(topic);
	$('.message-band > p').html(message);
	$('.message-band').slideDown().delay(800).slideUp();
}

