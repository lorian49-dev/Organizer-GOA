//-------------------------------------------------//
//            Declaracion de variables
//-------------------------------------------------//

// constantes nativas
const path = require('path');
// dotenv
require('dotenv').config({path: path.join(__dirname, 'config.env')})
// constantes externas
const multer = require('multer');
const express = require('express');
const {createClient} = require('@supabase/supabase-js');
const session = require('express-session');
const bcrypt = require('bcrypt');
const saltRounds = 10 // Nivel de seguridad (10 es el nivel mas alto)
// instanciables
const app = express();
// Redireccion al login y seguridad
const isAuthenticated = (req, res, next)=>{
  if(req.session&&req.session.user){
    return next();
  }else{
    res.redirect('/sections/login.html');
  }
}
// Almacenamiento en la memoria local
const myStorage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 10 * 1024 * 1024
  }
});

// Acceso con credenciales por medio de dotenv
const access = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

/*--------------------------------------------*/

app.use(session({
  secret: 'my-secret-new-key',
  saveUninitialized: false,
  resave: false,
  cookie: {secure: false}
}));

app.use('/sections', (req, res, next) => {
  // Si intenta ir al login, déjalo pasar (si no, nadie podría loguearse)
  if (req.path === '/login.html') {
    return next();
  }
  // Para todo lo demás, pedimos carnet
  isAuthenticated(req, res, next);
});
app.get('/', isAuthenticated, (req, res)=>{
  console.log(req.session.user)
  res.redirect('/sections/index.html');
})
app.use(express.static(path.join(__dirname, 'public')));
app.use('/logo-types', express.static(path.join(__dirname, 'src/logo-types')));
app.use('/src', express.static(path.join(__dirname, '/src')))
app.use(express.urlencoded({extended:true})); // permite el uso del cuerpo de un formulario
app.use(express.json())


// -rutas-



//-------------------------------------------------//
//                   COOKIES
//-------------------------------------------------//

app.get('/aceptar-cookie', (req, res)=>{
  res.cookie('cookie-aceptada', true, {
    maxAge:1209600000,
    httpOnly:false
  })
  res.status(200).send('cookie adicionada con exito')
})

app.get('/get-session', (req, res)=>{
  if(!req.session.views){
    req.session.views = 1
  }else{
    req.session.views++
  }
  res.send(`Has visitado esta pagina ${req.session.views} veces`) 
})

//-------------------------------------------------//
//              manejo de la app
//-------------------------------------------------//

//-------------------------------------------------//
//               Login de la app
//-------------------------------------------------//

app.post('/login', async(req, res)=>{
  const {username, password} = req.body;
  try{
  
    const {data, error} = await access.from('users').select('*').eq('name_user', username).single();
    if(error || !data){
      return res.status(401).json({error:'usuario no encontrado'})
    }

    const isCorrect = await bcrypt.compare(password, data.password)
    console.log(password)
    if(!isCorrect) return res.status(401).json({error: 'Contraseña Incorrecta o invalida'});

      req.session.user = {
        id: data.id_user, username: data.name_user
      }


      res.json({success: true})

  }catch(error){
    console.error(error);
    res.status(500).json({error: 'Error en el servidor'});
  }
})

// ------------------------------------------- //
//                  Gafas
// ------------------------------------------- //

// Solicitud de datos de las tablas invoices y manifest para autocompletar busquedas.

// Consulta de manifiestos

app.get('/search-manifest', async(req, res)=>{
  const search = req.query.q

  if(!search) return res.json([]); // validacion de consulta

  const {data, error} = await access.from('manifest').select('id_manifest, name').ilike('name', `%${search}%`).limit(10); // ilike se usa en Postgree SQL para que los datos solicitados sean insensibles a las mayusculas.

  if(error){
    return res.status(500).json({message: error.message})
  }

  res.json(data);
  
})

// consulta de facturas

app.get('/search-invoice', async(req, res)=>{
  const search = req.query.q;

  if(!search) return res.status(500).json([]);

  const {data, error} = await access.from('invoices').select('id_invoice, name').ilike('name', `%${search}%`).limit(10);

  if(error){
    return res.status(500).json({message: error.message})
  }

  res.json(data)
})

// Subida de gafas a la BD

