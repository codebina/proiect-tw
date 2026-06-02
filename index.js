const express = require("express");
const path = require("path");
const fs = require("fs");
const sass = require("sass");
const sharp = require("sharp");
const pg = require("pg");

const Drepturi = require("./module_proprii/drepturi.js");
const {Utilizator}=require("./module_proprii/utilizator.js")

const formidable=require("formidable");
const session=require('express-session');

app = express();
app.set("view engine", "ejs")

client=new pg.Client({
    database:"produse",
    user:"sabina",
    password:"sabina",
    host:"localhost",
    port:5432
})

client.connect()

app.use(session({ // aici se creeaza proprietatea session a requestului (pot folosi req.session)
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
}));

/**
 * Initializeaza optiunile din meniul derulant prin extragerea valorilor din enum-ul bazei de date
 * Salveaza rezultatul in proprietatea optiuniMeniu a obiectului global obGlobal
 * @returns {void}
 */
function initMeniuDerulant() {
    client.query("select * from unnest(enum_range(null::tipuri_produse))", function(err, rezOptiuni) {
        if (err) {
            console.log("Eroare", err);
        } else {
            obGlobal.optiuniMeniu = rezOptiuni.rows;
        }
    });
}
initMeniuDerulant();

app.get("/meniu", function(req, res){
    let clauzaWhere=""
    if (req.query.tip)
        clauzaWhere=`where tip_produs='${req.query.tip}'`
    client.query(`select * from produse ${clauzaWhere}`, function(err, rez){
        if (err){
            console.log("Eroare", err)
            afisareEroare(res,2)
        }
        else{
            client.query("select * from unnest(enum_range(null::tipuri_produse))", function(err, rezOptiuni){
                if (err){
                    afisareEroare(res,2)
                }
                else{
                    res.render("pagini/meniu",{
                        produse:rez.rows,
                        optiuni:rezOptiuni.rows
                    })
                }
            })
            
        }
    })
})


app.get("/meniu/:id", function(req, res){
    client.query(`select * from produse where id=${req.params.id}`, function(err, rez){
    if (err){
        console.log("Eroare", err)
        afisareEroare(res,2)
    }
    else{
        if (rez.rowCount==0){
            afisareEroare(res,404,"Produs inexistent")
        }
        else{
            res.render("pagini/produs",{
                prod:rez.rows[0],
            })
        }
        
    }
})
})
obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup"),
    optiuniMeniu:[]
}

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

let vect_foldere = ["temp", "logs", "backup", "fisiere_uploadate", "poze_uploadate"] //ex 20
for (let folder of vect_foldere) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(path.join(caleFolder), { recursive: true });
    }
}

app.use("/resurse", express.static(path.join(__dirname, "resurse")));
app.use("/dist", express.static(path.join(__dirname, "node_modules/bootstrap/dist")));

app.get("/favicon.ico", function (req, res) {
    res.sendFile(path.join(__dirname, "resurse/imagini/favicon/favicon.ico")) //ex 19
});

// ex 8
app.get(["/", "/index", "/home"], function (req, res) {
    res.render("pagini/index", {
        ip: req.ip, //ex 16
        imagini: obGlobal.obImagini.imagini,
        optiuni: obGlobal.optiuniMeniu
    });
});

/**
 * Initializeaza structura de date pentru gestionarea erorilor din fisierul JSON de configurare
 * Seteaza caile absolute pentru imaginile asociate erorilor din aplicatie
 * @returns {void}
 */
function initErori() {
    let continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8");
    let erori = obGlobal.obErori = JSON.parse(continut)
    let err_default = erori.eroare_default
    err_default.imagine = path.join(erori.cale_baza, err_default.imagine)
    for (let eroare of erori.info_erori) {
        eroare.imagine = path.join(erori.cale_baza, eroare.imagine)
    }

}
initErori()

