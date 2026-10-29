// Écran 16 : ajouter une formation au catalogue (RF-04).
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChampsFormation } from "../admin/ChampsFormation";
import { SAISIE_FORMATION_VIDE } from "../admin/saisieFormation";
import { useSaisieFormation } from "../admin/useSaisieFormation";
import { creerFormation } from "../api/formations";
import { messageErreur } from "../auth/useConnexion";

export function PageNouvelleFormation() {
  const navigate = useNavigate();
  const { saisie, erreurs, modifier, valider } = useSaisieFormation(SAISIE_FORMATION_VIDE);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    document.title = "Ajouter une formation — HIT-T Institute";
  }, []);

  async function enregistrer(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setErreur(null);
    const corps = valider();
    if (!corps) return;
    setEnvoi(true);
    try {
      const formation = await creerFormation(corps);
      navigate("/admin", {
        state: { message: `« ${formation.intitule} » est ajoutée au catalogue.` },
      });
    } catch (e) {
      setErreur(messageErreur(e));
      setEnvoi(false);
    }
  }

  return (
    <main className="conteneur nouvelle-formation">
      <nav className="fil-ariane" aria-label="Fil d'Ariane">
        <Link to="/admin">Administration</Link> / <Link to="/admin">Catalogue</Link> /{" "}
        <span aria-current="page">Nouvelle formation</span>
      </nav>
      <h1>Ajouter une formation</h1>

      <div className="nouvelle-formation__grille">
        <form className="nouvelle-formation__carte" onSubmit={enregistrer} noValidate>
          {erreur && (
            <div className="alerte" role="alert">
              <p className="alerte__titre">La formation n&apos;a pas été enregistrée</p>
              <p>{erreur}</p>
            </div>
          )}
          <ChampsFormation saisie={saisie} erreurs={erreurs} modifier={modifier} exemples />
          <div className="nouvelle-formation__actions">
            <Link to="/admin" className="lien-texte">
              Annuler
            </Link>
            <button type="submit" className="bouton" disabled={envoi}>
              {envoi ? "Enregistrement…" : "Enregistrer la formation"}
            </button>
          </div>
        </form>

        <aside className="nouvelle-formation__conseils" aria-labelledby="titre-conseils">
          <h2 id="titre-conseils">Conseils de saisie</h2>
          <p>
            Description : une à deux phrases simples, centrées sur ce que l&apos;apprenant saura
            faire.
          </p>
          <p>
            Mots-clés : six à huit, séparés par des virgules. Ils servent directement au calcul des
            recommandations.
          </p>
          <p>Prix promo : laisser vide pour les parcours modulaires.</p>
          <p>La formation est visible dans le catalogue dès l&apos;enregistrement.</p>
        </aside>
      </div>
    </main>
  );
}
