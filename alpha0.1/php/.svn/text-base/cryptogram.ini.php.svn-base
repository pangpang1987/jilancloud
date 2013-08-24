<?php

/**
 * function encrypt($object,$pid)
 * encrypt the object
 *
 * @param object Object to encrypt
 * @param pid  Project ID
 * @return TRUE if successed
 * @author Zhaodong Liu
 * Date 2013 MAR 17
 */
function encrypt($object, $pid) {
	if (gettype($object) == 'object') {
		$salt = get_class($object);
		$key = md5(sha1('JLEncrypt' . 'P' . $pid . $salt . $object -> ID . 'R' . $_SESSION['auth_random']));
		return $key;
	}
	return NULL;
}

/**
 * function decrypt($object,$pid,$Authkey)
 * decrypt the object
 *
 * @param object 	Object to encrypt
 * @param pid  		Project ID
 * @return TRUE if the key matches
 * @author Zhaodong Liu
 * Date 2013 MAR 17
 */
function decrypt($object, $pid) {

	if (gettype($object) == 'object') {
		$salt = get_class($object);
		if ($object -> AuthKey) {
			$key = md5(sha1('JLEncrypt' . 'P' . $pid . $salt . $object -> ID . 'R' . $_SESSION['auth_random']));
			return $key == $object -> AuthKey;
		} else {
			return false;
		}
	}
	return FALSE;
}

/**
 * function decryptKey($object,$pid,$Authkey)
 * decrypt the key
 *
 * @param object 	Object to decrypt
 * @param pid  		Project ID
 * @param auth_key	Key
 * @return TRUE if the key matches
 * @author Zhaodong Liu
 * Date 2013 MAR 17
 */
function decryptKey($object,$pid,$auth_key){
	if (gettype($object) == 'object') {
		$salt = get_class($object);
		$key = md5(sha1('JLEncrypt' . 'P' . $pid . $salt . $object -> ID . 'R' . $_SESSION['auth_random']));
		if ($auth_key) {
			return $auth_key == $key;
		} else {
			return false;
		}
	}
	return FALSE;
}

?>