app.post('/glasses', async(req, res)=>{
  const {brand, serial, order, id_invoice, id_manifest} = req.body
    
  try{
  const {data, error} = await access.from('glasses').insert([
    {
      brand:brand, 
      code: serial, 
      ship_order: order, 
      invoice_id: id_invoice, 
      manifest_id: id_manifest
    }]);

   if(error){
    console.log(error)
    return res.status(500).send('error al guardar datos'); 
   }

   res.redirect('/sections/glasses.html')
  }catch(err){
    console.log(err)
  }
})

// Obtencion de datos de la tabla de gafas

app.get('/get-glasses', async(req, res)=>{

  const p = parseInt(req.query.p);
  const page = Number.isInteger(p) && p > 1? p : 1;
  const limit = 50

  const start = (page - 1) * limit;
  const end = start + (limit - 1);
  
  try{
  const {data, error, count} = await access.from('glasses').select('brand, code, ship_order, invoice_id(name, url), manifest_id(name, url)', {count: 'exact'}).order('ship_order', {ascending:'false'}).range(start,end);
  if(error) return console.log(error) 
  const totalGlasses = Math.ceil(count / limit)                                     
  res.json({data, totalGlasses})
  }catch(err){
   res.status(500).send('Error al obtener datos')
  }
})
//-------------------------------------------
// /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
// BUSCADOR DE GAFAS GENERAL CON REDIRECCION
// /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
//-------------------------------------------

app.get('/search-mid', (req, res)=>{
  res.sendFile(path.join(__dirname, 'public', 'sections', 'search.html'))
})

app.get('/search-glasses-table', async(req, res)=>{
  const searchData = req.query.glass_model;

  try{
   const {data, error} = await access.from('glasses').select('brand, code, ship_order, invoice_id(url), manifest_id(url)').ilike('code', `%${searchData}%`).limit(50);
   if(error) return

   res.json(data)
  }catch(error){
    console.error(error);
    res.status(500).json({message:'error de busqueda'})
  }
  

})

//-------------------------------------------
// /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
//         Coincidencias sobre Gafas
// /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
//-------------------------------------------

app.get('/search-glass-results', async(req, res)=>{
  const getData = req.query.glass;
  if(!getData) return res.status(500).send('Error al buscar coincidencias o no se encuentran.')
    try{
  const {data, error} = await access.from('glasses').select('brand, code').ilike('code', `%${getData}%`).limit(10);
  if(error) return
  res.json(data)
  }catch(error){
     console.error(error);
     res.status(500).send('Falla en el sistema y obtencion de datos')
  }
  
})

// obtencion de datos INVOICES

app.get('/invoices-table-get', async(req, res)=>{
  const p = parseInt(req.query.page);
  const page = Number.isInteger(p) && p > 1 ? p : 1;
  const limit = 10;

  // inicio y fin para e rango en la paginacion

  const start = (page - 1) * limit;
  const end = start + (limit - 1);

  try{

    const {data, error, count} = await access.from('invoices').select('id_invoice, name, weight, date, url', {count:'exact'}).order('date', {ascending: false}).range(start, end);

    if(error){
      throw error
    }

    const totalRows = Math.ceil(count / limit);

    res.json({data, totalRows});

  }catch(error){
    console.error(error)
    res.status(500).json({error: 'error en la obtencion de datos'})
  }

})

// obtencion de datos PARA TABLA MANIFEST

app.get('/manifest-table-get', async(req, res)=>{
  const p = parseInt(req.query.page);
  const page = Number.isInteger(p) && p > 1 ? p : 1;
  const limit = 10;

  // inicio y fin para e rango en la paginacion

  const start = (page - 1) * limit;
  const end = start + (limit - 1);

  try{

    const {data, error, count} = await access.from('manifest').select('id_manifest, name, weight, date, url', {count:'exact'}).order('date', {ascending: false}).range(start, end);
    

    if(error){
      throw error
    }

    const totalRows = Math.ceil(count / limit);

    res.json({data, totalRows});

  }catch(error){
    console.error(error)
    res.status(500).json({error: 'error en la obtencion de datos'})
  }

})

// subida de archivos | INVOICES

