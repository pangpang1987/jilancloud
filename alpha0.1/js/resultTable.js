function fillTable(){
	var edges = sys.data.edges.getArray();
	$('#resultTable').html('');
	$('#resultTable').append('<thead><tr><th>序号</th><th>名称</th><th>解算值</th></tr></thead>');
	
	var tbody = document.createElement('tbody');	
	var index = 0;
	for(var i in edges){
		index++;
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		$(td).html(index);
		$(tr).append($(td));
		td = document.createElement('td');
		$(td).html(edges[i].name);
		$(tr).append($(td));
		td = document.createElement('td');
		$(td).html(edges[i].Q);
		$(tr).append($(td));
		$(tbody).append(tr);
	}
	$('#resultTable').append(tbody);
}


