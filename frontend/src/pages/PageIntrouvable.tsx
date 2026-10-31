// Page introuvable (écran 18) : toute adresse qui ne correspond à aucune route.
import { useEffect } from "react";
import { Link } from "react-router-dom";

export function PageIntrouvable() {
  useEffect(() => {
    document.title = "Page introuvable — HIT-T Institute";
  }, []);

  return (
    <main className="conteneur introuvable">
      <img src="/illustrations/introuvable.svg" alt="" className="introuvable__illustration" />
      <p className="surtitre">Erreur 404</p>
      <h1>Cette page n'existe pas</h1>
      <p className="introuvable__texte">
        Le lien est peut-être incorrect, ou la formation a été retirée du catalogue.
      </p>
      <div className="introuvable__actions">
        <Link to="/formations" className="bouton">
          Retour au catalogue
        </Link>
        <Link to="/">Page d'accueil</Link>
      </div>
    </main>
  );
}
