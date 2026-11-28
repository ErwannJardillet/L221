/* ==========================================================
   form.js — Vidéo « Découvrez mon parcours »

   Tout est créé en JS pur : index.html ne contient qu'une
   <div id="parcours">. Le script y ajoute :
     - un texte d'introduction,
     - le bouton 1 (affiche la vidéo),
     - le bouton 2 (masque la vidéo),
     - la vidéo dans son cadre.
   Les animations sont en CSS (form.css) : le JS ne fait
   qu'ajouter/retirer des éléments et des classes.
   ========================================================== */

'use strict';


/* ---------- Réglages ---------- */

// Si l'utilisateur a demandé « moins d'animations » dans son système,
// on bascule instantanément (durée 0).
const reduireAnimations = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DUREE = reduireAnimations ? 0 : 400; // en millisecondes

// La vidéo demandée (.ogv) + deux formats de secours :
// le navigateur lit le premier format qu'il sait lire.
// Les codecs sont précisés dans le type : sans eux, Chrome (qui ne décode plus
// l'image Theora des .ogv) choisirait le .ogv et ne lirait que le son.
const ADRESSE_VIDEO = 'https://tecfa.unige.ch/guides/html/html5-video/videos/state-of-wikipedia-480x272';
const FORMATS = [
    { extension: '.ogv', type: 'video/ogg; codecs="theora, vorbis"' },
    { extension: '.webm', type: 'video/webm' },
    { extension: '.mp4', type: 'video/mp4' }
];


/* ---------- La div prévue dans index.html ---------- */

const parcours = document.getElementById('parcours');

// On transmet la durée au CSS pour que animations et minuteries soient synchronisées
parcours.style.setProperty('--duree-parcours', DUREE + 'ms');


/* ---------- Fonctions utilitaires ---------- */

// Crée un bouton avec une icône (dessinée en CSS) et un texte
function creerBouton(texte, type) {
    const bouton = document.createElement('button');
    bouton.type = 'button'; // un simple bouton, pas un envoi de formulaire
    bouton.className = 'parcours-bouton parcours-bouton--' + type;

    const icone = document.createElement('span');
    icone.className = 'parcours-icone';
    icone.setAttribute('aria-hidden', 'true'); // décoratif : ignoré par les lecteurs d'écran

    const libelle = document.createElement('span');
    libelle.textContent = texte;

    bouton.append(icone, libelle);
    return bouton;
}

// Lance l'animation de sortie (classe CSS), puis retire l'élément de la page
function faireDisparaitre(element, ensuite) {
    element.classList.add('est-sortant');

    setTimeout(function () {
        element.remove();
        element.classList.remove('est-sortant'); // prêt pour la prochaine apparition
        if (ensuite) {
            ensuite();
        }
    }, DUREE);
}


/* ---------- Création des éléments ---------- */

// Texte d'introduction
const intro = document.createElement('p');
intro.className = 'parcours-intro';
intro.textContent = 'Besoin d\'inspiration avant de proposer votre article ?';

// Bouton 1 et bouton 2
const bouton1 = creerBouton('Découvrez mon parcours', 'ouvrir');
const bouton2 = creerBouton('Masquer la vidéo', 'fermer');

// Cadre de la vidéo
const cadreVideo = document.createElement('div');
cadreVideo.className = 'parcours-video';

// La vidéo
const video = document.createElement('video');
video.controls = true;
video.preload = 'none'; // rien n'est téléchargé tant qu'on ne clique pas
video.width = 480;
video.height = 272;

FORMATS.forEach(function (format) {
    const source = document.createElement('source');
    source.src = ADRESSE_VIDEO + format.extension;
    source.type = format.type;
    video.appendChild(source);
});

video.append('Votre navigateur ne permet pas de lire cette vidéo.');

// Légende sous la vidéo
const legende = document.createElement('p');
legende.className = 'parcours-legende';
legende.textContent = 'Vidéo « State of Wikipedia » — source : TECFA, Université de Genève';

// Si aucun format ne peut être lu (hors ligne…), on prévient l'utilisateur
video.lastElementChild.addEventListener('error', function () {
    cadreVideo.classList.add('est-en-erreur');
    legende.textContent = 'La vidéo n\'a pas pu être chargée. Vérifiez votre connexion internet.';
});

cadreVideo.append(video, legende);


/* ---------- Affichage de départ : seulement le bouton 1 ---------- */

parcours.append(intro, bouton1);


/* ---------- Clic sur le bouton 1 : afficher la vidéo ---------- */

let animationEnCours = false; // empêche les doubles clics pendant une animation

function afficherVideo() {
    if (animationEnCours) {
        return;
    }
    animationEnCours = true;

    faireDisparaitre(bouton1, function () {
        // Le bouton 2 prend la place du bouton 1, la vidéo se déplie dessous
        parcours.append(bouton2, cadreVideo);

        // Le focus clavier suit le bouton (le bouton 1 n'existe plus)
        bouton2.focus({ preventScroll: true });

        // On fait défiler juste assez pour voir toute la vidéo
        parcours.scrollIntoView({
            behavior: reduireAnimations ? 'auto' : 'smooth',
            block: 'nearest'
        });

        // Lecture automatique : autorisée car elle suit un clic de l'utilisateur
        video.play().catch(function () {
            // Lecture bloquée par le navigateur : l'utilisateur pourra cliquer sur ▶
        });

        animationEnCours = false;
    });
}


/* ---------- Clic sur le bouton 2 : masquer la vidéo ---------- */

function masquerVideo() {
    if (animationEnCours) {
        return;
    }
    animationEnCours = true;

    video.pause(); // on coupe le son tout de suite

    // Le bouton 2 et la vidéo disparaissent ensemble…
    faireDisparaitre(bouton2);
    faireDisparaitre(cadreVideo, function () {
        // … puis le bouton 1 réapparaît
        parcours.append(bouton1);
        bouton1.focus({ preventScroll: true });
        animationEnCours = false;
    });
}


/* ---------- Écouteurs d'événements ---------- */

bouton1.addEventListener('click', afficherVideo);
bouton2.addEventListener('click', masquerVideo);

// Raccourci : la touche Échap ferme la vidéo (si le focus est dans la zone)
parcours.addEventListener('keydown', function (evenement) {
    if (evenement.key === 'Escape' && cadreVideo.isConnected) {
        masquerVideo();
    }
});
