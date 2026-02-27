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
// instanciables
const app = express();

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

//-------------------------------------------------//
//                   COOKIES
//-------------------------------------------------//

app.get('/aceptar-cookie', (req, res)=>{
  res.cookie('cookie-aceptada', true, {
    maxAge:3600000,
    httpOnly:false
  })
  res.status(200).send('cookie adicionada con exito')
})

//-------------------------------------------------//
//              manejo de la app
//-------------------------------------------------//

app.use(express.static(path.join(__dirname, 'public')));
app.use('/logo-types', express.static(path.join(__dirname, 'src/logo-types')));

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

