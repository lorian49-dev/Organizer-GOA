English(This program is tested from windows 10/11)

 Welcome to organizer-GOA, first, what is this?

  organizer-GOA is a primary software desiged to support the employees and
  administrative tasks, it originated from an idea, organize invoices and manifest linked to different 
  glasses/eyewear, and have the ease of check the information about so many glasses at the same time.

  -Currently this app is using the next technologies:
  #JavaScript
  #Node.Js
  #PostgreSQL
  #HTML5 & CSS3 (Basics but important).

  INSTALATION GUIDE

  1- Open CMD, Powershell or VS Code terminal
  2- Locate your destination folder (cd/Documents/MyProyects)
  3- execute the next code: 
     git clone https://github.com/lorian49-dev/Organizer-GOA.git
  4- Move in the proyect folder:
     cd Organizer-GOA

   *INSTALL DEPENDENCES and node technology*

using CDM or Powershell

 winget install OpenJS.NodeJS.LTS

or Go to the next website:

https://nodejs.org/en/download/current

Dependences

 step 1: As the previously process, you need to get to the proyect location 
 step 2: Install using----->(dont copy '#')

 #npm install express
 #npm install @supabase/supabase-js
 #npm install multer
 #npm install dotenv
 #npm install express-session
 #npm install bcrypt

  once finished the installation process, it's time to create and give acces to database, in this proyect is being used Supabase, but you can drow on any database provider.

  in the main proyect folder, who is called 'backend'(you can change folder's name in your devide, not problem), basically the one file .env is your acces key and the exactly following information has to be there:

SUPABASE_URL=PROYECT-URL
SUPABASE_SERVICE_KEY=ACCES-KEY
   
and that's all about the installation guide

--------------------------------------------
/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
           Instructions for use
\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/
--------------------------------------------

• Open .bat file
• if you are not logged in you will be redirected to the login form
• after place the correct information in the form, again, you will be redirected to the main page
• you could chose between 3 options, eyewears, invoices and manifest
• in any page you could search any copy, just complete de serial number in the searchbar at the top right side.
• if you need to add an invoice, manifest or eyewear just go in the create copy option.

meanwhile the server works, the program always will answering

if you need some of guide with code, look at this:

all you need to know is in server.js

once you have sucessfully installed the frameworks, then you need to import them to your server proyect, like this following structure:


Spanish