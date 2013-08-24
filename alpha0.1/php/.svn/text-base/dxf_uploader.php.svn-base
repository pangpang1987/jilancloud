<?php

require_once 'dxf_reader.php';
require_once 'status.inc.php';
$mtime = explode(' ', microtime());
$starttime = $mtime[1] + $mtime[0];
header("Content-Type: text/html; charset=utf-8");
/*
ini_set('display_errors', 1);
error_reporting(E_ALL);
*/
require_once ('php_python.php');

session_start();
if (isset($_SESSION)) {
	$pid = $_SESSION['project_ID'];
} else {
	error('Session错误');
}

$folder = "/Volumes/DataHD/ppython/file_cache/";
//$folder = "/Volumes/Server/website/ppython/file_cache/";
if ($_FILES["file"]["error"] > 0) {
	switch ($_FILES["file"]['error']) {
		case 1 :
			error('The file is bigger than this PHP installation allows');
			break;
		case 2 :
			error('The file is bigger than this form allows');
			break;
		case 3 :
			error('Only part of the file was uploaded');
			break;
		case 4 :
			error('No file was uploaded');
			break;
		default :
			error('unknown errror');
	}
}

if (file_exists("upload/" . $_FILES["file"]["name"])) {
	error($_FILES["file"]["name"] . " already exists. ");
} else {
	if (move_uploaded_file($_FILES["file"]["tmp_name"], $folder . $_FILES["file"]["name"])) {
		$ret = ppython("dxf_uploader::read", $_FILES["file"]["name"]);
		if(!dxf_reader($ret['lines'],$pid)){
			error('读取dxf文件失败！');
		}
		
		//echo "返回信息：" . json_encode($ret);
	}
}

$mtime = explode(' ', microtime());
$processtime = number_format(($mtime[1] + $mtime[0] - $starttime), 6);
/*
$url='http://www.jilan.com.cn/jilancloud/cloud'; 
echo "<script type='text/javascript'>";  
echo "window.location.href='$url'";  
echo "</script>"; 
 */
status(1,$processtime)
?>