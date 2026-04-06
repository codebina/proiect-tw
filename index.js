const express= require("express");
const path= require("path");
const fs=require("fs");
const sass=require("sass");
const sharp= require("sharp");

app= express();
app.set("view engine", "ejs")



obGlobal={
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname,"resurse/scss"),
    folderCss: path.join(__dirname,"resurse/css"),
    folderBackup: path.join(__dirname,"backup"),
}

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

let vect_foldere=[ "temp", "logs", "backup", "fisiere_uploadate" ] //ex 20
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(path.join(caleFolder), {recursive:true});   
    }
}

app.use("/resurse",express.static(path.join(__dirname, "resurse")));

app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname,"resurse/imagini/favicon/favicon.ico")) //ex 19
});

// ex 8
app.get(["/", "/index","/home"], function(req, res){
    res.render("pagini/index", {
        ip: req.ip //ex 16
    });
});

//ex 13
function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    let erori=obGlobal.obErori=JSON.parse(continut)
    let err_default=erori.eroare_default
    err_default.imagine=path.join(erori.cale_baza, err_default.imagine)
    for (let eroare of erori.info_erori){
        eroare.imagine=path.join(erori.cale_baza, eroare.imagine)
    }

}
initErori()

function afisareEroare(res, identificator, titlu, text, imagine){
    let eroare= obGlobal.obErori.info_erori.find((elem) => 
        elem.identificator == identificator
    )
    let errDefault= obGlobal.obErori.eroare_default;
    if(eroare?.status)
        res.status(eroare.identificator)
    res.render("pagini/eroare",{
        imagine: imagine || eroare?.imagine || errDefault.imagine,
        titlu: titlu || eroare?.titlu || errDefault.titlu,
        text: text || eroare?.text || errDefault.text,
    });
}

app.get("/eroare", function(req, res){
    afisareEroare(res,404, "Titlu!!!")
});

// ex 9
//cauta pagina cu orice string din request sid daca nu il gaseste => pag de eroare
app.get("/*pagina", function(req, res){
    console.log("Cale pagina", req.url);
    if (req.url.startsWith("/resurse") && path.extname(req.url)==""){
        afisareEroare(res,403); //ex 17
        return;
    }
    if (path.extname(req.url)==".ejs"){
        afisareEroare(res,400); //ex 18
        return;
    }
    try{
        res.render("pagini"+req.url, function(err, rezRandare){
            if (err){
                if (err.message.includes("Failed to lookup view")){
                    afisareEroare(res,404); //ex 10
                }
                else{
                    afisareEroare(res);
                }
            }
            else{
                res.send(rezRandare);
                //console.log("Rezultat randare", rezRandare);
            }
        });
    }
    catch(err){
        if (err.message.includes("Cannot find module")){
            afisareEroare(res,404)
        }
        else{
            afisareEroare(res);
        }
    }
});


app.listen(8080);
console.log("Serverul a pornit!");

