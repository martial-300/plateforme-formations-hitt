// Tableau de bord de l'administrateur (RF-11) et gestion du catalogue (RF-04) : écrans 07, 08, 17.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { lireStatistiques } from "../api/admin";
import { listerFormations } from "../api/formations";
import type { Domaine, Formation, Statistiques } from "../api/types";
import { ConfirmationSuppression } from "../admin/ConfirmationSuppression";
import { FenetreModification } from "../admin/FenetreModification";
import { messageErreur } from "../auth/useConnexion";
import { DOMAINE_COURT, DOMAINES, formaterDuree } from "../catalogue/libelles";
import { formaterNombre } from "../questionnaire/reponses";

const PAR_PAGE = 10;
const OBJECTIF_PERTINENT = 0.7; // cahier des charges § 11

/** Comparaison sans accents ni majuscules : « developpement » trouve « Développement ». */
function normaliser(texte: string): string {
  return texte.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function pourcentage(taux: number): string {
  return `${Math.round(taux * 100)}\u00a0%`;
}

function ChiffresCles({ statistiques }: { statistiques: Statistiques }) {
  const { nb_apprenants, top_formations, nb_retours, nb_retours_pertinents, taux_pertinent } =
    statistiques;
  return (
    <div className="tableau-bord">
      <section className="indicateur" aria-labelledby="titre-apprenants">
        <h2 id="titre-apprenants" className="surtitre">
          Apprenants inscrits
        </h2>
        <p className="indicateur__valeur">{formaterNombre(nb_apprenants)}</p>
        <p className="indicateur__detail">comptes apprenants créés depuis l&apos;ouverture</p>
      </section>
      <section className="indicateur" aria-labelledby="titre-pertinent">
        <h2 id="titre-pertinent" className="surtitre">
          Avis « pertinent »
        </h2>
        <p className="indicateur__valeur">
          {taux_pertinent === null ? "—" : pourcentage(taux_pertinent)}
        </p>
        <p className="indicateur__detail">
          {nb_retours === 0
            ? "Aucun avis donné pour l'instant"
            : `${nb_retours_pertinents} avis positif${nb_retours_pertinents > 1 ? "s" : ""} sur ${nb_retours} donné${nb_retours > 1 ? "s" : ""}`}{" "}
          — objectif : {pourcentage(OBJECTIF_PERTINENT)}
        </p>
      </section>
      <section className="indicateur indicateur--top" aria-labelledby="titre-top">
        <h2 id="titre-top" className="surtitre">
          Formations les plus recommandées
        </h2>
        {top_formations.length === 0 ? (
          <p className="indicateur__detail">Aucune recommandation calculée pour l&apos;instant.</p>
        ) : (
          <ol className="top-formations">
            {top_formations.map((formation, index) => (
              <li key={formation.formation_id}>
                <span className="top-formations__rang">{index + 1}</span>
                <Link to={`/formations/${formation.formation_id}`}>{formation.intitule}</Link>
                <span className="top-formations__nombre">{formation.nb_recommandations} fois</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

export function PageAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [statistiques, setStatistiques] = useState<Statistiques | null>(null);
  const [formations, setFormations] = useState<Formation[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [domaine, setDomaine] = useState<Domaine | null>(null);
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);
  const [enModification, setEnModification] = useState<Formation | null>(null);
  const [aSupprimer, setASupprimer] = useState<Formation | null>(null);
  // Message après un ajout (transmis par la page d'ajout), une modification ou une suppression.
  const [message, setMessage] = useState<string | null>(
    (location.state as { message?: string } | null)?.message ?? null,
  );
  const titreCatalogue = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.title = "Tableau de bord — HIT-T Institute";
    // Le message d'ajout ne doit pas réapparaître si la page est rechargée.
    if (location.state) navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const charger = useCallback(async () => {
    try {
      const [chiffres, liste] = await Promise.all([lireStatistiques(), listerFormations()]);
      setStatistiques(chiffres);
      setFormations(liste);
      setErreur(null);
    } catch (e) {
      setErreur(messageErreur(e));
    }
  }, []);

  useEffect(() => {
    let actif = true;
    Promise.all([lireStatistiques(), listerFormations()])
      .then(([chiffres, liste]) => {
        if (!actif) return;
        setStatistiques(chiffres);
        setFormations(liste);
      })
      .catch((e: unknown) => actif && setErreur(messageErreur(e)));
    return () => {
      actif = false;
    };
  }, []);

  const parDomaine = useMemo(() => {
    const comptes = Object.fromEntries(DOMAINES.map((d) => [d, 0])) as Record<Domaine, number>;
    for (const formation of formations ?? []) comptes[formation.domaine] += 1;
    return comptes;
  }, [formations]);

  const filtrees = useMemo(() => {
    const cherche = normaliser(recherche.trim());
    return (formations ?? [])
      .filter((f) => !domaine || f.domaine === domaine)
      .filter(
        (f) =>
          !cherche ||
          normaliser(f.intitule).includes(cherche) ||
          f.mots_cles.some((mot) => normaliser(mot).includes(cherche)),
      )
      .sort((a, b) => a.intitule.localeCompare(b.intitule, "fr"));
  }, [formations, domaine, recherche]);

  const nbPages = Math.max(1, Math.ceil(filtrees.length / PAR_PAGE));
  const pageCourante = Math.min(page, nbPages);
  const debut = (pageCourante - 1) * PAR_PAGE;
  const visibles = filtrees.slice(debut, debut + PAR_PAGE);

  function changerPage(nouvelle: number) {
    setPage(nouvelle);
    titreCatalogue.current?.scrollIntoView({ block: "start" });
  }

  async function apresModification(formation: Formation) {
    setEnModification(null);
    setMessage(`« ${formation.intitule} » est enregistrée.`);
    await charger();
  }

  async function apresSuppression(formation: Formation) {
    setASupprimer(null);
    setEnModification(null);
    setMessage(`« ${formation.intitule} » est retirée du catalogue.`);
    await charger();
  }

  return (
    <main className="conteneur admin">
      <p className="fil-ariane">Administration</p>
      <h1>Tableau de bord</h1>

      {erreur && (
        <div className="alerte" role="alert">
          <p className="alerte__titre">Les données n&apos;ont pas pu être chargées</p>
          <p>{erreur}</p>
          <button type="button" className="lien-texte" onClick={charger}>
            Réessayer
          </button>
        </div>
      )}
      {message && (
        <p className="admin__message" role="status">
          {message}
        </p>
      )}

      {statistiques ? (
        <ChiffresCles statistiques={statistiques} />
      ) : (
        !erreur && <p role="status">Chargement des chiffres clés…</p>
      )}

      <section className="admin__catalogue" aria-labelledby="titre-catalogue">
        <div className="admin__entete">
          <div>
            <h2 id="titre-catalogue" ref={titreCatalogue}>
              Catalogue des formations
            </h2>
            <p className="admin__sous-titre">
              {formations ? `${formations.length} formations · ` : ""}descriptions et mots-clés à
              valider par le cabinet
            </p>
          </div>
          <div className="champ admin__recherche">
            <label htmlFor="recherche">Rechercher</label>
            <input
              id="recherche"
              type="search"
              className="champ__saisie"
              placeholder="Intitulé ou mot-clé"
              value={recherche}
              onChange={(e) => {
                setRecherche(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Link to="/admin/formations/nouvelle" className="bouton">
            Ajouter une formation
          </Link>
        </div>

        <div className="onglets" role="group" aria-label="Domaine">
          {[null, ...DOMAINES].map((code) => (
            <button
              key={code ?? "tous"}
              type="button"
              className="onglets__onglet"
              aria-pressed={domaine === code}
              onClick={() => {
                setDomaine(code);
                setPage(1);
              }}
            >
              {code ? DOMAINE_COURT[code] : "Tous les domaines"} (
              {code ? parDomaine[code] : (formations?.length ?? 0)})
            </button>
          ))}
        </div>

        {formations === null ? (
          !erreur && <p role="status">Chargement du catalogue…</p>
        ) : filtrees.length === 0 ? (
          <p className="admin__vide">Aucune formation ne correspond à cette recherche.</p>
        ) : (
          <>
            <table className="table-admin">
              <thead>
                <tr>
                  <th scope="col">Intitulé</th>
                  <th scope="col">Domaine</th>
                  <th scope="col">Type</th>
                  <th scope="col">Durée</th>
                  <th scope="col">Coût</th>
                  <th scope="col">Prix promo</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((formation) => (
                  <tr key={formation.id}>
                    <th scope="row">{formation.intitule}</th>
                    <td className="table-admin__domaine" data-libelle="Domaine">
                      {DOMAINE_COURT[formation.domaine]}
                    </td>
                    <td data-libelle="Type">
                      {formation.type === "carte" ? "À la carte" : "Modulaire"}
                    </td>
                    <td data-libelle="Durée">{formaterDuree(formation)}</td>
                    <td data-libelle="Coût">{formaterNombre(formation.cout_fcfa)}</td>
                    <td data-libelle="Prix promo">
                      {formation.cout_promo_fcfa === null
                        ? "—"
                        : formaterNombre(formation.cout_promo_fcfa)}
                    </td>
                    <td className="table-admin__actions">
                      <button
                        type="button"
                        className="lien-texte"
                        onClick={() => setEnModification(formation)}
                        aria-label={`Modifier « ${formation.intitule} »`}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="lien-texte lien-texte--danger"
                        onClick={() => setASupprimer(formation)}
                        aria-label={`Supprimer « ${formation.intitule} »`}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <p>
                Formations {debut + 1} à {debut + visibles.length} sur {filtrees.length}
              </p>
              <div className="pagination__boutons">
                <button
                  type="button"
                  className="bouton bouton--secondaire"
                  disabled={pageCourante === 1}
                  onClick={() => changerPage(pageCourante - 1)}
                >
                  Page précédente
                </button>
                <button
                  type="button"
                  className="bouton bouton--secondaire"
                  disabled={pageCourante === nbPages}
                  onClick={() => changerPage(pageCourante + 1)}
                >
                  Page suivante
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Les deux fenêtres peuvent s'empiler : annuler la suppression garde la saisie en cours. */}
      {enModification && (
        <FenetreModification
          formation={enModification}
          surFermeture={() => setEnModification(null)}
          surEnregistrement={apresModification}
          surSuppression={() => setASupprimer(enModification)}
        />
      )}
      {aSupprimer && (
        <ConfirmationSuppression
          formation={aSupprimer}
          surFermeture={() => setASupprimer(null)}
          surSuppression={() => apresSuppression(aSupprimer)}
        />
      )}
    </main>
  );
}
