DROP TABLE IF EXISTS prajituri CASCADE;
DROP TABLE IF EXISTS produse CASCADE;

DROP TYPE IF EXISTS tipuri_produse CASCADE;
DROP TYPE IF EXISTS timp_servire CASCADE;

CREATE TYPE timp_servire AS ENUM ('mic dejun', 'prânz/cină', 'toată ziua');
CREATE TYPE tipuri_produse AS ENUM ('fel-principal', 'garnitura', 'snack', 'desert', 'bautura');

CREATE TABLE produse (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(50) UNIQUE NOT NULL,
    descriere TEXT,
    pret NUMERIC(8,2) NOT NULL,
    gramaj INT NOT NULL CHECK (gramaj >= 0),   
    tip_produs tipuri_produse DEFAULT 'fel-principal',
    categorie timp_servire DEFAULT 'toată ziua',
    ingrediente VARCHAR[], 
    vegetarian BOOLEAN NOT NULL DEFAULT TRUE,
    imagine VARCHAR(300),
    data_adaugare TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO produse (nume, descriere, pret, gramaj, tip_produs, categorie, ingrediente, vegetarian, imagine) VALUES 
('Friptură', 'Piept de pui fraged, fript pe grătarul încins.', 18.50, 200, 'fel-principal', 'prânz/cină', '{"carne pui","ulei","sare","piper","cimbru"}', FALSE, 'friptura.webp'),
('Mici', 'Mititei zemoși din carne proaspătă de porc și vită.', 5.00, 60, 'fel-principal', 'prânz/cină', '{"carne porc","carne vita","bicarbonat","usturoi"}', FALSE, 'mici.png'),
('Cârnați', 'Cârnați românești afumați, rumeniți frumos pe grătar.', 14.00, 150, 'fel-principal', 'prânz/cină', '{"carne porc","usturoi","boia dulce","sare"}', FALSE, 'carnati.jpeg'),
('Cartofi prăjiți', 'Cartofi tăiați și prăjiți până devin aurii.', 8.50, 150, 'garnitura', 'toată ziua', '{"cartofi","ulei","sare"}', TRUE, 'cartofi_prajiti.jpg'),
('Varză', 'Salată proaspătă din varză albă fin tocată.', 6.00, 150, 'garnitura', 'prânz/cină', '{"varza alba","ulei","otet","sare"}', TRUE, 'varza.png'),
('Murături', 'Gogonele și castraveți murați în saramură.', 7.00, 150, 'garnitura', 'prânz/cină', '{"castraveti","gogonele","apa","sare"}', TRUE, 'muraturi.png'),
('Shaorma cu pui', 'Shaorma cu lipie proaspătă, pui și sosuri.', 26.00, 450, 'fel-principal', 'toată ziua', '{"carne pui","lipie","cartofi prajiti","varza"}', FALSE, 'shaorma_pui.png'),
('Shaorma cu vită', 'Shaorma tradițională cu carne macră de vită.', 29.00, 450, 'fel-principal', 'prânz/cină', '{"carne vita","lipie","cartofi prajiti","varza"}', FALSE, 'shaorma_vita.png'),
('Shaorma Vegetariană', 'Shaorma fără carne, cu extra cartofi și salate.', 20.00, 400, 'fel-principal', 'toată ziua', '{"lipie","cartofi prajiti","varza","rosii"}', TRUE, 'shorma_vegetariana.png'),
('Pufuleți Lotto', 'Pufuleți crocanți cu aromă bogată de cașcaval.', 3.50, 45, 'snack', 'toată ziua', '{"faina porumb","ulei","pudra cascaval"}', TRUE, 'pufuleti_lotto.png'),
('Kubeti', 'Cubulețe din pâine prăjită, bine condimentate.', 4.00, 40, 'snack', 'toată ziua', '{"faina grau","ulei de palmier","sare"}', TRUE, 'kubeti.png'),
('Semințe pestrițe', 'Semințe de floarea-soarelui pestrițe, sărate.', 5.00, 100, 'snack', 'toată ziua', '{"seminte floarea soarelui","sare"}', TRUE, 'seminte_pestrite.png'),
('Napolitane Joe', 'Napolitane crocante umplute cu cremă de cacao.', 4.50, 50, 'desert', 'toată ziua', '{"faina grau","zahar","cacao"}', TRUE, 'napolitane_joe.png'),
('Pernițe Viva', 'Pernițe din cereale umplute cu cremă de cacao.', 6.00, 100, 'desert', 'toată ziua', '{"faina grau","faina orez","crema cacao"}', TRUE, 'pernite_viva.png'),
('Eugenia', 'Biscuitul tradițional cu cremă de cacao și rom.', 2.00, 40, 'desert', 'toată ziua', '{"faina grau","zahar","crema cacao"}', TRUE, 'eugenia.jpg'),
('Ciocobanana', 'Spumă cu gust de banane și glazură de ciocolată.', 3.00, 25, 'desert', 'toată ziua', '{"zahar","sirop glucoza","cacao"}', TRUE, 'ciocobanana.jpg'),
('Ciuc', 'Bere blondă românească premium lager.', 8.00, 500, 'bautura', 'prânz/cină', '{"apa","malt din orz","hamei"}', TRUE, 'ciuc.jpg'),
('Ursus', 'Bere blondă autohtonă cu un gust plin.', 8.50, 500, 'bautura', 'prânz/cină', '{"apa","malt din orz","hamei"}', TRUE, 'ursus.png'),
('Cidru', 'Băutură obținută prin fermentarea sucului de mere.', 10.00, 330, 'bautura', 'toată ziua', '{"suc mere fermentat","zahar"}', TRUE, 'cidru.webp'),
('Pepsi', 'Băutură răcoritoare carbogazoasă clasică.', 6.50, 330, 'bautura', 'toată ziua', '{"apa carbogazoasa","zahar","cofeina"}', TRUE, 'pepsi.png'),
('Cola', 'Băutură răcoritoare carbogazoasă revigorantă.', 6.50, 330, 'bautura', 'toată ziua', '{"apa carbogazoasa","zahar","cofeina"}', TRUE, 'cola.webp'),
('Mirinda', 'Băutură răcoritoare cu gust de portocale.', 6.50, 330, 'bautura', 'toată ziua', '{"apa carbogazoasa","zahar","acid citric"}', TRUE, 'mirinda.png'),
('Cafea', 'Espresso scurt și aromat pentru dimineață.', 7.00, 60, 'bautura', 'mic dejun', '{"apa","cafea macinata"}', TRUE, 'cafea.webp'),
('Ceai', 'Infuzie caldă din plante sau fructe.', 6.00, 200, 'bautura', 'mic dejun', '{"apa","infuzie plante","zahar"}', TRUE, 'ceai.jpg');

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sabina;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sabina;

