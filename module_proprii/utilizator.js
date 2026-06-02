const AccesBD = require('./accesbd.js');
const parole = require('./parole.js');

const { RolFactory } = require('./roluri.js');
const crypto = require("crypto");
const nodemailer = require("nodemailer");

/**
 * @typedef {object} DateUtilizator
 * @property {number} [id] - ID-ul unic din baza de date
 * @property {string} [username]
 * @property {string} [nume]
 * @property {string} [prenume]
 * @property {string} [email] - Adresa de mail
 * @property {string} [parola] 
 * @property {string|object} [rol] - Rolul utilizatorului (cod de string sau obiect cu proprietatea cod)
 * @property {string} [culoare_chat="black"] - Culoarea textului in chat
 * @property {string} [poza] - Calea catre imaginea de profil
 */

/**
 * Clasa care reprezinta si gestioneaza un utilizator al aplicatiei
 * Include validari de date, criptare de parole si trimitere de email-uri
 */
class Utilizator {
    /** @type {string} Tipul de conexiune folosit pentru baza de date */
    static tipConexiune = "local";

    /** @type {string} Numele tabelului */
    static tabel = "utilizatori";

    /** @type {string} Cheia folosita la criptarea parolelor */
    static parolaCriptare = "tehniciweb";

    /** @type {string} Adresa de email a serverului folosita pentru trimiterea mail-ului de confirmare */
    static emailServer = "useruserila0@gmail.com";

    /** @type {number} Lungimea codului generat de criptare */
    static lungimeCod = 64;

    /** @type {string} Domeniul pe care ruleaza aplicatia */
    static numeDomeniu = "localhost:8080";

    /** @type {string} Proprietate privata pentru mesajele de eroare interne */
    #eroare;