/**
 * Randeaza pagina personalizata de eroare pe baza unui cod identificator sau a parametrilor expliciti trimisi
 * @param {object} res - Obiectul de raspuns HTTP Express
 * @param {number} identificator - Codul de status al erorii (ex: 404, 403)
 * @param {string} [titlu] - Titlul specific al erorii afisate
 * @param {string} [text] - Mesajul text descriptiv al erorii
 * @param {string} [imagine] - Calea personalizata spre imaginea de eroare
 * @returns {void}
 */
function afisareEroare(res, identificator, titlu, text, imagine) {
    let eroare = obGlobal.obErori.info_erori.find((elem) =>
        elem.identificator == identificator
    )
    let errDefault = obGlobal.obErori.eroare_default;
    if (eroare?.status)
        res.status(eroare.identificator)
    res.render("pagini/eroare", {
        imagine: imagine || eroare?.imagine || errDefault.imagine,
        titlu: titlu || eroare?.titlu || errDefault.titlu,
        text: text || eroare?.text || errDefault.text,
    });
}

app.get("/eroare", function (req, res) {
    afisareEroare(res, 404, "Titlu!!!")
});

/**
 * Initializeaza si proceseaza imaginile din galerie incarcand configuratia din JSON
 * Creeaza directoarele necesare si genereaza versiuni webp redimensionate folosind pachetul sharp
 * @returns {void}
 */
function initImagini() {
    var continut = fs.readFileSync(path.join(__dirname, "resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = obGlobal.obImagini.imagini;
    let caleGalerie = obGlobal.obImagini.cale_galerie

    let caleAbs = path.join(__dirname, caleGalerie);
    let caleAbsMediu = path.join(caleAbs, "mediu");
    let caleAbsMic = path.join(caleAbs, "mic");

    if (!fs.existsSync(caleAbsMediu)) fs.mkdirSync(caleAbsMediu);
    if (!fs.existsSync(caleAbsMic)) fs.mkdirSync(caleAbsMic);

    for (let imag of vImagini) {
        [numeFis, ext] = imag.cale_relativa.split("."); //"ceva.png" -> ["ceva", "png"]

        let caleFisAbs = path.join(caleAbs, imag.cale_relativa);
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
        let caleFisMicAbs = path.join(caleAbsMic, numeFis + ".webp");

        sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
        imag.cale_relativa_mediu = path.join("/", caleGalerie, "mediu", numeFis + ".webp")
        sharp(caleFisAbs).resize(350).toFile(caleFisMicAbs);
        imag.cale_relativa_mic = path.join("/", caleGalerie, "mic", numeFis + ".webp")
        imag.cale_relativa = path.join("/", caleGalerie, imag.cale_relativa)

    }
    // console.log(obGlobal.obImagini)
}
initImagini();

/**
 * Compileaza un fisier SCSS intr-un fisier de tip CSS si creeaza o copie de siguranta in folderul de backup
 * @param {string} caleScss - Calea relativa sau absoluta a fisierului SCSS sursa
 * @param {string} [caleCss] - Calea optionala de output pentru fisierul CSS compilat
 * @returns {void}
 */
function compileazaScss(caleScss, caleCss) {
    if (!caleCss) {

        let numeFisExt = path.basename(caleScss); // "folder1/folder2/a.scss" -> "a.scss"
        let numeFis = numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss = numeFis + ".css"; // output: a.css
    }

    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss)
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss)

    let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup, { recursive: true })
    }

    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss = path.basename(caleCss);
    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css", numeFisCss))// +(new Date()).getTime()
    }
    rez = sass.compile(caleScss, { "sourceMap": true });
    fs.writeFileSync(caleCss, rez.css)

}


//la pornirea serverului
vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere) {
    if (path.extname(numeFis) == ".scss") {
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
    if (eveniment == "change" || eveniment == "rename") {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)) {
            compileazaScss(caleCompleta);
        }
    }
})


// ------------------------- Utilizatori ----------------------

