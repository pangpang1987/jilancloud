<?php //File Name:connectDB.php
//Function:Connect to the database
//Author:LIU Zhaodong
//Update date(dd/mm/yyyy):20/07/2012
//Parameter:
//1. Connect IP:119.115.138.6
//2. UserName:test
//3. Connect Password:jilan_soft
//4. Database Name:html5
//Note: The only connection variable handle name: $DB_Connection
?>
<?php

require_once 'node.inc.php';

//$dbc = new DBC();

/**
 *
 */

function & openDB() {

	echo "open ok";
	$db_host = '127.0.0.1';
	//数据库主机名
	$db_user = 'root';
	//数据库连接用户名
	$db_password = '';
	//对应的密码
	$db_name = 'html5';
	//使用的数据库

	$dsn = "mysql:host=$db_host;dbname=$db_name";
	$dbh = null;
	try {
		$dbh = new PDO($dsn, $db_user, $db_password);
		//echo "OK!!!!";
		$dbh -> exec("SET CHARACTER SET utf8");
	} catch (PDOException $e) {
		echo("Error!: " . $e -> getMessage() . "<br/>");
	}
	return $dbh;
}

function closeDB(&$dbh) {
	$dbh = null;
}

class DBC {

	var $db_host = '127.0.0.1';
	//数据库主机名
	var $db_user = 'root';
	//数据库连接用户名
	var $db_password = '';
	//对应的密码
	var $db_name = 'html5';
	//使用的数据库
	public $dbh;

	function __construct() {
		$dsn = "mysql:host=$this->db_host;dbname=$this->db_name";
		//$dsn = "mysql:localhost;dbname=html5";
		try {
			$this -> dbh = new PDO($dsn, $this -> db_user, $this -> db_password);
			$this -> dbh -> exec("SET CHARACTER SET utf8");
			//echo "connected!";
			return $this -> dbh;
		} catch (PDOException $e) {
			echo("Error!: " . $e -> getMessage() . "<br/>");
		}
	}

	function disconnect() {
		$this -> dbh = null;
	}

	function &connect() {

		return $this->dbh;
	}

}

/*
 try {
 global $dbh;
 $dbh = new PDO($dsn, $db_user, $db_password);
 $dbh -> exec("SET CHARACTER SET utf8");

 /*
 foreach ($dbh->query('SELECT * from T_tunnel') as $row) {
 print_r($row); //你可以用 echo($GLOBAL); 来看到这些值
 }
 $dbh = null;
 echo $GLOBAL;

 //
 $sql = "SELECT * FROM `users` WHERE `location` = ? , `name` = ?";
 $sth = $dbh->prepare($sql);

 $sth->execute(array($location, $name));

 $result = $sth->fetch(PDO::FETCH_OBJ);
 echo $result->name . $result->location;

 $dbh = NULL;

 } catch (PDOException $e) {
 die("Error!: " . $e -> getMessage() . "<br/>");
 }*/
?>