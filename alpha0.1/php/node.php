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
require_once 'node.inc.php';
session_start();

if (isset($_SESSION)) {
	$pid = $_SESSION['project_ID'];
} else {
	error('Session错误');
}



if (isset($_POST["json"])) {
	$json = stripslashes($_POST["json"]);
	$obj = json_decode($json);
	$node = new Node($obj -> data);
	switch ($obj->method) {
		case 'create' :			
			$node -> create($pid);
			status(1,"节点创建成功",$node);
			break;
		case 'update' :
			$node -> update($pid);
			status(3,"节点更新成功",$node);
			break;
		case 'delete' :
			$node -> delete($pid);
			status(4,"节点已成功删除",$node);
			break;
		default :
			break;
	}
	// Now you can access your php object like so
	// $output[0]->variable-name
} else {
	error('The data posted can not be evaluated.');
}


?>