    /**
     * Creeaza o instanta de utilizator
     * @param {DateUtilizator} [obiectDate={}] - Obiectul complet cu datele utilizatorului
     */
    constructor({ id, username, nume, prenume, email, parola, rol, culoare_chat = "black", poza } = {}) {
        this.id = id;
        let dateValidare = arguments[0] || {};

        try {
            if (dateValidare.username && !this.checkUsername(dateValidare.username)) {
                throw new Error("Username gresit!");
            }
            if (dateValidare.nume && !this.checkName(dateValidare.nume)) {
                throw new Error("Numele trebuie sa inceapa cu majuscula!");
            }
            if (dateValidare.prenume && !this.checkName(dateValidare.prenume)) {
                throw new Error("Prenumele trebuie sa inceapa cu majuscula!");
            }
            if (dateValidare.email && !this.checkEmail(dateValidare.email)) {
                throw new Error("Email invalid!");
            }
            if (dateValidare.parola && !this.checkPassword(dateValidare.parola)) {
                throw new Error("Parola trebuie sa aiba minim 8 caractere, o majuscula si o cifra!");
            }
        }
        catch (e) { this.#eroare = e.message; }

        for (let prop in arguments[0]) {
            this[prop] = arguments[0][prop];
        }

        if (this.rol)
            this.rol = this.rol.cod ? RolFactory.creeazaRol(this.rol.cod) : RolFactory.creeazaRol(this.rol);
        console.log(this.rol);

        this.#eroare = "";
    }

    /**
     * Valideaza daca un nume/prenume incepe cu majuscula si contine doar litere
     * @param {string} nume - Numele de verificat
     * @returns {boolean} True daca numele este valid, altfel false
     */
    checkName(nume) {
        return nume != "" && nume.match(new RegExp("^[A-Z][a-z]+$"));
    }

    /**
     * Seteaza si valideaza numele de familie al utilizatorului
     * @param {string} nume - Numele nou
     * @throws {Error} Daca numele nu respecta formatul valid
     */
    set setareNume(nume) {
        if (this.checkName(nume)) this.nume = nume;
        else {
            throw new Error("Nume gresit");
        }
    }

    /**
     * Seteaza si valideaza numele de utilizator
     * @param {string} username - Username-ul nou
     * @throws {Error} Daca username-ul nu respecta formatul valid
     */
    set setareUsername(username) {
        if (this.checkUsername(username)) this.username = username;
        else {
            throw new Error("Username gresit");
        }
    }

    /**
     * Valideaza formatul unui username (litere, cifre si semnele # _ . /)
     * @param {string} username - Username-ul de verificat
     * @returns {boolean} True daca este valid, altfel false
     */
    checkUsername(username) {
        return username != "" && username.match(new RegExp("^[A-Za-z0-9#_./]+$"));
    }

    /**
     * Valideaza formatul parolei (minim 8 caractere, o majuscula, o cifra)
     * @param {string} parola - Parola de verificat
     * @returns {boolean} True daca indeplineste conditiile, altfel false
     */
    checkPassword(parola) {
        return parola !== "" && parola.match(new RegExp("^(?=.*[A-Z])(?=.*[0-9]).{8,}$"));
    }

    /**
     * Valideaza structura standard a unei adrese de email
     * @param {string} email - Email-ul de verificat
     * @returns {boolean} True daca formatul este corect, altfel false
     */
    checkEmail(email) {
        return email !== "" && email.match(new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"));
    }

    /**
     * Verifica daca un rol este valid si poate fi creat de RolFactory
     * @param {string|object} rol - Codul rolului sau obiectul rol de verificat
     * @returns {boolean} True daca rolul exista/este valid, altfel false
     */
    checkRol(rol) {
        let codRol = rol ? (rol.cod ? rol.cod : rol) : "comun";
        let rolGenerat = RolFactory.creeazaRol(codRol);
        return rolGenerat !== null && rolGenerat !== undefined;
    }

    /**
     * Seteaza si valideaza parola utilizatorului
     * @param {string} parola - Parola noua
     * @throws {Error} Daca parola nu are destula complexitate
     */
    set setareParola(parola) {
        if (this.checkPassword(parola)) this.parola = parola;
        else throw new Error("Parola gresita");
    }

    /**
     * Seteaza si valideaza adresa de email a utilizatorului
     * @param {string} email - Email nou
     * @throws {Error} Daca formatul email-ului este invalid
     */
    set setareEmail(email) {
        if (this.checkEmail(email)) this.email = email;
        else throw new Error("Email gresit");
    }

    /**
     * Cripteaza o parola folosind algoritmul scryptSync
     * @param {string} parola - Parola in text clar ce trebuie criptata
     * @returns {string} Parola criptata sub forma de sir de caractere
     */
    static criptareParola(parola) {
        return crypto.scryptSync(parola, Utilizator.parolaCriptare, Utilizator.lungimeCod).toString("hex");
    }

    /**
     * Modifica datele utilizatorului curent in baza de date
     * @param {object} noileDate - Obiect cu noile campuri ce trebuie modificate
     * @throws {Error} Daca utilizatorul nu exista in baza de date
     * @returns {Promise<void>}
     */
    async modifica(noileDate) {
        let exista = await Utilizator.getUtilizDupaUsernameAsync(this.username);
        if (!exista) {
            throw new Error("Utilizatorul nu exista pentru a fi modificat");
        }

        if (noileDate.parola) {
            noileDate.parola = Utilizator.criptareParola(noileDate.parola);
        }

        let instBD = AccesBD.getInstanta(Utilizator.tipConexiune);
        await new Promise((resolve, reject) => {
            instBD.update({
                tabel: Utilizator.tabel,
                campuri: Object.keys(noileDate),
                valori: Object.values(noileDate),
                conditiiAnd: [`username='${this.username}'`]
            }, function (err, rez) {
                if (err) reject(err);
                else resolve(rez);
            });
        });

        for (let prop in noileDate) {
            this[prop] = noileDate[prop];
        }
    }

    /**
     * Inregistreaza utilizatorul curent in baza de date dupa ce verifica unicitatea username-ului
     * @throws {Error} Daca username-ul este deja ocupat de alt cont
     * @returns {Promise<void>}
     */
    async salvareUtilizator() {
        let exista = await Utilizator.getUtilizDupaUsernameAsync(this.username);
        if (exista) {
            throw new Error("Username-ul este deja utilizat de altcineva");
        }

        let parolaCriptata = Utilizator.criptareParola(this.parola);
        let utiliz = this;
        let token = parole.genereazaToken(100);

        AccesBD.getInstanta(Utilizator.tipConexiune).insert({
            tabel: Utilizator.tabel,
            campuri: {
                username: this.username,
                nume: this.nume,
                prenume: this.prenume,
                parola: parolaCriptata,
                email: this.email,
                culoare_chat: this.culoare_chat,
                cod: token,
                poza: this.poza
            }
        }, function (err, rez) {
            if (err)
                console.log(err);
            else
                utiliz.trimiteMail("Te-ai inregistrat cu succes", "Username-ul tau este " + utiliz.username,
                    `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${utiliz.username}.</p> <p><a href='http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}'>Click aici pentru confirmare</a></p>`,
                );
        });
    }

    /**
     * Sterge utilizatorul curent din baza de date
     * @throws {Error} Daca utilizatorul curent nu se afla in baza de date
     * @returns {Promise<void>}
     */
    async sterge() {
        let exista = await Utilizator.getUtilizDupaUsernameAsync(this.username);
        if (!exista) {
            throw new Error("Utilizatorul nu poate fi sters deoarece nu exista");
        }

        let instBD = AccesBD.getInstanta(Utilizator.tipConexiune);
        await new Promise((resolve, reject) => {
            instBD.delete({
                tabel: Utilizator.tabel,
                conditiiAnd: [`username='${this.username}'`]
            }, function (err, rez) {
                if (err) reject(err);
                else resolve(rez);
            });
        });
    }

    /**
     * Trimite un email catre utilizatorul curent utilizand Nodemailer
     * @param {string} subiect - Subiectul email-ului
     * @param {string} mesajText - Corpul email-ului in format text
     * @param {string} mesajHtml - Corpul email-ului in format HTML (suporta stilizari)
     * @param {any[]} [atasamente=[]] - O lista optionala cu atasamente
     * @returns {Promise<void>}
     */
    async trimiteMail(subiect, mesajText, mesajHtml, atasamente = []) {
        var transp = nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth: {
                user: Utilizator.emailServer,
                pass: "ctdp tuao lxlh ppfe"
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        await transp.sendMail({
            from: Utilizator.emailServer,
            to: this.email,
            subject: subiect,
            text: mesajText,
            html: mesajHtml,
            attachments: atasamente
        });
        console.log("trimis mail");
    }

    /**
     * Cauta si returneaza un utilizator din baza de date dupa username
     * @param {string} username - Username-ul cautat
     * @returns {Promise<Utilizator|null>} Instanta utilizatorului gasit, sau null daca nu exista ori apare o eroare
     */
    static async getUtilizDupaUsernameAsync(username) {
        if (!username) return null;
        try {
            let rezSelect = await AccesBD.getInstanta(Utilizator.tipConexiune).selectAsync(
                {
                    tabel: "utilizatori",
                    campuri: ['*'],
                    conditiiAnd: [`username='${username}'`]
                });
            if (rezSelect.rowCount != 0) {
                return new Utilizator(rezSelect.rows[0]);
            }
            else {
                console.log("getUtilizDupaUsernameAsync: Nu am gasit utilizatorul");
                return null;
            }
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }
    /**
         * Callback-ul folosit pentru procesarea utilizatorului dupa username conform cerintei din laborator
         * @callback GetUtilizDupaUsernameCallback
         * @param {Utilizator|null} utilizator - Instanta utilizatorului gasit sau null in caz de eroare/lipsa
         * @param {object} obparam - Obiectul custom primit ca parametru (ex: datele din login)
         * @param {number|null} eroare - Codul de eroare: null (succes), -1 (nu exista), -2 (eroare baza de date)
         */

    /**
     * Cauta un utilizator din baza de date dupa username cu callback si gestionare coduri de eroare
     * @param {string} username - Username-ul cautat
     * @param {object} obparam - Un obiect suplimentar cu proprietati transmise spre verificare (ex: parola de la login)
     * @param {GetUtilizDupaUsernameCallback} proceseazaUtiliz - Functia callback apelata dupa finalizarea query-ului
     * @returns {void|null} Returneaza direct null doar daca username-ul furnizat este gol
     */
    static getUtilizDupaUsername(username, obparam, proceseazaUtiliz) {
        if (!username) return null;
        let eroare = null;

        // Folosim 'conditii' adaptat la clasa AccesBD actualizata
        AccesBD.getInstanta(Utilizator.tipConexiune).select(
            {
                tabel: "utilizatori",
                campuri: ['*'],
                conditiiAnd: [`username='${username}'`]
            }
            , function (err, rezSelect) {
                let u = null;

                if (err) {
                    console.error("Utilizator:", err);
                    eroare = -2; // Eroare de conexiune / SQL
                }
                else if (!rezSelect || rezSelect.rowCount == 0) {
                    eroare = -1; // Utilizatorul nu a fost gasit
                }
                else {
                    // Instantiem utilizatorul DOAR daca baza de date a intors intr-adevar un rand!
                    u = new Utilizator(rezSelect.rows[0]);
                }

                // Apelam callback-ul cu cele 3 argumente, exact ca la laborator
                proceseazaUtiliz(u, obparam, eroare);
            });
    }

    /**
     * Callback-ul folosit pentru returnarea listei de utilizatori din metoda cauta
     * @callback CautaUtilizatoriCallback
     * @param {Error|null} err - Eventualul mesaj sau obiect de eroare generat de query
     * @param {Utilizator[]} listaUtiliz - Un vector (populat sau vid) cu instante de tip Utilizator gasite
     */

    /**
     * Cauta utilizatori în baza de date pe baza proprietatilor initializate dintr-un obiect dat (Sincron, cu callback)
     * @param {object} obParam - Obiect ale carui proprietati au aceleasi nume ca cele din clasa Utilizator
     * @param {CautaUtilizatoriCallback} callback - Functia care proceseaza rezultatele sau eroarea SQL
     * @returns {void}
     */
    static cauta(obParam, callback) {
        let conditiiAnd = [];
        if (obParam) {
            for (let prop in obParam) {
                if (obParam[prop] !== undefined && obParam[prop] !== "") {
                    conditiiAnd.push(`${prop}='${obParam[prop]}'`);
                }
            }
        }

        AccesBD.getInstanta(Utilizator.tipConexiune).select({
            tabel: Utilizator.tabel,
            campuri: ['*'],
            conditiiAnd: conditiiAnd
        }, function (err, rezSelect) {
            if (err) {
                callback(err, []);
            } else {
                let listaUtiliz = rezSelect.rows.map(row => new Utilizator(row));
                callback(null, listaUtiliz);
            }
        });
    }

    /**
     * Cauta utilizatori in baza de date pe baza proprietatilor dintr-un obiect dat
     * @param {object} obParam - Obiect ale carui proprietati au aceleasi nume ca cele din clasa Utilizator
     * @returns {Promise<Utilizator[]>} O lista cu obiecte de tip Utilizator care corespund criteriilor (poate fi si vida)
     */
    static async cautaAsync(obParam) {
        let conditiiAnd = [];
        if (obParam) {
            for (let prop in obParam) {
                if (obParam[prop] !== undefined && obParam[prop] !== "") {
                    conditiiAnd.push(`${prop}='${obParam[prop]}'`);
                }
            }
        }

        try {
            let rezSelect = await AccesBD.getInstanta(Utilizator.tipConexiune).selectAsync({
                tabel: Utilizator.tabel,
                campuri: ['*'],
                conditiiAnd: conditiiAnd
            });
            if (!rezSelect || rezSelect.rowCount == 0) return [];
            return rezSelect.rows.map(row => new Utilizator(row));
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    /**
     * Verifica daca utilizatorul curent are un anumit drept corespondent al rolului sau
     * @param {string} drept - Identificatorul dreptului
     * @returns {boolean} True daca utilizatorul are acel drept, altfel false
     */
    areDreptul(drept) {
        return this.rol.areDreptul(drept);
    }
}

module.exports = { Utilizator: Utilizator };