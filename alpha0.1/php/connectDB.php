<?php
//File Name:connectDB.php
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

@ $db_conn= new mysqli('119.115.138.6','test','jilan_soft','html5'); //connection to database
if(mysqli_connect_errno())
{
//	die('Could not connect: ' . mysqli_connect_error());
	echo 'Error:'.mysqli_connect_error();
	echo '<br />';
	echo 'Please try again later';
	exit;
}//error message
if (!$db_conn->set_charset("utf8"))
    echo"Error loading character set utf8: %s\n";
?>