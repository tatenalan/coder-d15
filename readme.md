REFERENCIAS

Agregué el archivo nginx.config a la carpeta raíz del desafío.

En el archivo index.js en la linea 100 a 125 y entre 225 a 239 se puede encontrar el código de este desafio


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

Para detener, reiniciar o eliminar una de las app de la lista
pm2 stop <app_name|namespace|id|'all'|json_conf>
pm2 restart <app_name|namespace|id|'all'|json_conf>
pm2 delete <app_name|namespace|id|'all'|json_conf>

forever start index.js [args]
forever list
forever stop PID
forever stopall
forever --help

