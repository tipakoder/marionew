<?php
// Подключаем необходимые модули
require_once "init.php";
// Получаем список уровенй
$dir = "../levels";
$files = scandir($dir);
$levels = [];
foreach($files as $level) {
    if($level != "." && $level != "..") {
        $levels[] = ['name' => $level, 'data' => file_get_contents($dir."/".$level)];
    }
}
// Отправляем ответ
sendAnswer(true, ["levels" => $levels]);