<?php
// Подключаем базу
require_once "db/db.php";
// Создаём базу данных, если её нет
if(!file_exists("point")) {
    if (dbexecute("CREATE DATABASE IF NOT EXISTS `".$dbname."` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")) {
        mysqli_select_db($link, $dbname);
        if(initbase()) {
            file_put_contents("point", "SUCCESS");
        }
    } else {
        echo "Error creating database: " . mysqli_error($link);
    }
}
// Функция отправки ответа
function sendAnswer($t, $data){
    $type = ($t) ? "success" : "error";
    exit(json_encode(['type' => $type, 'data' => $data]));
}