// llamo a dotenv para usar process.env
require('dotenv').config()
// llamo a yargs para pasar por consola parámetros
const yargs = require('yargs/yargs')(process.argv.slice(2))

// si defino alias paso por consola -p y el numero de puerto. Si no defino alias usar 2 guiones --port
const defaultPort = yargs.default({port: process.env.PORT}).alias({p:'port'}).argv

module.exports = { 
    PORT: defaultPort.port,
    DB_URL: process.env.DB_URL
}