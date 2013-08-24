<?php
//File Name : node.inc.php
//Class : Node
//Author:LIU Zhaodong
//Update date(dd/mm/yyyy):28/01/2013
//
//
require_once 'status.inc.php';
require_once 'coord.inc.php';
require_once 'cryptogram.ini.php';

require_once 'connectDB-PDO.php';

class Node {
	public $ID;
	public $name;
	public $coord;
	private $salt = 'Node';
	function __construct($data) {
		if (gettype($data) == 'integer') {
			$this -> ID = $data;
		} else {
			$this -> ID = (int)$data -> ID;
			$this -> AuthKey = $data -> AuthKey;
			$this -> name = $data -> name;
			$this -> coord = $data -> coord ? new Coord($data -> coord) : new Coord($data);
		}
	}

	function encrypt($pid) {
		$this -> AuthKey = encrypt($this, $pid);
	}

	function decrypt($pid) {
		if (!decrypt($this, $pid)) {
			error('No authorization');
		}
	}

	public function getById($id, $pid) {
		try {
			$dbc = new DBC();
			$dbh = $dbc -> connect();
			$sql = "SELECT ID,name,x,y FROM Node WHERE ID = ?";
			$sth = $dbh -> prepare($sql);
			$sth -> execute(array($id));
			$result = $sth -> fetch(PDO::FETCH_OBJ);

			$node = new Node($result);
			$node -> encrypt($pid);
			$dbc -> disconnect();
			$dbc = NULL;
			return $node;
		} catch (PDOException $e) {
			error($e -> getMessage());
		}
	}

	public function getAll($pid) {
		$dbc = new DBC();
		$dbh = $dbc -> connect();
		$sql = "SELECT ID,name,x,y FROM Node WHERE pid = ? ORDER BY ID";
		$nodes = array();
		try {
			$i = 0;
			$sth = $dbh -> prepare($sql);
			$sth -> execute(array($pid));
			while ($row = $sth -> fetch(PDO::FETCH_OBJ)) {
				$nodes[$i] = new Node($row);
				$nodes[$i] -> encrypt($pid);
				$i++;
			}
			$dbc -> disconnect();
			$dbc = NULL;
			return $nodes;
		} catch (PDOException $e) {
			error($e -> getMessage());
		}

	}

	public function create($pid) {
		try {
			$dbc = new DBC();
			$dbh = $dbc -> connect();
			$sql = "INSERT INTO Node(name,x,y,pID) VALUES (?,?,?,?)";
			$sth = $dbh -> prepare($sql);
			$sth -> execute(array($this -> name, $this -> coord -> x, $this -> coord -> y, $pid));
			$this -> ID = (int)$dbh -> lastInsertId();
			$this -> encrypt($pid);
			$dbc -> disconnect();
			$dbc = NULL;
			return $this;
		} catch(PDOException $e) {
			error($e -> getMessage());
		}
	}
	
	

	public function update($pid) {
		$this -> decrypt($pid);
		try {
			$dbc = new DBC();
			$dbh = $dbc -> connect();
			$sql = "UPDATE Node SET name = ?,x = ?,y = ? WHERE ID = ?";
			$sth = $dbh -> prepare($sql);
			$sth -> execute(array($this -> name, $this -> coord -> x, $this -> coord -> y, $this -> ID));
			$dbc -> disconnect();
			$dbc = NULL;
			return $this;
		} catch(PDOException $e) {
			error($e -> getMessage());
		}
	}

	public function delete($pid) {
		$this -> decrypt($pid);
		try {
			$dbc = new DBC();
			$dbh = $dbc -> connect();
			$sql = "DELETE FROM Node WHERE ID = $this->ID";
			$count = $dbh -> exec($sql);
			$dbc -> disconnect();
			$dbc = NULL;
			if ($count == 1) {
				return $id;
			} else {
				error("删除节点 $id 失败");
			}
		} catch(PDOException $e) {
			error($e -> getMessage());
		}
	}

}
?>