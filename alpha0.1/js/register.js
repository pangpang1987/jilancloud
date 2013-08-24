$(function() {
	$("button").button();

/*
	$("body").bind('keyup', function(event) {
		if (event.keyCode == 13) {
			$("#join").click();
		}
		
	});
*/
	/*	REGISTER ERROR DISPLAY */
	$("#join").click(function() {
		if ($("#username").val() == "" || $("#email").val() == "" || $("#password").val() == "" || $("#password_confirm").val() == "" || $("#fname").val() == "" || $("#lname").val() == "") {
			$("#register_error").html("请确认所有数据均已输入");
			$("#register_error").fadeIn().delay("1000").fadeOut();
		} else if (!isName($("#username").val())) {
			$("#register_error").html("用户名无效。必须使用字母及数字,5-18个字符之间");
			$("#register_error").fadeIn().delay("1000").fadeOut();
		} else if (!isLong($("#username").val())) {
			$("#register_error").html("用户名必须长达5个字母");
			$("#register_error").fadeIn().delay("1000").fadeOut();
		} else if (isNameOccupied($("#username").val())) {
			$("#register_error").html("这个用户已被使用");
			$("#register_error").fadeIn().delay("1000").fadeOut();
		} else if (!isEmail($("#email").val())) {
			$("#register_error").html("无效的Email地址");
			$("#register_error").fadeIn().delay("1000").fadeOut();
		} else if (!isPassword($("#password").val())) {
			$("#register_error").html("无效的密码");
			$("#register_error").fadeIn().delay("1000").fadeOut();
		} else if (!isLong($("#password").val())) {
			$("#register_error").html("密码不够长 (5-18 字符)");
			$("#register_error").fadeIn().delay("1000").fadeOut();
		} else if ($("#password_confirm").val() != $("#password").val()) {
			$("#register_error").html("请确认两次密码输入相同");
			$("#register_error").fadeIn().delay("1000").fadeOut();
		} else {
			$("#register_error").html("正在注册 请稍后");
			$("#register_error").css("background-color", "#b7f691");
			$("#register_error").css("color", "#46bb00");
			$("#register_error").css("border", "1px solid #58d110");
			$("#register_error").fadeIn("slow").delay("1000").fadeOut("slow");

			var form_data = $('#fields').serialize();
			$.ajax({
				async : true,
				url : "php/register.php",
				type : "POST",
				data : form_data,
				dataType : "json",
				success : function(data) {
					console.log("return:", data);
					if (data.status) {
						$("#register_error").html("注册成功 即将跳转");
						$("#register_error").fadeIn("slow").delay("500");
						window.location.href = data.url;
					} else {
						$("#register_error").css("background-color", "#ffafaf");
						$("#register_error").css("color", "#b41919");
						$("#register_error").css("border", "1px solid #da2525");

						$("#register_error").html(data.message);
						$("#register_error").fadeIn("slow").delay("1000").fadeOut();
					}
				},
				error : function(jqXHR, text) {
					$("#register_error").css("background-color", "#ffafaf");
					$("#register_error").css("color", "#b41919");
					$("#register_error").css("border", "1px solid #da2525");
					$("#register_error").html("服务器错误");
					$("#register_error").fadeIn("slow").delay("1000").fadeOut();
				}
			})

		}
	});

});

function isEmail(strEmail) {

	if (!strEmail.length)
		return true;
	if (strEmail.search(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/) != -1)
		return true;
	else {
		warning = true;
		return false;
	}
}

function isName(strName) {
	//alert(strName);
	if (!strName.length)
		return true;
	if (strName.search(/^[A-Za-z][A-Za-z0-9]{4,17}$/) != -1 && isLong(strName))
		return true;
	else {
		if (!isLong(strName))
			return true;
	}
	warning = true;
	return false;
}

function isNameOccupied(strName) {

	/*
	 $.ajax({
	 async : true,
	 url : "php/register.php",
	 type : "POST",
	 data : form_data,
	 dataType : "json",
	 success : function(data) {
	 console.log("return:", data);
	 if (data.status) {
	 $("#register_error").html("注册成功 即将跳转");
	 $("#register_error").fadeIn("slow").delay("500");
	 window.location.href = data.url;
	 } else {
	 $("#register_error").html(data.message);
	 $("#register_error").fadeIn("slow").delay("1000").fadeOut();
	 }
	 },
	 error : function(jqXHR, text) {
	 console.log("Wrong:" + text);
	 result = false;
	 }
	 })
	 */
	if (strName == "a1234") {
		warning = true;
		return true;
	}

	return false;
}

function isPassword(str) {
	if (str != $("#name").val() || str.length == 0)
		return true;
	warning = true;
	return false;
}

function isPasswordOccupied(str) {
	if (str != $("#password").val() || str.length == 0)
		return true;
	else {
		warning = true;
		return false;
	}
}

var warning = false;
var minlength = 5;
var maxlength = 18;
function isLong(str) {
	if (!str.length)
		return true;
	if (str.length < minlength || str.length > maxlength) {
		warning = true;
		return false;
	}
	return true;
}
