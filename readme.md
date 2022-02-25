REFERENCIAS

Agregué el archivo nginx.config a la carpeta raíz del desafío.

En el archivo index.js en la linea 101 a 128 y entre 228 a 237 se puede encontrar el código de este desafio


COMANDOS IMPORTANTES UTILIZADOS --------------------------------------------------------------------------------

para matar un proceso usando PowerShell ->  taskkill /pid <PID> /f "imagename eq node.exe"
para matar un proceso usando Bash ->  fuser <PORT>/tcp [-k]

tasklist /fi "imagename eq nginx.exe" para ver si nginx está ejecutándose

Sobre la carpeta raíz de nginx correr los siguientes comandos
nginx -s stop
nginx -s quit
nginx -s reload
nginx -s reopen

Para arrancar servers con pm2
pm2 start index.js --name="taten server" --watch -- 8080
pm2 start index.js --name="taten cluster" --watch -i max -- 8081


