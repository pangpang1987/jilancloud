<?php
require_once 'connectDB-PDO.php';
require_once 'status.inc.php';
/*
ini_set('display_errors', 1);
error_reporting(E_ALL);
*/
function dxf_reader($data,$pid) {
	$mtime = explode(' ', microtime());
	$starttime = $mtime[1] + $mtime[0];
	$p_arr = array();
	$p_index = array();
	$l_arr = array();
	foreach ($data as $point) {
		$l_arr[] = array('start' => pointIndex($p_arr, $point['start']), 'end' => pointIndex($p_arr, $point['end']));
	}

	$mtime = explode(' ', microtime());
	$processtime = number_format(($mtime[1] + $mtime[0] - $starttime), 6);
	//echo json_encode($l_arr);
	//minor change
	node_array($p_arr, &$p_index, $pid);
	edge_array($p_index, $l_arr, $pid);
	return TRUE;
}

function node_array(&$p_arr, &$p_index, $pid) {
	try {
		$dbc = new DBC();
		$dbh = $dbc -> connect();
		$sql = "INSERT INTO Node(x,y,pID) VALUES (?,?,?)";
		$sth = $dbh -> prepare($sql);
		foreach ($p_arr as $point) {
			$sth -> execute(array(round($point['obj']['x'], 2), round($point['obj']['y'], 2), $pid));
			$p_index[$point['index']] = (int)$dbh -> lastInsertId();
		}
		$dbc -> disconnect();
		$dbc = NULL;
	} catch(PDOException $e) {
		error($e -> getMessage());
	}
}

function edge_array($p_index, $l_arr, $pid) {
	try {
		$dbc = new DBC();
		$dbh = $dbc -> connect();
		$sql = "INSERT INTO Edge(sNode,eNode,pID) VALUES (?,?,?)";
		$sth = $dbh -> prepare($sql);

		foreach ($l_arr as $line) {
			$sNode = $p_index[$line['start']];
			$eNode = $p_index[$line['end']];
			$sth -> execute(array($sNode, $eNode, $pid));
		}
		$dbc -> disconnect();
		$dbc = NULL;
	} catch(PDOException $e) {
		error($e -> getMessage());
	}
}

function pointIndex(&$p_arr, $data) {
	$string = round($data['x'], 2) . ',' . round($data['y'], 2);
	if (array_key_exists($string, $p_arr)) {
		return $p_arr[$string]['index'];
	} else {
		$p_arr[$string] = array('index' => count($p_arr), 'obj' => $data);
		return $p_arr[$string]['index'];
	}
}
?>