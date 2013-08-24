<?php //File Name : edge.inc.php
//Class : Edge
//Author:LIU Zhaodong
//Update date(dd/mm/yyyy):28/01/2013
?>
<?php
require_once 'node.inc.php';
class Edge {
	function __construct($data) {
		if (gettype($data) == 'integer') {
			$this -> ID = $data;
		} else {
			$this -> ID = (int)$data -> ID;
			$this -> AuthKey = $data -> AuthKey;
			$this -> name = $data -> name;
			$this -> sNode = (int)$data -> sNode;
			$this -> sNodeAuthKey = $data -> sNodeAuthKey;
			$this -> eNode = (int)$data -> eNode;
			$this -> eNodeAuthKey = $data -> eNodeAuthKey;

			$this -> R = (float)$data -> R + 0.0;
			$this -> Q0 = (double)$data -> Q0;
			$this -> Q = (double)$data -> Q;
			$this -> H = (double)$data -> H;
		}

	}

	function encrypt($pid) {
		$sNode = new Node($this -> sNode);
		$eNode = new Node($this -> eNode);
		$this -> sNodeAuthKey = encrypt($sNode, $pid);
		$this -> eNodeAuthKey = encrypt($eNode, $pid);
		$this -> AuthKey = encrypt($this, $pid);
	}

	function decrypt($pid) {
		$sNode = new Node($this -> sNode);
		$eNode = new Node($this -> eNode);
		if (!decrypt($this, $pid)) {
			error("No authorization Edge $this->ID");
		}
		if (!decryptKey($sNode, $pid, $this -> sNodeAuthKey)) {
			error("No authorization Node $sNode->ID");
		}
		if (!decryptKey($eNode, $pid, $this -> eNodeAuthKey)) {
			error("No authorization Node $eNode->ID");
		}
	}

	public function getById($id) {
		try {
			$dbc = new DBC();
			$dbh = $dbc -> connect();
			$sql = "SELECT ID,name,sNode,eNode,R,Q0,Q,H FROM Edge WHERE ID = ?";
			$sth = $dbh -> prepare($sql);
			$sth -> execute(array($id));
			$result = $sth -> fetch(PDO::FETCH_OBJ);
			$edge = new Edge($result);
			$dbc -> disconnect();
			$dbc = NULL;
			return $edge;
		} catch (PDOException $e) {
			error($e -> getMessage());
		}
	}

	public function getAll($pid) {
		$dbc = new DBC();
		$dbh = $dbc -> connect();
		$sql = "SELECT ID,name,sNode,eNode,R,Q0,Q,H FROM Edge WHERE pid = ? ORDER BY ID";
		$edges = array();
		try {
			$i = 0;
			$sth = $dbh -> prepare($sql);
			$sth -> execute(array($pid));

			while ($result = $sth -> fetch(PDO::FETCH_OBJ)) {
				$edges[$i] = new Edge($result);
				$edges[$i] -> encrypt($pid);
				$i++;
			}
			$dbc -> disconnect();
			$dbc = NULL;
			return $edges;
		} catch (PDOException $e) {
			error($e -> getMessage());
		}
	}

	public function create($pid) {
		try {
			$dbc = new DBC();
			$dbh = $dbc -> connect();
			$sql = "INSERT INTO Edge(name,sNode,eNode,R,Q0,Q,H,pID) VALUES (?,?,?,?,?,?,?,?)";
			$sth = $dbh -> prepare($sql);
			$sth -> execute(array($this -> name, $this -> sNode, $this -> eNode, $this -> R, $this -> Q0, $this -> Q, $this -> H, $pid));
			$this -> ID = (int)$dbh -> lastInsertId();
			$this -> encrypt($pid);
			$dbc -> disconnect();
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
			$sql = "UPDATE Edge SET name = ?,sNode = ?,eNode = ?,R = ?,Q0 = ?,Q = ?,H = ? WHERE ID = ?";
			$sth = $dbh -> prepare($sql);
			$sth -> execute(array($this -> name, $this -> sNode, $this -> eNode, $this -> R, $this -> Q0, $this -> Q, $this -> H, $this -> ID));
			$dbc -> disconnect();
			$dbc = NULL;
			return $this;
		} catch(PDOException $e) {
			error($e -> getMessage());
		}
	}

	public function reverse($pid){
		$this -> decrypt($pid);
		try {
			$dbc = new DBC();
			$dbh = $dbc -> connect();
			$sql = "UPDATE Edge SET sNode = ?,eNode = ? WHERE ID = ?";
			$sth = $dbh -> prepare($sql);
			$sth -> execute(array( $this -> eNode,$this -> sNode,$this -> ID));
			$this -> encrypt($pid);
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
			$id = $this -> ID;
			$sql = "DELETE FROM Edge WHERE ID = $id";
			$count = $dbh -> exec($sql);
			$dbc -> disconnect();
			$dbc = NULL;
			if ($count == 1) {
				return $id;
			} else {
				error("删除巷道 $id 失败");
			}
		} catch(PDOException $e) {
			error($e -> getMessage());
		}
	}

}
?>