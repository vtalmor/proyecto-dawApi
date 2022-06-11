//IMPORTAR MODULOS Y MODELS REQUERIDOS 

const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const User = require('../models/user');
const consumables = require('../models/consumables');
const enemies = require('../models/enemies');
const skills = require('../models/skills');
const equpments = require('../models/equipments');
const helps = require('../models/helps');
const nodemailer = require('nodemailer');
const router = express.Router();

//RUTAS GET 

router.get('/', (req,res)=>{
    res.send('pagina principal');
});

//ENVIO DE DATOS DESDE LA BBDD

router.get('/consumables', async (req,res)=>{
    //FIND DEVUELVE TODOS LOS DATOS ALMACENADOS EN LA COLECCION PASADA, EN ESTE CASO CONSUMABLES
    const fcon= await consumables.find();

    //ENVIA EN FORMA DE JSON LOS DATOS ENCONTRADOS 
    res.json(fcon);
});
router.get('/enemies', async (req,res)=>{
    const fen= await enemies.find();
    res.json(fen);
});
router.get('/skills', async (req,res)=>{
    const fsk= await skills.find();
    res.json(fsk);
});
router.get('/equipments', async (req,res)=>{
    const fequi= await equpments.find();
    res.json(fequi);
});
router.get('/helps', async (req,res)=>{
    const fhelp= await helps.find();
    res.json(fhelp);
});
router.get('/users', async (req,res)=>{
    const fuser= await User.find();
    res.json(fuser);
});

//RUTAS POST 

router.post('/login', async (req,res)=>{
    const { name, password } = req.body;

    //ENCUENTRA EN LA BBDD EL USUSARIO CON EL NOMBRE PASADO
    const fuser = await User.findOne({name: name});
    if(fuser){
        //COMPARA LA CONTRASEÑA PASADA CON LA ENCRIPTADA EN LA BBDD PARA COMPROBAR SI LA CONTRASEÑA ES CORRECTA
        if(!bcrypt.compareSync(password,fuser.password)){
            res.send('error');
        }else{
            //SI EXISTE EL USUARIO Y LA CONTRASEÑA ES CORRECTA ENVIA LA SESION ALMACENADA EN LA BBDDD
            res.send(JSON.stringify(fuser.session));
        }
    }else{
        //SI NO EXITE EL USUARIO ENVIA UN MENSAJE DE ERROR
        res.send('error');
    }
});

//METODO PARA ACTUALIZAR LA SESSION
router.post('/session', async (req,res) =>{
    res.header('Access-Control-Allow-Origin', '*');
    const fuser = await User.findOne({name: req.body.name}); 
    const user = User({
    _id: fuser._id,
    name: fuser.name,
    password: fuser.password,
    session: req.body,
    email: fuser.email,
    code: fuser.code,
    maxScore: fuser.maxScore
    });
    if(fuser){
        user.save();
        fuser.delete();
        res.send("update");
    }
});

router.post('/signup', async (req,res)=>{
    const { name, email, password } = req.body;
    //BUSCA EN LA BBDD SI EXISTE UN USUARIO Y UN EMAIL CON LOS PASADOS
    const fuser = await User.findOne({name: name});
    const femail = await User.findOne({email:email});
    //ENCRIPTA LA CONTRASEÑA PASADA
    const pwd = await bcrypt.hashSync(password, bcrypt.genSaltSync(8));
    console.log(pwd); 
    if(fuser){
        //SI YA EXISTE EL USUARIO ENVIA UN MENSAJE DE ERROR
        return res.send('error');
    }else if(femail){
        //SI YA EXISTE EL EMAIL ENVIA UN MENSAJE DE ERROR
        return res.send('error2');
    }else{
        //SI NO EXISTE NINGUN USUARIO CON LOS DATOS PASADOS LO CREA
        const newUser = new User();
        newUser.name = name;
        newUser.password = pwd;
        newUser.email = email;
        newUser.code = Math.floor(Math.random() * 999999);
        newUser.session = {
            "name": name,
            "score": 0,
            "maxScore": 0,
            "playing": false,
            "character": {},
            "room":{},
            "image": "caro-asercion/prank-glasses.svg"
        };
       
        await newUser.save();
        const transport = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:465,
            secure:true,
            auth: {
              user: "gamevictoryraquel@gmail.com",
              pass: "fjkdbbsktvqyuvsk"
            }
        });
        await transport.sendMail({
            from:"bienvenida",
            to:newUser.email,
            subject: "Bienvenid@!",
            text: "Bienvenid@ "+newUser.name+".",
            html:'<p>Este es un correo automático de confirmación,si quieres seguir jugando accede a este <a href="http://rcorsan.github.io/proyecto-daw/">link</a></p>'
        }); 
        return res.send(JSON.stringify(newUser.session));
    }
});

router.post('/passwordreq', async (req,res) => {
    const { name } = req.body;
    const fuser = await User.findOne({name:name});
    if(!fuser){
        res.send('error');
    }else{
        res.send('ok');
        const transport = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:465,
            secure:true,
            auth: {
              user: "gamevictoryraquel@gmail.com",
              pass: "fjkdbbsktvqyuvsk"
            }
        });
        await transport.sendMail({
            from:"juego",
            to:fuser.email,
            subject: "Cambio de contraseña",
            text: "Bienvenid@ "+fuser.name+".",
            html:'<p>Este es un correo automático de confirmación,si quieres seguir con el proceso accede a este <a href="https://rcorsan.github.io/proyecto-daw/passwordres/">link</a></p>'
        }); 
    }
});

router.post('/passwordres', async (req,res) => {
    const { name, password, password2 } = req.body;
    const fuser = await User.findOne({name:name});
    if(fuser){
        if(bcrypt.compareSync(password,fuser.password)){
            const user = User({
                _id: fuser._id,
                name: fuser.name,
                password:await bcrypt.hashSync(password2, bcrypt.genSaltSync(8)),
                session: fuser.session,
                email: fuser.email,
                code: fuser.code,
                });
                user.save();
                fuser.delete();
                res.send("ok");
        }else{
            res.send("error");
        }
        
    }else{
        res.send('error2');
    }
});


router.post('/', (req,res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.send('funciona');
    console.log(req.body);
});



module.exports = router;