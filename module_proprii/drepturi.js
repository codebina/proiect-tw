/**
 @typedef Drepturi
 @type {Object}
 @property {Symbol} vizualizareUtilizatori Dreptul de a intra pe  pagina cu tabelul de utilizatori.
 @property {Symbol} stergereUtilizatori Dreptul de a sterge un utilizator
 @property {Symbol} cumparareProduse Dreptul de a cumpara
 @property {Symbol} vizualizareProduse Dreptul de a intra pe  pagina cu tabelul de produse.
 @property {Symbol} stergereProduse Dreptul de a sterge un produs
 @property {Symbol} adaugareProduse Dreptul de a adauga un produs

 @property {Symbol} vizualizareGrafice Dreptul de a vizualiza graficele de vanzari
 */


/**
 * @name module.exports.Drepturi
 * @type Drepturi
 */
const Drepturi = {
	vizualizareUtilizatori: Symbol("vizualizareUtilizatori"),
	stergereUtilizatori: Symbol("stergereUtilizatori"),
	cumparareProduse: Symbol("cumparareProduse"),
	vizualizareGrafice: Symbol("vizualizareGrafice"),
	vizualizareProduse: Symbol("vizualizareProduse"),
    stergereProduse: Symbol("stergereProduse"),
    adaugareProduse: Symbol("adaugareProduse"),

}

module.exports=Drepturi;