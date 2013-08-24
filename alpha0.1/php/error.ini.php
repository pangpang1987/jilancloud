<?php
class Error{
	private function error_no($id){
		switch ($id) {
			case 1:
				return '';
				break;
			default:
				
				break;
		}
	}
	
	function no($id){
		return error_no($id);
	}
	
}

?>