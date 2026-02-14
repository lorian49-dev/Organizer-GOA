  const path = require('path');
  require('dotenv').config({path: path.join(__dirname, 'config.env')});
  const {createClient} = require('@supabase/supabase-js');
  const express = require('express');
  const app = express();
  const multer = require('multer');

  // Almacenamiento en memoria 
  // it's named memory storage because its function is save process in RAM memory

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fieldSize: 10 * 1024 * 1024
    }
  });

  // acciones

  const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY

  );

  // Aplicacion, GET, POST & LISTEN

  app.use(express.static(path.join(__dirname, 'public')))

  app.post('/upload', upload.single('pdf'), async(req, res)=>{
    
    try {
      // se crea una instancia de la aplicacion, cuando se ejecute el metodo post a dicha direccion, req.file tendra lugar
      const file = req.file;
    // medida de seguridad por si llegase a fallar o no haya ningun archivo que procesar
      if(!file){
      return res.status(400).json({error: 'No file uploaded'});
      }
      // el nombre del archivo que se subira
      const fileName = Date.now() +'-'+ file.originalname;

      // subida a Supabase

      const {data, error} = await supabase.storage.from('invoices').upload(fileName, file.buffer, {contentType: file.mimetype});
      if(error){
        throw error;
      }

      // Obtener la URL publica

      const {data: publicUrlData} = await supabase.storage.from('invoices').getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      //insertar datos en tabla invoices
      
      const {error: dbError} = await supabase.from('invoices').insert([
        {name:file.originalname, weight: file.size, date: new Date(),url: publicUrl}
      ])

      if(dbError){
        await supabase.storage.from('invoices').remove([fileName]);

        throw dbError;
      }

      res.json({message: 'Archivo Subido correctamente'});

    } catch(err){
      console.error(err);
      res.status(500).json({error:'Error al subir Arcvhivo'})
    }
  })
  

  app.listen(3000, ()=>{
    console.log('servidor operando en el puerto http://localhost:3000')
  })