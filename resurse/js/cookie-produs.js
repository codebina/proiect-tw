window.addEventListener("load", function() {
    let nume = document.getElementsByClassName("nume-produs-titlu")[0];

    if (nume) {
        let numeProdus = nume.innerHTML.trim();

        setCookie("ultimul_produs", numeProdus, 86400000);
    }
});