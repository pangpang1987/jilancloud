<?php
require_once 'edge.inc.php';
class Gate {
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
			$this -> R = (double)$data -> R;
		}
	}

	function encrypt($pid) {
		$this -> AuthKey = encrypt($this, $pid);
		$edge = new Edge($this -> edge);
		$this -> edgeAuthKey = encrypt($edge, $pid);
	}

	function decrypt($pid) {
		if (!decrypt($this, $pid)) {
			error('No authorization Gate');
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
			$sql = "SELECT ID,name,edge,x,y,R FROM Gate WHERE ID = ?";
			$sth = $dbh -> prepare($sql);
			$sth -> execute(array($id));
			$result = $sth -> fetch(PDO::FETCH_OBJ);
			$gate = new Gate($result);
			$dbc -> disconnect();
			$dbc = NULL;
			return $gate;
		} catch (PDOException $e) {
			error($e -> getMessage());
		}
	}

	public function getAll($pid) {
		$dbc = new DBC();
		$dbh = $dbc -> connect();
		$sql = "SELECT ID,name,edge,x,y,R FROM Gate WHERE pid = ? ORDER BY ID";
		$gates = array();
		try {
			$i = 0;
			$sth = $dbh -> prepare($sql);
			$sth -> execute(array($pid));

			while ($result = $sth -> fetch(PDO::FETCH_OBJ)) {

				$gates[$i] = new Gate($result);
				$gates[$i] -> encrypt($pid);
				$i++;
			}
			$dbc -> disconnect();
			$dbc = NULL;
			return $gates;
		} catch (PDOException $e) {
			error($e -> getMessage());
		}
	}

	public function create($pid) {
		try {
			$dbc = new DBC();
			$dbh = $dbc -> connect();
			$sql = "INSERT INTO Gate(pID,name,edge,x,y,R) VALUES (?,?,?,?,?,?)";
			$sth = $dbh -> prepare($sql);
			$sth -> execute(array($pid,$this -> name, $this -> edge, $this -> coord -> x, $this -> coord -> y, $this -> R));
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
			$sql = "UPDATE Gate SET name = ?,edge = ?,x = ?,y= ?,Q = ?,H = ?,a0 = ?,a1 = ?,a2 = ? WHERE ID = ?";
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
			$sql = "DELETE FROM Gate WHERE ID = $id";

			$count = $dbh -> exec($sql);
			$dbc -> disconnect();
			$dbc = NULL;
			if ($count == 1) {
				return $id;
			} else {
				error('Failure Delete', $this);
			}
		} catch(PDOException $e) {
			error($e -> getMessage());
		}
	}

}
?>