<?php //File Name:object.php
//Function:Test OO of php
//Author:LIU Zhaodong
//Update date(dd/mm/yyyy):28/01/2013
//Parameter:
//1. Connect IP:119.115.138.6
//2. UserName:test
//3. Connect Password:jilan_soft
//4. Database Name:html5
//Note: The only connection variable handle name: $DB_Connection
?>
<?php
//require_once 'connectDB-PDO.php';
require_once 'node.inc.php';
require_once 'coord.inc.php';
require_once 'edge.inc.php';
require_once 'fan.inc.php';
require_once 'gate.inc.php';
session_start();



$obj -> status = 0;
if (!isset($_SESSION['project_ID'])) {
	die(json_encode($obj));
} else {
	$pid = $_SESSION['project_ID'];
}
if (!isset($_SESSION['user_ID'])) {
	die(json_encode($obj));
} else {
	$uid = $_SESSION['user_ID'];
}

$nodes = array();
$nodes = Node::getAll($pid);

$edges = array();
$edges = Edge::getAll($pid);

$fans = array();
$fans = Fan::getAll($pid);

$gates = array();
$gates = Gate::getAll($pid);

$obj -> Fan = $fans;
$obj -> Edge = $edges;
$obj -> Gate = $gates;
$obj -> rankey = $_SESSION['auth_random'];
$obj -> status = 1;
$obj -> Node = $nodes;
echo json_encode($obj);
?>