app.post('/invoice-table-post',async(req, res)=>{
  
  myStorage.array('pdf', 15)(req, res, async(err)=>{

    if(err){
     return res.status(400).json({message:'Error, solo se permite la carga de maximo 15 archivos'})
    }

    try{
          const files = req.files;
//validacion para confirmar que lo que reciba si tenga contenido, de lo contrario abortar

if(!files || files.length === 0){
 return res.status(400).json({error:'S'})
};

const promesaUpload = files.map(async file =>{
 // Nombre de cada archivo 
const fileName = Date.now()+'-'+file.originalname;

// Una vez llegan los archivos iteramos con el map, ahora viene la accion de subida al storage primero

const {data, error} = await access.storage.from('invoices').upload(fileName, file.buffer, {contentType: file.mimetype});

if(error){
  throw error
}

// obtencion de url 

const {data: urlFile} = await access.storage.from('invoices').getPublicUrl(fileName);

const publicUrl = urlFile.publicUrl;

// inserta de los datos en la tabla

return {
  name: fileName,
  weight: file.size,
  date: new Date(),
  url: publicUrl
}

})

const resultados = await Promise.all(promesaUpload);
await access.from('invoices').insert(resultados);
res.redirect('/sections/loadFile.html')
    } catch(error){
      console.error(error);
      res.status(500).json({error: 'Error de subida de archivo'})
    }

  })

})

// Subida de archivos | MANIFIESTOS

app.post('/manifest-table-post',async(req, res)=>{
  
  myStorage.array('pdf', 15)(req, res, async(err)=>{

    if(err){
     return res.status(400).json({message:'Error, solo se permite la carga de maximo 15 archivos'})
    }

    try{
          const files = req.files;
//validacion para confirmar que lo que reciba si tenga contenido, de lo contrario abortar

if(!files || files.length === 0){
 return res.status(400).json({error:'S'})
};

const promesaUpload = files.map(async file =>{
 // Nombre de cada archivo 
const fileName = Date.now()+'-'+file.originalname;

// Una vez llegan los archivos iteramos con el map, ahora viene la accion de subida al storage primero

const {data, error} = await access.storage.from('manifest').upload(fileName, file.buffer, {contentType: file.mimetype});

if(error){
  throw error
}

// obtencion de url 

const {data: urlFile} = await access.storage.from('manifest').getPublicUrl(fileName);

const publicUrl = urlFile.publicUrl;

// inserta de los datos en la tabla

return {
  name: fileName,
  weight: file.size,
  date: new Date(),
  url: publicUrl
}

})

const resultados = await Promise.all(promesaUpload);
await access.from('manifest').insert(resultados);
res.redirect('/sections/loadManiefst.html')
    } catch(error){
      console.error(error);
      res.status(500).json({error: 'Error de subida de archivo'})
    }

  })

})

// ------------------------------------------- //
//           ELIMINACION DE ARCHIVOS
// ------------------------------------------- //

// Invoices

app.delete('/action-delete/:id', async(req, res)=>{

  const id = req.params.id;
  const {data: getFileName, error: getFileNameError} = await access.from('invoices').select('name').eq('id_invoice', id).single()
  const fileName = getFileName.name
if(getFileNameError){
    console.error(getFileNameError)
    return res.status(400).json({error:getFileNameError.message})
  }
  const {data, error} = await access.from('invoices').delete().eq('id_invoice', id);
  const {data: removeFile, error: removeFileError} = await access.storage.from('invoices').remove([fileName])
  if(error){
    console.error(error)
    return res.status(400).json({error:error.message})
  }
   
  res.status(200).send('registro borrado con exito')

})

// Manifest

app.delete('/action-delete-manifest/:id', async(req, res)=>{

  const id = req.params.id;
  const {data: getFileName, error: getFileNameError} = await access.from('manifest').select('name').eq('id_manifest', id).single()
  const fileName = getFileName.name
if(getFileNameError){
    console.error(getFileNameError)
    return res.status(400).json({error:getFileNameError.message})
  }
  const {data, error} = await access.from('manifest').delete().eq('id_manifest', id);
  const {data: removeFile, error: removeFileError} = await access.storage.from('manifest').remove([fileName])
  if(error){
    console.error(error)
    return res.status(400).json({error:error.message})
  }
   
  res.status(200).send('registro borrado con exito')

})

// ------------------------------------------- //
//                  Escucha
// ------------------------------------------- //

app.listen(3000, ()=>{
  console.log('servidor escuchandose en http://localhost:3000');
})

