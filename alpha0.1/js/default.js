$(function() {
	$('#loginButton').button();
	$('#joinButton').button();

	
	$('#joinButton').click(function(){	
		window.location.href = 'register.html';
	});
	$('#loginButton').click(function() {
		var form_data = $('#login').serialize();
		$.ajax({
			async : true,
			url : "php/login.php",
			type : "POST",
			data : form_data,
			dataType : "json",
			success : function(data) {
				console.log(data);
				if (data.status) {
					$("#login_status").css("background-color", "#b7f691");
					$("#login_status").css("color", "#46bb00");
					$("#login_status").css("border", "1px solid #58d110");
					$("#login_status").html("登录成功 即将跳转");
					$("#login_status").fadeIn("slow").delay("800").fadeOut();
					var url = function() {
						window.location.href = data.data.url;
					}
					setTimeout(url,1000);
				} else {
					$("#login_status").html(data.message);
					$("#login_status").fadeIn("slow").delay("1000").fadeOut();
				}
			},
			error : function(jqXHR, text) {
				console.log(text);
				$("#login_status").css("background-color", "#ffafaf");
				$("#login_status").css("color", "#b41919");
				$("#login_status").css("border", "1px solid #da2525");
				$("#login_status").html("服务器错误");
				$("#login_status").fadeIn("slow").delay("1000").fadeOut();
			}
		})
	});
});
