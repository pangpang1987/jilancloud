<?php
session_start();
require_once 'edge.inc.php';
require_once 'fan.inc.php';
require_once 'status.inc.php';

/*
if (!isset($_SESSION['project_ID'])) {
	error('项目未指定');
}
 * */

//$project_ID = $_SESSION['project_ID'];
$project_ID = 1;
$edges = array();
$edges = Edge::getAll($project_ID);
$fans = array();
$fans = FAN::getAll($project_ID);



//print("This is the nodes:\n");

//var_dump(first_test($edges));

//test_it();
$ok = cvno($edges, $fans);

	var_dump($ok);
	var_dump($edges);
	//echo "\n\n  Result:-----";
	//echo json_encode($edges);
	/*
	foreach ($edges as $edge) {
		$edge->update();
	}*/
	 
	//$obj -> edges = $edges;

 
 
 
//status(12,'计算成功',json_encode($obj->edges));
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