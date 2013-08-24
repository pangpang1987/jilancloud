<?php
function status($status_id, $message, $data) {
	$obj -> status = $status_id;
	$obj -> message = $message ? $message : NULL;
	$obj -> data = $data ? $data : NULL;
	echo json_encode($obj);
}
function error($message,$data) {
	$obj -> status = 0;
	$obj -> message = $message ? $message : NULL;
	$obj -> data = $data ? $data : NULL;
	echo json_encode($obj);
	die();
}
?>