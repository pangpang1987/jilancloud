<?php
require_once 'connectDB-PDO.php';
session_start();
$obj -> status = 0;
if(!isset($_SESSION['project_ID'])){
	die(json_encode($obj));
}
$pid = $_SESSION['project_ID'];
$dbc = new DBC();
$dbh = $dbc -> connect();
try {
	$sql = "DELETE FROM Edge WHERE pID = $pid";
	$count = $dbh -> exec($sql);
	$sql = "DELETE FROM Node WHERE pID = $pid";
	$count = $dbh -> exec($sql);
	$dbc -> disconnect();
	$dbc = NULL;
	$obj -> status = 1;
} catch (PDOException $e) {
	$obj -> status = 0;
	$obj -> message = 'DELETE FAILED:'.$e -> getMessage();
}
echo json_encode($obj);

?>