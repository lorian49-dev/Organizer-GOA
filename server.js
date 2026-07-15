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
const {createClient} = require('@supabase/supabase-js'); // se crea el cliente proveniente de la libreria de supabase
const {S3Client, PutObjectCommand, DeleteObjectCommand} = require('@aws-sdk/client-s3');
const session = require('express-session');
const r2Session = new S3Client({
 region: 'auto',
 endpoint: process.env.CLOUDFLARE_R2,
 credentials: {
  accessKeyId: process.env.R2_ACCESS_KEY,
  secretAccessKey: process.env.R2_SECRET_KEY
 }
})

const uploadParams = (bucket, key, body, contT) =>{
 return {
   Bucket: bucket,
   Key: key,
   Body:body,
   ContentType: contT
 }
}

const pgSession = require('connect-pg-simple')(session);
const {Pool} = require('pg');
const dbPool = new Pool({
  connectionString: process.env.DATABASE_SUPABASE
})

const bcrypt = require('bcrypt');
const { error } = require('console');
const saltRounds = 10 // Nivel de seguridad (10 es el nivel mas alto)
// instanciables
const app = express();
// Redireccion al login y seguridad

const routeFolder = path.join(__dirname, 'routes')

const isAuthenticated = (req, res, next) =>{
if(req.path === `${routeFolder}/sections/login.html`&&(req.session&&req.session.user)){
   return res.redirect('/')
  } 
  
  if(req.session&&req.session.user){
    return next()
  } 

  if(req.path !== `${routeFolder}/sections/login.html`){
     return res.sendFile(`${routeFolder}/sections/login.html`)
  }

  next()
}

const isAdmin = (req, res, next) =>{
 if(req.session.user.id && req.session.user.id == 1){
   return next();
 }else{
  res.redirect('/denny-access')
 }
}
// Almacenamiento en la memoria local
const myStorage = multer({
  storage: multer.memoryStorage(),
  limits:{
    fileSize: 100*1024*1024
  }
})

// Acceso con credenciales por medio de dotenv
const access = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
) 

/*--------------------------------------------*/
//Cookie de La sesion del usuario para ingreso

const pgSessionStore = new pgSession({
    pool: dbPool,
    tableName:'sessions'
  })

  pgSessionStore.on('error', function(error){
    console.error(error);
  })

app.use(session({
  store: pgSessionStore,
  secret: 'my-secret-new-key',
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    secure: false
  }
}));  

const idSession = (req) =>{
 return req.session.user.id;
}

// Rutas estaticas

app.use(express.static(path.join(__dirname, 'public')));
app.use('/logo-types', express.static(path.join(__dirname, 'src/logo-types')));
app.use('/src', express.static(path.join(__dirname, '/src')))

app.use(express.urlencoded({extended:true})); // permite el uso del cuerpo de un formulario
app.use(express.json())
app.set('view engine', 'ejs') 

//-------------------------------------------------//
//                   COOKIES
//-------------------------------------------------//

app.get('/aceptar-cookie', (req, res)=>{
 res.cookie('cookie-aceptada', true, {
  maxAge: 1296000000,
  httpOnly:false
 })
 res.status(200).send('cookie almacenada con exito')
})

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

    if(!isCorrect) return res.status(401).json({error: 'Contraseña Incorrecta o invalida'});

      req.session.user = {
        id: data.user_roll, username: data.name_user
      }


      res.json({success: true})

  }catch(error){
    console.error(error);
    res.status(500).json({error: 'Error en el servidor'});
  }
})

app.get('/logout', (req, res)=>{
  req.session.destroy((error)=>{
    if(error){
    console.error("Error destruyendo la sesión:", err);
     return res.status(500).send('Error al tratar de cerrar la sesion')
    }

    res.clearCookie('connect.sid');
    res.redirect('/sections/login.html')

  })
})

// -rutas-

app.use(isAuthenticated)

