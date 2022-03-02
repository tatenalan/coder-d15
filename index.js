const express = require("express");
const mongoose = require('mongoose');
const ServiceException = require("./exceptions/ServiceException");
const config = require("./config");

// rutas
const productRouterApi = require('./routes/api/productRouter');
const productRouter = require('./routes/web/productRouter');
const messageRouterApi = require('./routes/api/messageRouter');
const messageRouter = require('./routes/web/messageRouter');

// plantillas
const handlebars = require('express-handlebars');

// para usar sesiones
const session = require('express-session')

// para guardar los datos de sesion en un file dentro de la carpeta sessions
const sessionFile = require('session-file-store');
const FileStore = sessionFile(session)

// para guardar los datos de sesion en Mongo Atlas
const MongoStore = require('connect-mongo')

// modelos
const Message = require("./models/Message");
const User = require("./models/User");

// para hashear passwords
const bcrypt = require('bcrypt');

// para utilizar websockets
const { Server: HttpServer } = require('http');
const { Server: IOServer } = require('socket.io');

// para el fork
const { fork } = require("child_process");

// cluster
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const http = require('http');





//------------------------------------------------------------------------
// configuro la DB

// Mongo DB local
// const URL = "mongodb://localhost:27017/desafio11";
// mongoose.connect(URL, () => console.log(`MongoDB connected`))

// Mongo Atlas
const URL = config.DB_URL;
mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
},err => {
    if(err) console.log(`Error connecting Mongo Atlas ${err}`)
    // console.log(`Mongo Atlas connected`)
})



//------------------------------------------------------------------------
// instancias

const app = express();


// chat
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

// session. 
// Usamos FileStore para persistir la sesión en desarrollo. (por los reinicios del server)
// o bien Mongostore.Create para persistir en la DB de la nube
// para mantener la sesion viva si el usuario esta activo, colocar rolling: true y resave: true
app.use(session({
    // store: new FileStore(),
    store: MongoStore.create({mongoUrl: URL}),
    secret: 'secreto',
    resave: true,
    rolling: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 } // 60 segundos
}))






//------------------------------------------------------------------------
// configuro el servidor

//PORT - Server
const PORT = config.PORT;
const MODE = config.MODE;

// apenas iniciemos la aplicación entra a este condicional
if(MODE && MODE == "CLUSTER" && cluster.isMaster) {
    
    console.log(`Master PID:${process.pid} is running on ${PORT}`);

    // en el proceso principal (master) creamos un worker por cada cpu que nosotros tenemos
    for (let i = 0; i < numCPUs; i++) {
        // creamos los cluster
        cluster.fork();
    }

    // ejecutamos un evento de salida de cada worker
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker PID: ${worker.process.pid} died :(`);
    })
    
} else {

    app.listen(PORT, (err) => {
        console.log(`Listening ${PORT}... [${MODE}]... `);
        console.log('Worker PID: ' + process.pid + ' is running on ' + PORT );
    })
}


// Arrancamos el servidor con http.listen() en lugar de app.listen()
// const server = httpServer.listen(PORT, () => console.log(`Running on ${PORT} - PID ${process.pid}`))
// server.on('error', error => console.log(`Error on server ${error}`))




// middlewares

function auth(req, res, next) {
    if(req.session.username) {
        return next();
    }
    return res.status(401).send('error de autorización')
}

//------------------------------------------------------------------------
// Llamo a las rutas

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// configura nuestro directorio estático
app.use(express.static(__dirname + '/public'));

// defino el motor de plantillas (habdlebars)
app.engine('handlebars', handlebars.engine())
// especifica la carpeta de plantillas (handlebars)
app.set('views', './public')
app.set('view engine', 'handlebars')


app.use('/api/products', productRouterApi)
app.use('/products', productRouter)
app.use('/api/messages', messageRouterApi)
app.use('/messages', messageRouter)

//------------------------------------------------------------------------
// rutas de autenticacion

// LOGIN
app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body

    const user = await User.findOne({username:username})
  
    if(!user || user.password != password) {
        return res.send('login-error')
    }

    req.session.username = username
    req.session.contador = 0

    res.redirect('/products')
})

// LOGOUT
app.post('/logout', (req, res) => {
    res.render('bye', {username: req.session.username})
    req.session.destroy()
})

// REGISTER
app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const salt = bcrypt.genSaltSync(4);
    req.body.password = bcrypt.hashSync(req.body.password, salt);
    await User.create(req.body);
    res.redirect('/login')
})

// auth only
app.get('/private', auth, (req, res) => {
    res.send('you are logged in!')
})

// rutas desafio 14

app.get('/info', (req, res) => {
    res.json({
        arguments: process.argv.slice(2),
        directory: process.cwd(),
        processId: process.pid,
        processTitle: process.title,
        processPlatform: process.platform,
        processVersion: process.version,
        memoryUsage: process.memoryUsage()
    })
})


app.get('/api/randoms', (req, res) => {
    console.log(`port: ${PORT}, PID: ${process.pid} date: ${new Date().toLocaleString()}`)
    res.send(`Api Randoms
        <span style='color:violet;'>(Nginx)</span> on ${PORT}
        <b>PID ${process.pid}</b> - ${new Date().toLocaleString()}
    `)
})

app.get('/api/settings', (req, res) => {
    console.log(`port: ${PORT}, PID: ${process.pid} date: ${new Date().toLocaleString()}`)
    res.send(`Api Settings
        <span style='color:violet;'>(Nginx)</span> on ${PORT}
        <b>PID ${process.pid}</b> - ${new Date().toLocaleString()}
    `)
})
    
// ruta 404
app.get('*', (req, res) => {
    res.status(404);
    res.json(new ServiceException(-2, `The route ${req.originalUrl} with method ${req.method} does not exist`))
})








// 'connection' se ejecuta la primera vez que se abre una nueva conexión
io.on('connection', (socket) => {
    console.log("usuario conectado");

    // recibimos un mensaje del front
    socket.on("newMessage", message => {
        //  lo guardamos en nuestro array de mensajes para mostrarselo a los nuevos usuarios que ingresen a través del socket "messages"
        Message.create(message)
        console.log('mensaje guardado');
        // Emitimos a todos los clientes
        io.sockets.emit("messages", message)   
    })
})