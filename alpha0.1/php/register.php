<?php
require_once 'status.inc.php';
require_once 'data_valid_fns.php';
require_once 'usr_auth.php';

$obj -> status = 0;


if(!filled_out($_POST)){
	error('表单填写有误');
}

$username = $_POST['username'];

if(!valid_usrname($username)){
	error('用户名不符合规则');
}

if(isNameOccupied($username)){
	error('用户名被占用 重想一个吧');
}


$email = $_POST['email'];
if(!valid_email($email)){
	error('email');
}


if(isEmailOccupied($email)){
	error('Email已被注册 请勿重复注册');
}


$pwd = $_POST['password'];
$pwd_confirm = $_POST['password_confirm'];

$fname = $_POST['fname'];
$lname = $_POST['lname'];



if(!valid_password($pwd, $pwd_confirm)){
	error('密码不符合规则');
}

$id = register($username, $email, $pwd, $fname, $lname);

if(!$id){
	error('发生错误：很遗憾，无法注册，请重试！');
}
else{
	$obj -> status = 1;
	$obj -> url = 'index.html';
}
echo json_encode($obj);
?>