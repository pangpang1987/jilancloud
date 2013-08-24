<?php
require_once 'gate.inc.php';
require_once 'status.inc.php';

session_start();
if(isset($_SESSION['project_ID'])){
	$pid = $_SESSION['project_ID'];
}else{
	error('Session Error');
}


if (isset($_POST["json"])) {
	$json = stripslashes($_POST["json"]);
	$obj = json_decode($json);
	$gate = new Gate($obj -> data);
	switch ($obj->method) {
		case 'create' :			
			$gate -> create($pid);
			status(2,"风门创建成功",$gate);
			break;
		case 'update' :
			$gate -> update($pid);
			status(3,"风门成功更新",$gate);
			break;
		case 'delete' :
			$gate -> delete($pid);
			status(4,"风门成功删除",$gate);
			break;
		default :
			echo "default";
			break;
	}
	// Now you can access your php object like so
	// $output[0]->variable-name
} else {
	error('The data posted can not be evaluated.');
}