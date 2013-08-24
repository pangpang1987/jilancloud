<?php
function filled_out($form_vars) {	
	foreach ($form_vars as $key => $value) {
		if (!isset($key) || $value == '') {
			return FALSE;
		}
	}
	return TRUE;
}

function valid_usrname($usrname) {
	if (ereg('^[A-Za-z][A-Za-z0-9]{4,17}$', $usrname) && strlen($usrname) > 4 && strlen($usrname) < 19) {
		return TRUE;
	} else {
		return FALSE;
	}
}

function valid_email($address) {
	if (ereg('^[a-zA-Z0-9_\.\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$', $address)) {
		return TRUE;
	} else {
		return FALSE;
	}
}

function valid_password($password, $password_check) {
	if (strlen($password) > 4 && strlen($password) < 19 && $password === $password_check) {
		return TRUE;
	} else {
		return FALSE;
	}
}
?>