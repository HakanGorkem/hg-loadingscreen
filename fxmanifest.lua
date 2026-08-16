fx_version 'cerulean'
game 'gta5'

author 'HG'
description 'HG Loading Screen'
version '1.0.0'

-- Yüklenecek ekran dosyası
loadscreen 'index.html'

-- Loading screen'in NUI içinde kendi dosyalarına (css/js/görsel/ses) erişebilmesi için
files {
    'index.html',
    'config.js',
    'css/style.css',
    'js/app.js',
    'assets/*.png',
    'assets/*.jpg',
    'assets/*.jpeg',
    'assets/*.webp',
    'assets/*.svg',
    'assets/*.mp4',
    'assets/*.mp3'
}