/** @type {string} Sir de caractere ce contine toate caracterele alfanumerice (cifre, litere mari si litere mici) folosite pentru generarea token-urilor */
let sirAlphaNum="";

/** @type {number[][]} Vector de intervale ce contin codurile ASCII pentru cifre [48,57], litere mari [65,90] si litere mici [97,122] */
const v_intervale=[[48,57],[65,90],[97,122]];

for(let interval of v_intervale){
    for(let i=interval[0]; i<=interval[1]; i++)
        sirAlphaNum+=String.fromCharCode(i)
}

console.log(sirAlphaNum);

/**
 * Genereaza un token aleatoriu de o lungime specificata, compus exclusiv din caractere alfanumerice
 * @param {number} n - Lungimea dorita a token-ului generat
 * @returns {string} Un sir de caractere aleatorii de lungime n
 */
function genereazaToken(n){
    let token=""
    for (let i=0;i<n; i++){
        token+=sirAlphaNum[Math.floor(Math.random()*sirAlphaNum.length)]
    }
    return token;
}

module.exports.genereazaToken=genereazaToken;