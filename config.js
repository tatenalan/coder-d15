// llamo a dotenv para usar process.env
require('dotenv').config()
// llamo a yargs para pasar por consola parámetros
const yargs = require('yargs/yargs')(process.argv.slice(2))

// si defino alias paso por consola -p y el numero de puerto. Si no defino alias usar 2 guiones --port
const yargsValues = yargs.default({port: process.env.PORT, mode: process.env.MODE}).alias({p:'port', m:'mode'}).argv

module.exports = { 
    PORT: yargsValues.port || process.env.PORT,
    MODE: yargsValues.mode || process.env.MODE,
    DB_URL: process.env.DB_URL
}