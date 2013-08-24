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
require_once 'edge.inc.php';
session_start();
if(isset($_SESSION['project_ID'])){
	$pid = $_SESSION['project_ID'];
	$user_ID = $_SESSION['user_ID'];
}else{
	error('Session错误');
}

if (isset($_POST["json"])) {
	$json = stripslashes($_POST["json"]);
	$obj = json_decode($json);
	$edge = new Edge($obj -> data);
	switch ($obj->method) {
		case 'create' :
			$edge -> create($pid);
			status(2,"新分支已创建",$edge);
			break;
		case 'update' :
			$edge -> update($pid);
			status(3,"分支更新成功",$edge);
			break;
		case 'delete' :
			$edge -> delete($pid);
			status(4,"分支已成功删除",$edge);
			break;
		default :
			echo"default";
			break;
	}
	// Now you can access your php object like so
	// $output[0]->variable-name
} else {
	error('The data posted can not be evaluated.');
}

/*
 $obj = json_decode($post);
 echo $obj;
 /*
 $data = $obj->data;
 switch ($obj->method) {
 case 'create':
 $node = new Node(null,$data->name,new Coord($data->coord->x,$data->coord->y));
 $node->create();
 echo json_encode($node);
 break;

 default:

 break;
 }

 */
?>
