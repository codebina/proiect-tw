const Drepturi=require('./drepturi.js');

/**
 * Clasa baza pentru reprezentarea unui rol generic in aplicatie
 */
class Rol{
    /** * Returneaza identificatorul textual al tipului de rol generic
     * @type {string} 
     */
    static get tip() {return "generic"}
    
    /** * Returneaza lista de drepturi implicite asociate rolului generic
     * @type {Symbol[]} 
     */
    static get drepturi() {return []}
    
    /**
     * Instantiaza un obiect de tip Rol si ii asociaza codul corespunzator tipului clasei care il construieste
     */
    constructor (){
        this.cod=this.constructor.tip;
    }

    /**
     * Verifica daca rolul curent detine un anumit drept primit ca parametru
     * @param {Symbol} drept - Dreptul (de tip Symbol) care se doreste a fi verificat
     * @returns {boolean} True daca dreptul se afla in lista de drepturi a clasei, altfel false
     */
    areDreptul(drept){ //drept trebuie sa fie tot Symbol
        console.log("in metoda rol!!!!")
        return this.constructor.drepturi.includes(drept); 
    }
}

/**
 * Clasa pentru reprezentarea rolului de Administrator
 * @extends Rol
 */
class RolAdmin extends Rol{
    
    /** * Returneaza identificatorul textual al tipului de rol admin
     * @type {string} 
     */
    static get tip() {return "admin"}
    
    /** * Returneaza lista completa de drepturi administrative
     * @type {Symbol[]} 
     */
    static get drepturi() { return [
    Drepturi.vizualizareUtilizatori,
    Drepturi.stergereUtilizatori,
    Drepturi.cumparareProduse,
    Drepturi.vizualizareGrafice,
    Drepturi.vizualizareProduse,
    Drepturi.stergereProduse,
    Drepturi.adaugareProduse
    ] }
    
    /**
     * Instantiaza un obiect de tip RolAdmin si apeleaza constructorul clasei parinte
     */
    constructor (){
        super();
        
    }

    /**
     * Suprascrie verificarea drepturilor pentru a acorda acces total in aplicatie
     * @returns {boolean} True intotdeauna, deoarece utilizatorul este administrator
     */
    areDreptul(){
        return true; //pentru ca e admin
    }
}

/**
 * Clasa pentru reprezentarea rolului de Moderator
 * @extends Rol
 */
class RolModerator extends Rol{
    
    /** * Returneaza identificatorul textual al tipului de rol moderator
     * @type {string} 
     */
    static get tip() {return "moderator"}
    
    /** * Returneaza lista de drepturi specifice unui moderator
     * @type {Symbol[]} 
     */
    static get drepturi() { return [
        Drepturi.vizualizareUtilizatori,
        Drepturi.stergereUtilizatori
    ] }
    
    /**
     * Instantiaza un obiect de tip RolModerator si apeleaza constructorul clasei parinte
     */
    constructor (){
        super()
    }
}

/**
 * Clasa pentru reprezentarea rolului de Administrator de Produse
 * @extends Rol
 */
class RolAdminProd extends Rol{
    
    /** * Returneaza identificatorul textual al tipului de rol adminProd
     * @type {string} 
     */
    static get tip() {return "adminProd"}
    
    /** * Returneaza lista de drepturi legate strict de gestiunea produselor
     * @type {Symbol[]} 
     */
    static get drepturi() { return [
        Drepturi.vizualizareProduse,
        Drepturi.stergereProduse,
        Drepturi.adaugareProduse

    ] }
    
    /**
     * Instantiaza un obiect de tip RolAdminProd si apeleaza constructorul clasei parinte
     */
    constructor (){
        super()
    }
}

/**
 * Clasa pentru reprezentarea rolului de Client (Utilizator Comun)
 * @extends Rol
 */
class RolClient extends Rol{
    /** * Returneaza identificatorul textual al tipului de rol client comun
     * @type {string} 
     */
    static get tip() {return "comun"}
    
    /** * Returneaza lista de drepturi specifice unui client obisnuit
     * @type {Symbol[]} 
     */
    static get drepturi() { return [
        Drepturi.cumparareProduse
    ] }
    
    /**
     * Instantiaza un obiect de tip RolClient si apeleaza constructorul clasei parinte
     */
    constructor (){
        super()
    }
}

/**
 * Fabrica de obiecte (Factory) responsabila pentru crearea si returnarea instantelor de roluri potrivite
 */
class RolFactory{
    /**
     * Metoda statica de tip Factory care creeaza un rol pe baza unui cod de tip text primit
     * @param {string} tip - Codul textual al rolului solicitat (ex: "admin", "moderator", "adminProd", "comun")
     * @returns {RolAdmin|RolModerator|RolAdminProd|RolClient|undefined} Instanta specifica a clasei de rol create sau undefined daca tipul nu este recunoscut
     */
    static creeazaRol(tip) {
        switch(tip){
            case RolAdmin.tip : return new RolAdmin();
            case RolModerator.tip : return new RolModerator();
            case RolAdminProd.tip : return new RolAdminProd();
            case RolClient.tip : return new RolClient();
        }
    }
}


module.exports={
    RolFactory:RolFactory,
    Rol:Rol
}