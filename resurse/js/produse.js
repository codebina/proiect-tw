function eliminaDiacritice(text) {
    if (!text) return "";
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

    function validareInput() {
        let nuNr = /[^0-9]/g;
        let nuLitere = /[^a-zA-ZăîâșțĂÎÂȘȚ\s]/g;

        let inpNume = document.getElementById("inp-nume");
        let inpNumeVal = inpNume.value.trim();
        
        if (inpNumeVal !== "" && inpNumeVal.match(nuLitere) !== null) {
            alert("Input greșit! Ai voie să scrii doar litere în acest câmp.");
            inpNume.classList.add("is-invalid");
            return false;
        }
        else {
        inpNume.classList.remove("is-invalid");
    }
        let inpGramaj = document.getElementById("inp-gramaj");
        let inpGramajVal = inpGramaj.value.trim();
        
        if (inpGramajVal !== "" && inpGramajVal.match(nuNr) !== null) {
            alert("Input greșit! Ai voie să scrii doar cifre în acest câmp.");
            inpGramaj.value = "";
            inpGramaj.placeholder = "Doar cifre aici!";
            return false;
        }

        return true;
    }

window.onload = function () {


    //2 litere
    function numarLitereGresite(a, b) {
        if (Math.abs(a.length - b.length) > 2) return 99;
        let greseli = 0;
        let lungimeMax = Math.max(a.length, b.length);
        for (let i = 0; i < lungimeMax; i++) {
            if (a[i] !== b[i]) {
                greseli++;
            }
        }
        return greseli;
    }

    //update range
    document.getElementById("inp-pret").onchange = function () {
        let val = this.value.trim();
        document.getElementById("infoRange").innerHTML = `(${val})`;
    };

    document.getElementById("inp-nume").oninput = function () {
    let nuLitere = /[^a-zA-ZăîâșțĂÎÂȘȚ\s]/g;
    let valoare = this.value.trim();

    if (valoare === "" || valoare.match(nuLitere) === null) {
        this.classList.remove("is-invalid");
    }
};

    document.getElementById("filtrare").onclick = function () {

        if(!validareInput()){
            return;
        }
        //1. text
        let inpNumeBrut = document.getElementById("inp-nume").value.trim().toLowerCase();
        let inpNume = eliminaDiacritice(inpNumeBrut);

        //2. range
        let inpPretMax = parseFloat(document.getElementById("inp-pret").value.trim());

        //3. radio
        let grupRadio = document.getElementsByName("gr_rad");
        let optiuneVeggie = "toate";//default toate
        for (let rad of grupRadio) {
            if (rad.checked) {
                optiuneVeggie = rad.value;//se opreste la prima checked
                break;
            }
        }

        //4. select simplu
        let inpCategorie = document.getElementById("inp-categorie").value.trim().toLowerCase();
        //5. datalist
        let inpGramaj = document.getElementById("inp-gramaj").value.trim().toLowerCase();
        //6. select multiplu
        let selectMultiplu = document.getElementById("inp-timp-servire");
        let timpiSelectati = [];
        if (selectMultiplu) {
            for (let opt of selectMultiplu.options) {
                if (opt.selected) timpiSelectati.push(opt.value);

            }
        }
        //7. checkbox cu radio
        let checkboxes = document.getElementsByClassName("chk-ingr");
        let reguliIngrediente = [];
        for (let chk of checkboxes) {
            if (chk.checked) {
                let valoareIngredient = chk.value;
                let numeGrupRadio = "rad_" + valoareIngredient.replace(/[\s]+/g, '_');
                let radios = document.getElementsByName(numeGrupRadio);
                let regula = "are";
                for (let r of radios) {
                    if (r.checked) {
                        regula = r.value;
                        break;
                    }
                }
                reguliIngrediente.push({ nume: valoareIngredient, regula: regula });
            }
        }

        //8. descriere(text lung)
        let inpDescriereBruta = document.getElementById("txt-descriere").value.trim().toLowerCase();
        let inpDescriere = eliminaDiacritice(inpDescriereBruta);

        let produse = document.getElementsByClassName("produs");
        for (let prod of produse) {
            prod.style.display = "none";
            //1. text
            let numeBrut = prod.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase();
            let nume = eliminaDiacritice(numeBrut);
            let cond1 = (inpNume == "") || nume.includes(inpNume) || (numarLitereGresite(nume, inpNume) <= 2);
            //2. range
            let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim());
            let cond2 = pret <= inpPretMax;
            //3. radio
            let esteVeggieText = prod.getElementsByClassName("val-vegetarian")[0].innerHTML.trim().toLowerCase();
            let cond3 = (optiuneVeggie == "toate") || (esteVeggieText == optiuneVeggie);
            //4. select simplu
            let categorieMare = prod.getElementsByClassName("val-categorie")[0].innerHTML.trim().toLowerCase();
            let cond4 = (inpCategorie == "toate") || (categorieMare == inpCategorie);
            //5. datalist
            let gramajText = prod.getElementsByClassName("val-gramaj")[0].innerHTML.trim().replace("g", "").trim();
            let cond5 = (inpGramaj == "") || (gramajText == inpGramaj);
            //6. select multiplu
            let timpServire = prod.getElementsByClassName("val-timp-servire")[0].innerHTML.trim().toLowerCase();
            let cond6 = (timpiSelectati.length == 0) || (timpiSelectati.includes(timpServire));
            //7. checkbox cu grup radio
            let ingredienteText = prod.getElementsByClassName("val-ingrediente")[0].innerHTML.trim().toLowerCase();
            let cond7 = true;
            for (let reg of reguliIngrediente) {
                let contineIngredientul = ingredienteText.includes(reg.nume);
                if (reg.regula == "are" && !contineIngredientul) {
                    cond7 = false;
                    break;
                }
                if (reg.regula == "nu_are" && contineIngredientul) {
                    cond7 = false;
                    break;
                }
            }
            //8. text lung
            let descriereTextBruta = prod.getElementsByClassName("val-descriere")[0].innerHTML.trim().toLowerCase();
            let descriereText = eliminaDiacritice(descriereTextBruta);
            let cond8 = (inpDescriere == "") || descriereText.includes(inpDescriere);

            if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8) {
                prod.style.display = "block";
            }
        }
    };

    document.getElementById("resetare").onclick = function () {
        if (confirm("Sigur vrei să resetezi?")) {
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-pret").value = "70";
            document.getElementById("infoRange").innerHTML = "(70)";
            document.getElementById("inp-categorie").value = "toate";
            document.getElementById("inp-gramaj").value = "";
            document.getElementById("i_rad1").checked = true;


            let options = document.getElementById("inp-timp-servire").options;
            for (let i = 0; i < options.length; i++) {
                options[i].selected = false;
            }
            let checkboxes = document.getElementsByClassName("chk-ingr");
            for (let chk of checkboxes) {
                chk.checked = false;
                let numeGrup = "rad_" + chk.value.toLowerCase().replace(/[\s]+/g, '_');
                let radios = document.getElementsByName(numeGrup);
                if (radios.length > 0) radios[0].checked = true;
            }

            document.getElementById("txt-descriere").value = "";

            let produse = document.getElementsByClassName("produs");
            for (let prod of produse) {
                prod.style.display = "block";
            }
        }

    };

    function sorteaza(semn) {
        let produse = document.getElementsByClassName("produs");
        let vProduse = Array.from(produse);
        vProduse.sort(function (a, b) {
            let gramajpretA = parseFloat(a.getElementsByClassName("val-gramaj")[0].innerHTML.replace("g", "").trim()) / parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML.trim());
            let gramajpretB = parseFloat(b.getElementsByClassName("val-gramaj")[0].innerHTML.replace("g", "").trim()) / parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML.trim());
            if (gramajpretA == gramajpretB) {
                let timpA = a.getElementsByClassName("val-timp-servire")[0].innerHTML.trim().toLowerCase();
                let timpB = b.getElementsByClassName("val-timp-servire")[0].innerHTML.trim().toLowerCase();
                return timpA.localeCompare(timpB) * semn;
            }
            return semn * (gramajpretA - gramajpretB);
        })

        for (let prod of vProduse) {
            prod.parentElement.appendChild(prod);
        }
    }

    document.getElementById("sortCresc").onclick = function () { sorteaza(1) }
    document.getElementById("sortDescresc").onclick = function () { sorteaza(-1) }

    document.getElementById("sumar").onclick = function () {
        if(!validareInput()){
            return;
        }
        let produse = document.getElementsByClassName("produs");
        let suma = 0;
        for (let prod of produse) {
            if (prod.style.display != "none") {
                suma += parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim());
            }
        }

        let p = document.getElementById("infoSuma");

        if (!p) {
            p = document.createElement("p");
            p.innerHTML = `Suma totală a produselor afișate: <strong>${suma} LEI</strong>`;
            //paragraf fixat ca sa nu mi mute toate produsele in jos
            p.style.position = "fixed";
            p.style.bottom = "20px";
            p.style.right = "20px";
            p.style.backgroundColor = "white";
            p.style.color = "black";
            p.style.padding = "15px 25px";
            p.style.margin = "0";
            p.style.zIndex = "1000"
            p.style.borderRadius = "10px";

            p.id = "infoSuma";
            let sectiuneProduse = document.getElementById("sectiune-produse");
            sectiuneProduse.parentElement.insertBefore(p, sectiuneProduse);

            setTimeout(function () {
                let p1 = document.getElementById("infoSuma");
                if (p1) p1.remove();
            }, 2000);
        } else {
            p.innerHTML = `Suma totală a produselor afișate: <strong>${suma} LEI</strong>`;
        }
    };
};