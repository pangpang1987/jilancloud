<?php //File Name : edge.inc.php
//Class : Fan
//Author:LIU Zhaodong
//Update date(dd/mm/yyyy):28/01/2013
?>
<?php
require_once 'edge.inc.php';

class Fan_A {
	function __construct($data) {
		$this -> a0 = $data -> a0 ? (double)$data -> a0 : 0;
		$this -> a1 = $data -> a1 ? (double)$data -> a1 : 0;
		$this -> a2 = $data -> a2 ? (double)$data -> a2 : 0;
		$this -> a3 = $data -> a3 ? (double)$data -> a3 : 0;
		$this -> a4 = $data -> a4 ? (double)$data -> a4 : 0;
		$this -> a5 = $data -> a5 ? (double)$data -> a5 : 0;
	}

}

class Fan {
	function __construct($data) {
		if (gettype($data) == 'integer') {
			$this -> ID = $data;
		} else {
			$this -> ID = (int)$data -> ID;
			$this -> AuthKey = $data -> AuthKey;
			$this -> name = $data -> name;
			$this -> edge = (int)$data -> edge;
			$this -> edgeAuthKey = $data -> edgeAuthKey;
			$this -> coord = $data -> coord ? new Coord($data -> coord) : new Coord($data);
			$this -> Q = (double)$data->Q;
			$this -> H = (double)$data->H;
			$this -> A = $data -> A ? new Fan_A($data -> A) : new Fan_A($data);
		}
	}

	function encrypt($pid) {
		$this -> AuthKey = encrypt($this, $pid);
		$edge = new Edge($this -> edge);
		$this -> edgeAuthKey = encrypt($edge, $pid);
	}

	function decrypt($pid) {
		if (!decrypt($this, $pid)) {
			error('No authorization Fan');
		}
		$edge = new Edge($this -> edge);
		if (!decryptKey($edge, $pid, $this -> edgeAuthKey)) {
			error("No authorization Edge $edge->ID");
		}
	}

	public function getById($id) {
		try {
			$dbc = new DBC();
			$dbh = $dbc -> connect();
			$sql = "SELECT ID,name,edge,x,y,Q,H,a0,a1,a2 FROM Fan WHERE ID = ?";
			$sth = $dbh -> prepare($sql);
			$sth -> execute(array($id));
			$result = $sth -> fetch(PDO::FETCH_OBJ);
			$fan = new Fan($result);
			$dbc -> disconnect();
			$dbc = NULL;
			return $fan;
		} catch (PDOException $e) {
			error($e -> getMessage());
		}
	}

	public function getAll($pid) {
		$dbc = new DBC();
		$dbh = $dbc -> connect();
		$sql = "SELECT ID,name,edge,x,y,Q,H,a0,a1,a2 FROM Fan WHERE pid = ? ORDER BY ID";
		$fans = array();
		try {
			$i = 0;
			$sth = $dbh -> prepare($sql);
			$sth -> execute(array($pid));

			while ($result = $sth -> fetch(PDO::FETCH_OBJ)) {

				$fans[$i] = new Fan($result);
				$fans[$i] -> encrypt($pid);
				$i++;
			}
			$dbc -> disconnect();
			$dbc = NULL;
			return $fans;
		} catch (PDOException $e) {
			error($e -> getMessage());
		}
	}

	public function create($pid) {
		try {
			$dbc = new DBC();
			$dbh = $dbc -> connect();
			$sql = "INSERT INTO Fan(name,edge,x,y,Q,H,a0,a1,a2,pID) VALUES (?,?,?,?,?,?,?,?,?,?)";
			$sth = $dbh -> prepare($sql);
			$sth -> execute(array($this -> name, $this -> edge, $this -> coord -> x, $this -> coord -> y, $this -> Q, $this -> H, $this -> A -> a0, $this -> A -> a1, $this -> A -> a2, $pid));
			$this -> ID = (int)$dbh -> lastInsertId();
			$this -> encrypt($pid);
			$dbc -> disconnect();
			$dbc = NULL;
			return $this -> id;
		} catch(PDOException $e) {
			error($e -> getMessage());
		}
	}

	public function update($pid) {
		$this -> decrypt($pid);
		try {
			$dbc = new DBC();
			$dbh = $dbc -> connect();
			$sql = "UPDATE Fan SET name = ?,edge = ?,x = ?,y= ?,Q = ?,H = ?,a0 = ?,a1 = ?,a2 = ? WHERE ID = ?";
			$sth = $dbh -> prepare($sql);
			$sth -> execute(array($this -> name, $this -> edge, $this -> coord -> x, $this -> coord -> y, $this -> Q, $this -> H, $this -> A -> a0, $this -> A -> a1, $this -> A -> a2, $this -> ID));
			$dbc -> disconnect();
			$dbc = NULL;
			return $this -> ID;
		} catch(PDOException $e) {
			error($e -> getMessage());
		}
	}

	public function delete($pid) {
		$this -> decrypt($pid);
		try {
			$dbc = new DBC();
			$dbh = $dbc -> connect();
			$id = $this -> ID;
			$sql = "DELETE FROM Fan WHERE ID = $id";

			$count = $dbh -> exec($sql);
			$dbc -> disconnect();
			$dbc = NULL;
			if ($count == 1) {
				return $id;
			} else {
				error('Failure Delete',$this);
			}
		} catch(PDOException $e) {
			error($e -> getMessage());
		}
	}
}
?>