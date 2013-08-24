<?php /**
 *
 *
 * @author
 * @version $Id$
 * @copyright
 */

/**
 * Define DocBlock
 */
?>
<?php
require_once 'fan.inc.php';
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
	$fan = new Fan($obj -> data);
	switch ($obj->method) {
		case 'create' :			
			$fan -> create($pid);
			status(2,"风机创建成功",$fan);
			break;
		case 'update' :
			$fan -> update($pid);
			status(3,"风机成功更新",$fan);
			break;
		case 'delete' :
			$fan -> delete($pid);
			status(4,"风机成功删除",$fan);
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
?>