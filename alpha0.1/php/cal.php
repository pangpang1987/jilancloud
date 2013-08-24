<?php
session_start();
require_once 'edge.inc.php';
require_once 'fan.inc.php';
require_once 'status.inc.php';


if (!isset($_SESSION['project_ID'])) {
	error('项目未指定');
}

$pid = $_SESSION['project_ID'];
//$pid = 1;

$edges = array();
$edges = Edge::getAll($pid);
$fans = array();
$fans = FAN::getAll($pid);


//var_dump(first_test($edges));

$eds = cvno($edges,$fans);
//var_dump($eds);

if($eds){
	//echo "ok";
	$i = 0;
	foreach ($eds as $id => $q) {
		$edges[$id]->Q = $q;
		$edges[$id]->update($pid);
	}	
}else {	
	error('计算问题');
}
 

status(12,'计算成功',$edges);

//status(12,'计算成功',$obj->edges);
/*
 if(!first_test($edges)){
 die("Error!: The calculate\n");
 }
 foreach($edges as $edge){
 $edge->update();
 }

 echo json_encode($edges);
 */
?>