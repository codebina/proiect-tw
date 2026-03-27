
const express= require("express");
const path= require("path");

app= express();
app.set("view engine", "ejs")

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

app.get("/", function(req, res) {
    res.render("pagini/index");
})

app.get("/cale", function(req, res) {
    console.log("Ruta /cale");
    res.send("Raspuns pentru <b style='color:red;'>ruta</b> /cale");
})

app.use("/resurse", express.static(path.join(__dirname, "resurse")));

app.use("/:a/:b", function(req,res) {
    console.log(parseInt(req.params.a) + parseInt(req.params.b));
    res.send();
})

app.get("/cale2", function(req, res) {
    res.write("123");
    res.write("456");
    res.end();
})


app.listen(8080);
console.log("Serverul a pornit!");