<?php

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "mario";
// Connect to db
$link = mysqli_connect($host, $user, $pass);
// Error connect
if(!$link) {
    printf("Ошибка подключения к БД: %s\n", mysqli_connect_error());
    exit;
}
try{
    mysqli_select_db($link, $dbname);
} catch(Exception $e) {
    echo "Произошла ошибка выбора базы ".$e->getMessage();
}
// Function accoc get
function dbquery($sql) {
    global $link;
    if( ($result = mysqli_query($link, $sql)) != false){
        $res = mysqli_fetch_all($result, MYSQLI_ASSOC);
        return $res;
    }
    echo mysqli_error($link);
    mysqli_store_result($link);
    return false;
}
// Execute function
function dbexecute($sql) {
    global $link;
    if(mysqli_query($link, $sql) === true) {
        return true;
    }
    echo mysqli_error($link);
    mysqli_store_result($link);
    return false;
}
// Get last insert id
function dbid() {
    global $link;
    return mysqli_insert_id($link);
}
// INIT BASE
function initbase() {
    global $link;
    $query = '';
    $sqlScript = file('db/base.sql');
    foreach ($sqlScript as $line)	{
        
        $startWith = substr(trim($line), 0 ,2);
        $endWith = substr(trim($line), -1 ,1);
        
        if (empty($line) || $startWith == '--' || $startWith == '/*' || $startWith == '//') {
            continue;
        }
            
        $query = $query . $line;
        if ($endWith == ';') {
            mysqli_query($link, $query) or exit('</b>Problem in executing the SQL query: </b>' . $query. '<br>'.mysqli_error($link));
            $query= '';		
        }
    }
    return true;
}