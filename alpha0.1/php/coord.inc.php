<?php
class Coord {
	public $x;
	public $y;
	public $z;
	function __construct($obj) {
			$this -> x = (double)$obj -> x;
			$this -> y = (double)$obj -> y;
			$this -> z = (double)$obj -> z;
	}

}
?>