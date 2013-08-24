

//文件名赋值
$('#lefile').change(function() {
	$('#DXFFileName').val(document.getElementById('lefile').files[0].name);
});
$('#uploadDXFFile').click(function() {
	var fileObj = document.getElementById('lefile').files[0];
	if (fileObj) {
		$('#uploadDXF').modal('hide');
		$('#uploading').modal('toggle');
	}
});

$(".input-number").bind('input', function() {
	if ($(this).val() == ""|| $(this).val() == "0") {
		$(this).parent().removeClass('has-error has-success');
	} else {
		if (isNaN($(this).val())) {
			$(this).parent().removeClass('has-success').addClass('has-error');
		} else {
			$(this).parent().removeClass('has-error').addClass('has-success');
		}
	}
});


$('#network-calculate').click(function() {
	console.log('cal');
	$.ajax({
		url : "php/cal.php",
		async : true,
		dataType : "json",
		success : function(data) {
			console.log(data);
			
			var result = data;
			if (result.status != 0) {
				sys.regraft({
					edges : result.data
				});
				sys.draw();
				alertMessage(data.status,"网络解算完成 请查看数据!");
			} else {
				alertMessage(data.status,"数据有误，无法计算");
			}
			
			
		},
		error : function(jqXHR, message) {
			console.log(message);
		}
	})
})