app.post("/inregistrare",function(req, res){
    var username, poza;
    var formular= new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier ){//4
        console.log("Inregistrare:",campuriText);
        console.log("Campuri fisier:",campuriFisier);
        console.log(poza, username);
        var eroare="";
        var utilizNou =new Utilizator();
        try{
            utilizNou.setareNume=campuriText.nume[0];
            utilizNou.setareUsername=campuriText.username[0];
            utilizNou.email=campuriText.email[0]
            utilizNou.prenume=campuriText.prenume[0]
            utilizNou.parola=campuriText.parola[0];
            utilizNou.culoare_chat=campuriText.culoare_chat[0];
            utilizNou.poza= poza;
            Utilizator.getUtilizDupaUsername(campuriText.username[0], {}, function(u, parametru ,eroareUser ){
                if (eroareUser==-1){
                    utilizNou.salvareUtilizator()
                }
                else{
                    eroare+="Mai exista username-ul";
                }
                if(!eroare){
                    res.render("pagini/inregistrare", {raspuns:"Inregistrare cu succes!"})
                }
                else
                    res.render("pagini/inregistrare", {err: "Eroare: "+eroare});
            })
        }
        catch(e){
            console.log(e);
            eroare+= "Eroare site; reveniti mai tarziu";
            res.render("pagini/inregistrare", {err: "Eroare: "+eroare})
        }

    });
    formular.on("field", function(nume,val){  // 1
        console.log(`--- ${nume}=${val}`);
        if(nume=="username")
            username=val;
    })
    formular.on("fileBegin", function(nume,fisier){ //2
        var folderUser=path.join(__dirname, "poze_uploadate", username);
        if (!fs.existsSync(folderUser))
            fs.mkdirSync(folderUser)
        fisier.filepath=path.join(folderUser, fisier.originalFilename)
        poza=fisier.originalFilename;
        console.log("fileBegin:",poza)
        console.log("fileBegin, fisier:",nume, fisier)
    })    
    formular.on("file", function(nume,fisier){//3
        console.log("file");
        console.log(nume,fisier);
    });
});


app.post("/login",function(req, res){
    var username;
    console.log("ceva");
    var formular= new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier ){
        var parametriCallback= {
            req:req,
            res:res,
            parola: campuriText.parola[0]
        }
        Utilizator.getUtilizDupaUsername (campuriText.username[0],parametriCallback, 
            function(u, obparam, eroare ){ //proceseazaUtiliz
            let parolaCriptata=Utilizator.criptareParola(obparam.parola)
            if(u.parola== parolaCriptata && u.confirmat_mail){
                u.poza=u.poza?path.join("poze_uploadate",u.username, u.poza):"";
                obparam.req.session.utilizator=u;               
                obparam.req.session.mesajLogin="Bravo! Te-ai logat!";
                obparam.res.redirect("/index");
                
            }
            else{
                console.log("Eroare logare")
                obparam.req.session.mesajLogin="Date logare incorecte sau nu a fost confirmat mailul!";
                obparam.res.redirect("/index");
            }
        })
    });
    
});

app.get("/logout", function(req, res){
    req.session.destroy();
    res.locals.utilizator=null;
    res.render("pagini/logout");
});


//http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}
app.get("/cod/:username/:token",function(req,res){
    try {
        var parametriCallback={
            req:req,
            token:req.params.token
        }
        Utilizator.getUtilizDupaUsername(req.params.username,parametriCallback ,function(u,obparam){
            let parametriCerere={
                tabel:"utilizatori",
                campuri:{confirmat_mail:true},
                conditiiAnd:[`id=${u.id}`]
            };
            AccesBD.getInstanta().update(
                parametriCerere, 
                function (err, rezUpdate){
                    if(err || rezUpdate.rowCount==0){
                        console.log("Cod:", err);
                        afisareEroare(res,3);
                    }
                    else{
                        res.render("pagini/confirmare.ejs");
                    }
                })
        })
    }
    catch (e){
        console.log(e);
        afisareEroare(res,2);
    }
})


