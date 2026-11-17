// Inclinaison 3D des cartes d'articles selon la position de la souris.
// La carte se soulève via CSS (:hover) ; ce script ne fait que définir
// les variables --rx (axe X) et --ry (axe Y) à partir de la position du curseur.

(function () {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const MAX_ANGLE = 8; // inclinaison maximale en degrés

    document.querySelectorAll(".articles article").forEach(function (carte) {
        carte.addEventListener("mousemove", function (e) {
            const rect = carte.getBoundingClientRect();
            // Position du curseur entre 0 (bord) et 1 (bord opposé)
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            // Haut de la carte -> s'incline vers l'arrière-haut, et inversement
            const ry = (x - 0.5) * 2 * MAX_ANGLE;
            const rx = (0.5 - y) * 2 * MAX_ANGLE;

            carte.style.setProperty("--rx", rx.toFixed(2) + "deg");
            carte.style.setProperty("--ry", ry.toFixed(2) + "deg");
        });

        carte.addEventListener("mouseleave", function () {
            carte.style.setProperty("--rx", "0deg");
            carte.style.setProperty("--ry", "0deg");
        });
    });
})();
