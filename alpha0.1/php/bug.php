<?php
require_once 'connectDB-PDO.php';
require_once 'status.inc.php';
session_start();
if (!isset($_SESSION['login_ID'])) {
	error("用户未登陆");

} else {
	$lid = $_SESSION['login_ID'];
}
if (!isset($_SESSION['project_ID'])) {
	error("未指定项目");

} else {
	$pid = $_SESSION['project_ID'];
}
$message = stripslashes($_POST["bug"]);
try {
	$dbc = new DBC();
	$dbh = $dbc -> connect();
	$sql = "INSERT INTO Bug(project_ID,login_ID,message) VALUES (?,?,?)";
	$sth = $dbh -> prepare($sql);
	$sth -> execute(array($pid, $lid, $message));
	$dbc -> disconnect();
	$dbc = NULL;
	status(2, '建议已经成功提交，感谢您的支持！');
} catch(PDOException $e) {
	error($e -> getMessage());
}
?>