app.get('/',(req, res)=>{
  res.render('index', {
    user_id: req.session.user.id,
    username: req.session.user.username
  })
})


//-------------------------------------------------//
//              manejo de la app
//-------------------------------------------------//


//-------------------------------------------------//
//              Redirecciones por manejos
//-------------------------------------------------//

app.get('/denny-access', (req, res)=>{
 res.render('dennyAcces', {
  userName: req.session.user.username
 })
})

// ------------------------------------------- //
//                  Gafas
// ------------------------------------------- //

app.get('/monturas',isAdmin,(req, res)=>{
 res.sendFile(`${routeFolder}/sections/glasses.html`)
})

// Subida de gafas a la BD

app.post('/glasses', async(req, res)=>{
  const {brand, serial, reference, color, order, id_invoice, id_manifest} = req.body
    
  try{
  if(req.body.length == 1) console.log('Solo hay un registro')
    console.log(req.body.length?req.body.length:'hola')
    console.log(req.body)
  const {data, error} = await access.from('glasses').insert([
    {
      brand:brand, 
      code: serial,
      reference: reference,
      color:color,
      ship_order: order, 
      invoice_id: id_invoice, 
      manifest_id: id_manifest
    }]);

   if(error){
    console.log(error)
    return res.status(500).send('error al guardar datos'); 
   }

   res.sendFile(`${routeFolder}/sections/glasses.html`)
  }catch(err){
    console.log(err)
  }
})

app.post('/glasses-package', async(req, res)=>{
  const monturas = req.body.monturas;
  try{
    const {data, error} = await access.from('glasses').insert(monturas)
    if(error){
      console.error('no se pudo realizar la insercion de data')
      throw error
    }
   res.status(200).send('Operacion Exitosa :)')
  }catch(error){
    console.error(error);
    res.status(500).send({message:'Hubo un grave error al intentar hacer la peticion a la Base de datos, intente de nuevo'})
  }
})

// Obtencion de datos de la tabla de gafas

