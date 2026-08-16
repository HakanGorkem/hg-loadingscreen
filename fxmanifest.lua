fx_version 'cerulean'
game 'gta5'

author 'HG Store'
description 'A configurable, multi-language FiveM loading screen with live Discord staff sync, an announcement slider and an updates panel.'
version '1.3.0'

loadscreen 'index.html'

files {
    'index.html',
    'config.js',
    'css/style.css',
    'js/lang.js',
    'js/app.js',
    'assets/*.png',
    'assets/*.jpg',
    'assets/*.jpeg',
    'assets/*.webp',
    'assets/*.svg',
    'assets/*.mp4',
    'assets/*.mp3'
}

-- Files listed here are excluded from Cfx.re asset escrow encryption so
-- buyers can freely edit their settings and swap branding assets without
-- needing access to the protected source.
escrow_ignore {
    'config.js',
    'assets/*.png',
    'assets/*.jpg',
    'assets/*.jpeg',
    'assets/*.webp',
    'assets/*.svg',
    'assets/*.mp4',
    'assets/*.mp3'
}