app.post("/profil", function(req, res){
    console.log("profil");
    if (!req.session.utilizator){
        afisareEroare(res,403)
        return;
    }
    var formular= new formidable.IncomingForm();
 
    formular.parse(req,function(err, campuriText, campuriFile){
       
        var parolaCriptata=Utilizator.criptareParola(campuriText.parola[0]);
 
        AccesBD.getInstanta().updateParametrizat(
            {tabel:"utilizatori",
            campuri:["nume","prenume","email","culoare_chat"],
            valori:[
                `${campuriText.nume[0]}`,
                `${campuriText.prenume[0]}`,
                `${campuriText.email[0]}`,
                `${campuriText.culoare_chat[0]}`],
            conditiiAnd:[
                `parola='${parolaCriptata}'`,
                `username='${campuriText.username[0]}'`
            ]
        },          
        function(err, rez){
            if(err){
                console.log(err);
                afisareEroare(res,2);
                return;
            }
            console.log(rez.rowCount);
            if (rez.rowCount==0){
                res.render("pagini/profil",{mesaj:"Update-ul nu s-a realizat. Verificati parola introdusa."});
                return;
            }
            else{            
                //actualizare sesiune
                console.log("ceva");
                req.session.utilizator.nume= campuriText.nume[0];
                req.session.utilizator.prenume= campuriText.prenume[0];
                req.session.utilizator.email= campuriText.email[0];
                req.session.utilizator.culoare_chat= campuriText.culoare_chat[0];
                res.locals.utilizator=req.session.utilizator;
            }
 
 
            res.render("pagini/profil",{mesaj:"Update-ul s-a realizat cu succes."});
 
        });
       
 
    });
});


app.get("/useri", function(req, res){

    if(req?.utilizator?.areDreptul(Drepturi.vizualizareUtilizatori)){
        var obiectComanda={
            tabel:"utilizatori",
            campuri:["*"],
            conditiiAnd:[]
        };
        AccesBD.getInstanta().select(obiectComanda, function(err, rezQuery){
            console.log(err);
            res.render("pagini/useri", {useri: rezQuery.rows});
        });
        
    }
    else{
        afisareEroare(res, 403);
    }
    
});




app.post("/sterge_utiliz",  function(req, res){
    if(req?.utilizator?.areDreptul(Drepturi.stergereUtilizatori)){
        var formular= new formidable.IncomingForm();
 
        formular.parse(req,function(err, campuriText, campuriFile){
                var obiectComanda= {
                    tabel:"utilizatori",
                    conditiiAnd:[`id=${campuriText.id_utiliz[0]}`]
                }
                AccesBD.getInstanta().delete(obiectComanda, function(err, rezQuery){
                console.log(err);
                res.redirect("/useri");
            });
        });
    }else{
        afisareEroare(res,403);
    }
    
})


// -------------------- cererea generala -----------------------

// ex 9
//cauta pagina cu orice string din request sid daca nu il gaseste => pag de eroare
app.get("/*pagina", function (req, res) {
    console.log("Cale pagina", req.url);
    if (req.url.startsWith("/resurse") && path.extname(req.url) == "") {
        afisareEroare(res, 403); //ex 17
        return;
    }
    if (path.extname(req.url) == ".ejs") {
        afisareEroare(res, 400); //ex 18
        return;
    }
    try {
        res.render("pagini" + req.url, { imagini: obGlobal.obImagini?.imagini, optiuni: obGlobal.optiuniMeniu}, function (err, rezRandare) {
            if (err) {
                if (err.message.includes("Failed to lookup view")) {
                    afisareEroare(res, 404); //ex 10
                }
                else {
                    afisareEroare(res);
                }
            }
            else {
                res.send(rezRandare);
                //console.log("Rezultat randare", rezRandare);
            }
        });
    }
    catch (err) {
        if (err.message.includes("Cannot find module")) {
            afisareEroare(res, 404)
        }
        else {
            afisareEroare(res);
        }
    }
});

app.listen(8080);
console.log("Serverul a pornit!");