app.get('/get-glasses', async(req, res)=>{

  const p = parseInt(req.query.p);
  const page = Number.isInteger(p) && p > 1? p : 1;
  const limit = 50

  const start = (page - 1) * limit;
  const end = start + (limit - 1);

  let selection
  
  try{
  if(idSession(req) && idSession(req) === 1){
    selection = 'brand, code, ship_order, invoice_id(name, url), manifest_id(name, url)';
  } else{
    selection = 'brand, code, ship_order, manifest_id(name, url)';
  }

  console.log(idSession(req))

  const {data, error, count} = await access.from('glasses').select(selection, {count:'exact'}).order('ship_order', {ascending:'false'}).range(start,end);
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
  res.render('search-result', {
    userId: req.session.user.id,
    userName: req.session.user.username
  });
}) 

app.get('/search-glasses-table', async(req, res)=>{
  const searchData = req.query.glass_model;
  if(!searchData) return res.status(500).send('ERROR AL INTENTAR CONECTAR CON LA BASE DE DASTO O NO HAY QUE BUSCAR EN LA CONSULTA')
    let selection
  try{

    if(idSession(req) && idSession(req)===1){
      selection = 'brand, code, reference, color, ship_order, invoice_id(url), manifest_id(url)';
    } else{
      selection = 'brand, code, reference, color, ship_order, manifest_id(url)';
    }
   
  const sendMatchGlasses = async(data) =>{
    const {data: dataByCode, error: errorByCode} = await access.from('glasses').select(selection).ilike('code', `%${data}%`);

    if(errorByCode) throw errorByCode;
    if(dataByCode && dataByCode.length > 0) return dataByCode

    const {data: dataByReference, error:errorByReference} = await access.from('glasses').select(selection).ilike('reference', `%${data}%`);

     if(errorByReference) throw errorByReference;
    if(dataByReference && dataByReference.length > 0) return dataByReference

  }

   res.json(await sendMatchGlasses(searchData))
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

    const returnedResult = async(data) =>{
  const {data: dataByCode, error: errorByCode} = await access.from('glasses').select('brand, code').ilike('code', `%${data}%`).limit(10);
  if(errorByCode) throw errorByCode
  if(dataByCode && dataByCode.length > 0) return dataByCode

  const {data: dataByReference, error: errorByReference} = await access.from('glasses').select('brand,reference').ilike('reference', `%${data}%`);

  if(errorByReference) throw errorByReference
  if(dataByReference && dataByReference.length > 0) return dataByReference
       
    } 

  res.json(await returnedResult(getData))
  }catch(error){
     console.error(error);
     res.status(500).send('Falla en el sistema y obtencion de datos')
  }
  
})

// ------------------------------------------- //
//                  Invoices
// ------------------------------------------- //

app.get('/facturas', isAdmin,(req, res)=>{
 res.sendFile(path.join(routeFolder, 'sections', 'loadFile.html'))
})

// consulta de facturas en el buscador

app.get('/search-invoice', async(req, res)=>{
  const search = req.query.name;

  if(!search) return res.status(500).json([]);

  const {data, error} = await access.from('invoices').select('id_invoice, name').ilike('name', `%${search}%`).limit(10);

  if(error){
    return res.status(500).json({message: error.message})
  }

  res.json(data)
})

// obtencion de datos INVOICES para la tabla

app.get('/invoices-table-get', async (req, res) => {
  const p = parseInt(req.query.page);
  const page = Number.isInteger(p) && p > 1 ? p : 1;
  const limit = 10;

  // Simplificación de validaciones
  const code = (req.query.code && req.query.code !== 'undefined') ? req.query.code : '';
  const filter = (req.query.filter && req.query.filter !== 'undefined') ? req.query.filter : '';

  const start = (page - 1) * limit;
  const end = start + limit - 1;

  try {
    if(idSession(req) && idSession(req)===1){
    let query;
    let isJoin = false;

    switch (filter) {
      case 'isModel':
        query = access.from('glasses')
          .select('invoice_id(id_invoice, name, weight, date, url)', { count: 'exact' })
          .ilike('code', `%${code}%`);
        isJoin = true;
        break;
        
      case 'isReference':
        query = access.from('glasses')
          .select('invoice_id(id_invoice, name, weight, date, url)', { count: 'exact' })
          .ilike('reference', `%${code}%`);
        isJoin = true;
        break;
        
      default:
        query = access.from('invoices')
          .select('id_invoice, name, weight, date, url', { count: 'exact' });
        if (code) {
          query = query.ilike('name', `%${code}%`);
        }
        break;
    }
    const orderColumn = isJoin ? 'invoice_id(date)' : 'date';

    const { data, error, count } = await query
      .order(orderColumn, { ascending: false })
      .range(start, end);

    if (error) {
      throw error;
    }

    const normalizedData = data.map(item => isJoin ? item.invoice_id : item);

    const totalRows = Math.ceil(count / limit);

    res.json({ data: normalizedData, totalRows });
  }else{
    console.log('Acceso Denegado')
    throw error
  }  

  } catch (error) {
    console.error('Error en /invoices-table-get:', error);
    res.status(500).json({ error: 'Error en la obtención de datos' });
  }
});

// Busqueda de Invoices Por medio del codigo de la montura

app.get('/invoices-table-by-glasses', async(req, res)=>{
  const code = req.query.code;
  const filter = req.query.filter;
  try{
   if(code && filter && filter == 'isModel'){
    const {data: dataByModel, error: errorByModel} = await access.from('glasses').select('invoice_id(name, weight, date, url)').ilike('code', `%${code}%`)
    if(errorByModel) return res.status(404).send('No se encontro la factura que solicitaste')
    res.json(dataByModel)
   }

   if(code && filter && filter == 'isReference'){
    const {data: dataByReference, error: errorByReference} = await access.from('glasses').select('invoice_id(name, weight, date, url)').ilike('reference', `%${code}%`)
    if(errorByReference) return res.status(404).send('No se encontro la factura que solicitaste')
    res.json(dataByReference)
   }


  }catch(error){
    console.error(error);
    res.status(500).json({message:'error al obtener los resultados'})
  }
})

// subida de archivos | INVOICES

app.post('/invoice-table-post',async(req, res)=>{
  
  myStorage.array('filePDF[]', 15)(req, res, async(err)=>{

    if(err){
     return res.status(400).json({message:'Error, solo se permite la carga de maximo 15 archivos'})
    }

    try{
          const files = req.files;
//validacion para confirmar que lo que reciba si tenga contenido, de lo contrario abortar

if(!files || files.length === 0){
 return res.status(400).json({error:'Ce mamo we xd'})
};

const promesaUpload = files.map(async file =>{
 // Nombre de cada archivo 
const fileName = Date.now()+'-'+file.originalname;

// Una vez llegan los archivos iteramos con el map, ahora viene la accion de subida al storage primero

// const {data, error} = await access.storage.from('invoices').upload(fileName, file.buffer, {contentType: file.mimetype});
await r2Session.send(new PutObjectCommand(uploadParams('invoices', fileName, file.buffer, file.mimetype)));

// Originalmente con Supabase se usaba error con condicional para lanzar el error, pero AWS usa el estandart de Node, asi que 
// try catch se encargara de gestionar el error 

// obtencion de url 

// const {data: urlFile} = await access.storage.from('invoices').getPublicUrl(fileName); esta linea de codigo no se usara al no usar el bucket de Supabase

const publicUrl = `${process.env.PUBLIC_URL_INVOICES}/${fileName}`;

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
res.json({message:'Archivos subidos exitosamente'})
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

  try{
    if(idSession(req)&&idSession(req)===1){
    if(getFileNameError){
    console.error(getFileNameError)
    return res.status(400).json({error:getFileNameError.message})
  }
  const {data, error} = await access.from('invoices').delete().eq('id_invoice', id);
  
  const deleteCommand = {
    Bucket: 'invoices',
    Key: fileName
  }

  if(error){
    console.error(error)
    return res.status(400).json({error:error.message})
  }

  const deleteFile = await r2Session.send(new DeleteObjectCommand(deleteCommand))
  res.status(200).send('registro borrado con exito')
  }else{
    console.error('Acceso denegado para realizar esta accion')
    throw error
  }

  }catch(error){
  console.log(error);
  res.status(500).send('error al intentar borrar el archivo')
  }

})

// ------------------------------------------- //
//                  Manifest
// ------------------------------------------- //

app.get('/manifiestos', isAdmin, (req, res)=>{
 console.log('success log')
 res.sendFile(path.join(routeFolder, 'sections', 'loadManiefst.html'))
})

// Consulta de manifiestos en el buscador

app.get('/search-manifest', async(req, res)=>{
  const search = req.query.name;

  if(!search) return res.json([]); // validacion de consulta

  const {data, error} = await access.from('manifest').select('id_manifest, name').ilike('name', `%${search}%`).limit(10); // ilike se usa en Postgree SQL para que los datos solicitados sean insensibles a las mayusculas.

  if(error){
    return res.status(500).json({message: error.message})
  }

  res.json(data);
  
})

// obtencion de datos PARA TABLA manifiestos

app.get('/manifest-table-get', async(req, res)=>{
  const p = parseInt(req.query.page);
  const page = Number.isInteger(p) && p > 1 ? p : 1;
  const limit = 10;

  const code = (!req.query.code || req.query.code === 'undefined') ? '' : req.query.code;
  const filter = (!req.query.filter || req.query.filter === 'undefined') ? '' : req.query.filter;

  // inicio y fin para e rango en la paginacion

  const start = (page - 1) * limit;
  const end = start + (limit - 1);

  try{
    let query
    let isJoin = false
    switch (filter){
      case 'isModel':
       query = access.from('glasses').select('manifest_id(id_manifest, name, weight, date, url)', {count:'exact'}).ilike('code', `%${code}%`);
       isJoin = true;
        break;
      case 'isReference':
       query = access.from('glasses').select('manifest_id(id_manifest, name, weight, date, url)', {count:'exact'}).ilike('reference', `%${code}%`);
       isJoin = true;
        break;
        default:
         query = access.from('manifest').select('id_manifest, name, weight, date, url', {count:'exact'});
         if(code){
          query = query.ilike('name', `%${code}%`);
         } 
          break;
    }

    const dataJoin = isJoin == true ? 'manifest_id(date)' : 'date'

    const {data, error, count} = await query.order(dataJoin, {ascending: false}).range(start, end);
    

    if(error){
      throw error
    }

    const normalizedData = data.map(item => isJoin ? item.manifest_id : item);

    const totalRows = Math.ceil(count / limit);

    res.json({data: normalizedData, totalRows});

  }catch(error){
    console.error(error)
    res.status(500).json({error: 'error en la obtencion de datos'})
  }

})

// Subida de archivos | MANIFIESTOS

app.post('/manifest-table-post',async(req, res)=>{
  
  myStorage.array('filePDF[]', 15)(req, res, async(err)=>{

    if(err){
     return res.status(400).json({message:'Error, solo se permite la carga de maximo 15 archivos'})
    }

    try{
          const files = req.files;
//validacion para confirmar que lo que reciba si tenga contenido, de lo contrario abortar

if(!files || files.length === 0){
 return res.status(400).json({error:'Error al subir archivos'})
};

const promesaUpload = files.map(async file =>{
 // Nombre de cada archivo 
const fileName = Date.now()+'-'+file.originalname;

// Una vez llegan los archivos iteramos con el map, ahora viene la accion de subida al storage primero

await r2Session.send(new PutObjectCommand(uploadParams('manifest', fileName, file.buffer, file.mimetype)))
// obtencion de url 

const publicUrl = `${process.env.PUBLIC_URL_MANIFEST}/${fileName}`;

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
res.json({message:'Archivos subidos exitosamente'})
    } catch(error){
      console.error(error);
      res.status(500).json({error: 'Error de subida de archivo'})
    }

  })

})

// ------------------------------------------- //
//           ELIMINACION DE ARCHIVOS
// ------------------------------------------- //

app.delete('/action-delete-manifest/:id', async(req, res)=>{
  
  const id = req.params.id;
  try{

    if(idSession(req)&&idSession(req)===1){
  const {data: getFileName, error: getFileNameError} = await access.from('manifest').select('name').eq('id_manifest', id).single()
  const fileName = getFileName.name
if(getFileNameError || !fileName){
    console.error(getFileNameError)
    throw error
  }

  const deleteCommand = {
    Bucket: 'manifest',
    Key: fileName
  }

  const deleteFile = await r2Session.send(new DeleteObjectCommand(deleteCommand));
  console.log('Archivo borrado con exito!');

  const {data, error} = await access.from('manifest').delete().eq('id_manifest', id);
 if(error){
    console.error(error)
    return res.status(400).json({error:error.message})
  }

  res.status(200).send('registro borrado con exito')
  }else{
    console.error('Acceso denegado para realizar esta accion')
    throw error
  }
  }catch(deleteFileError){
    console.log(deleteFileError)
    res.status(500).json({message:'Error al momento de borrar el archivo de la base de datos:', error:deleteFileError})
  }

})

// ------------------------------------------- //
//                  Escucha
// ------------------------------------------- //

app.listen(3000, ()=>{
  console.log('servidor escuchandose en http://localhost:3000');
})




