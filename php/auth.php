<?php
// Подключаем необходимые модули
require_once "init.php";
// Процесс
$getAccount = dbquery('SELECT * FROM account WHERE nickname = "'.$_POST['nickname'].'" LIMIT 1');
if($getAccount != null) {
    // Выбираем первый
    $getAccount = $getAccount[0];
    if( password_verify($_POST['password'], $getAccount['password']) ){
        $skey = hash("sha256", time().$getAccount['id']);
        if( dbexecute('INSERT INTO session (aid, skey, ip) VALUES ("'.$getAccount['id'].'", "'.$skey.'", "'.$_SERVER["REMOTE_ADDR"].'")') ){
            sendAnswer(true, ["session" => $skey]);
        }
    } else {
        sendAnswer(false, "Ошибка: Вы ввели неверный пароль");
    }
} else {
    if( dbexecute('INSERT INTO `account` (`nickname`, `password`) VALUES ("'.$_POST['nickname'].'", "'.password_hash($_POST['password'], PASSWORD_DEFAULT).'")') ){
        $skey = hash("sha256", time().dbid());
        if( dbexecute('INSERT INTO session (aid, skey, ip) VALUES ("'.dbid().'", "'.$skey.'", "'.$_SERVER["REMOTE_ADDR"].'")') ){
            sendAnswer(true, ["session" => $skey]);
        }
    } else {
        sendAnswer(false, "Ошибка: Неизвестная ошибка");
    }
}