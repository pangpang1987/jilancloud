<?php
require_once 'status.inc.php';
require_once 'data_valid_fns.php';
require_once 'usr_auth.php';

$posts = $_POST;
foreach ($posts as $key => $value) {
	$posts[$key] = trim($value);
}

if (!filled_out($posts)) {
	error('请确认所有数据均已输入');
}

$obj -> status = 0;

$username = $posts['username'];
$password = $posts['password'];

if (!valid_usrname($username) || !isNameOccupied($username)) {
	error('用户不存在');
}
$user = login($username, $password);
if ($user === FALSE) {
	error('密码错误');
}
session_start();
$_SESSION['user_name'] = $user -> username;
$_SESSION['user_ID'] = $user -> ID;
$_SESSION['user_email'] = $user -> email;
$_SESSION['user_fname'] = $user -> firstname;
$_SESSION['user_lname'] = $user -> lastname;
$_SESSION['project_ID'] = $user -> ID;
$_SESSION['login_ID'] = $user -> login;

$_SESSION['auth_random'] = uniqid();
$obj->url = './ui';

status(1, "", $obj);
?>