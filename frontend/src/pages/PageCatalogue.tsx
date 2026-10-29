// Catalogue des formations (RF-05) : maquettes 03 (desktop) et M1 (mobile).
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { listerFormations } from "../api/formations";
import type { Domaine, Formation, TypeFormation } from "../api/types";
import { Prix } from "../catalogue/Prix";
import {
  DOMAINE_COURT,
  DOMAINES,
  estDomaine,
  estType,
  formaterDuree,
  TYPE_COURT,
} from "../catalogue/libelles";
import { useEstMobile } from "../catalogue/useEstMobile";
import { Bandeau } from "../components/Photo";

const PAR_PAGE = 8;

type Etat =
  | { statut: "chargement" }
  | { statut: "erreur"; message: string }
  | { statut: "pret"; formations: Formation[] };

export function PageCatalogue() {
  const [etat, setEtat] = useState<Etat>({ statut: "chargement" });
  const [essai, setEssai] = useState(0);
  const [parametres, setParametres] = useSearchParams();
  const estMobile = useEstMobile();
  const location = useLocation();
  const haut = useRef<HTMLDivElement>(null);

  // Filtres et page dans l'URL : « Retour au catalogue » retrouve la même vue.
  const domaine = estDomaine(parametres.get("domaine"))
    ? (parametres.get("domaine") as Domaine)
    : null;
  const type = estType(parametres.get("type")) ? (parametres.get("type") as TypeFormation) : null;
  const page = Math.max(1, Number.parseInt(parametres.get("page") ?? "1", 10) || 1);
  // Sur mobile, « Afficher plus » allonge la liste ; remis à zéro quand les filtres changent.
  const cleFiltres = `${domaine}|${type}`;
  const [plus, setPlus] = useState({ cle: cleFiltres, nombre: PAR_PAGE });
  const nombreMobile = plus.cle === cleFiltres ? plus.nombre : PAR_PAGE;

  useEffect(() => {
    document.title = "Catalogue des formations — HIT-T Institute";
  }, []);

  useEffect(() => {
    let actif = true;
    // 86 formations : tout est chargé en une fois, les onglets et le filtre agissent sur place.
    listerFormations()
      .then((formations) => actif && setEtat({ statut: "pret", formations }))
      .catch((erreur: Error) => actif && setEtat({ statut: "erreur", message: erreur.message }));
    return () => {
      actif = false;
    };
  }, [essai]);

  function changerFiltres(modifs: { domaine?: Domaine | null; type?: TypeFormation | null }) {
    const suivant = new URLSearchParams();
    const d = modifs.domaine !== undefined ? modifs.domaine : domaine;
    const t = modifs.type !== undefined ? modifs.type : type;
    if (d) suivant.set("domaine", d);
    if (t) suivant.set("type", t);
    setParametres(suivant, { replace: true });
  }

  function changerPage(numero: number) {
    const suivant = new URLSearchParams(parametres);
    if (numero > 1) suivant.set("page", String(numero));
    else suivant.delete("page");
    setParametres(suivant);
    haut.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function reessayer() {
    setEtat({ statut: "chargement" });
    setEssai((n) => n + 1);
  }

  // L'API trie par ordre alphabétique (IA-Data d'abord) ; la maquette suit l'ordre SISG, IA, TRIT.
  const toutes =
    etat.statut === "pret"
      ? [...etat.formations].sort(
          (a, b) => DOMAINES.indexOf(a.domaine) - DOMAINES.indexOf(b.domaine),
        )
      : [];
  const filtrees = toutes.filter(
    (f) => (!domaine || f.domaine === domaine) && (!type || f.type === type),
  );
  const nbPages = Math.max(1, Math.ceil(filtrees.length / PAR_PAGE));
  const pageCourante = Math.min(page, nbPages);
  const debut = estMobile ? 0 : (pageCourante - 1) * PAR_PAGE;
  const visibles = filtrees.slice(debut, estMobile ? nombreMobile : debut + PAR_PAGE);

  return (
    <>
      <Bandeau nom="etudiants" />
      <main className="conteneur catalogue">
        <div className="catalogue__intro">
          <div>
            <nav className="fil-ariane" aria-label="Fil d'Ariane">
              <Link to="/">Accueil</Link> / <span aria-current="page">Catalogue</span>
            </nav>
            <h1>Catalogue des formations</h1>
            <p className="catalogue__chapo">
              {etat.statut === "pret" ? `${toutes.length} formations` : "Les formations"} réparties
              en trois domaines : Secrétariat et Gestion (SISG), IA, Data science et Blockchain,
              Informatique et Télécoms (TRIT).
            </p>
          </div>
          <aside className="encart">
            <img src="/illustrations/choix.svg" alt="" className="encart__illustration" />
            <h2>Vous ne savez pas quoi choisir ?</h2>
            <p>
              Répondez au questionnaire : la plateforme sélectionne automatiquement les cinq
              formations les plus proches de votre profil. Un conseiller du cabinet peut aussi vous
              aider.
            </p>
            <Link to="/questionnaire" className="bouton bouton--secondaire">
              Répondre au questionnaire
            </Link>
          </aside>
        </div>

        <div className="catalogue__filtres" ref={haut}>
          <div className="onglets" role="group" aria-label="Domaine">
            <button
              type="button"
              className="onglets__onglet"
              aria-pressed={domaine === null}
              onClick={() => changerFiltres({ domaine: null })}
            >
              {estMobile ? "Tous" : "Tous les domaines"}
            </button>
            {DOMAINES.map((d) => (
              <button
                key={d}
                type="button"
                className="onglets__onglet"
                aria-pressed={domaine === d}
                onClick={() => changerFiltres({ domaine: d })}
              >
                {DOMAINE_COURT[d]}
              </button>
            ))}
          </div>
          <label className="champ catalogue__type">
            <span className="champ__libelle">Type de formation</span>
            <select
              className="champ__saisie"
              value={type ?? ""}
              onChange={(e) =>
                changerFiltres({ type: estType(e.target.value) ? e.target.value : null })
              }
            >
              <option value="">Tous les types</option>
              <option value="carte">À la carte</option>
              <option value="modulaire">Modulaire · certifiante</option>
            </select>
          </label>
        </div>

        {etat.statut === "chargement" && (
          <p className="catalogue__message" role="status">
            Chargement du catalogue…
          </p>
        )}

        {etat.statut === "erreur" && (
          <div className="catalogue__message" role="alert">
            <p>Le catalogue n'a pas pu être chargé : {etat.message}</p>
            <button type="button" className="bouton bouton--secondaire" onClick={reessayer}>
              Réessayer
            </button>
          </div>
        )}

        {etat.statut === "pret" && filtrees.length === 0 && (
          <div className="catalogue__message" role="status">
            <p>Aucune formation ne correspond à ces filtres.</p>
            <button
              type="button"
              className="bouton bouton--secondaire"
              onClick={() => changerFiltres({ domaine: null, type: null })}
            >
              Voir toutes les formations
            </button>
          </div>
        )}

        {visibles.length > 0 && (
          <>
            <div className="liste-formations__entete" aria-hidden="true">
              <span>Domaine</span>
              <span>Formation</span>
              <span>Durée</span>
              <span className="liste-formations__tarif">Tarif</span>
            </div>
            <ul className="liste-formations">
              {visibles.map((f) => (
                <li key={f.id}>
                  <Link
                    to={`/formations/${f.id}`}
                    state={{ catalogue: location.search }}
                    className="ligne-formation"
                  >
                    <span className="ligne-formation__domaine">
                      <span className="surtitre">{DOMAINE_COURT[f.domaine]}</span>
                      <span className="ligne-formation__type">{TYPE_COURT[f.type]}</span>
                    </span>
                    <span className="ligne-formation__texte">
                      <span className="ligne-formation__intitule">{f.intitule}</span>
                      <span className="ligne-formation__description">{f.description}</span>
                    </span>
                    <span className="ligne-formation__duree">{formaterDuree(f)}</span>
                    <span className="ligne-formation__tarif">
                      <Prix formation={f} />
                    </span>
                    <span className="ligne-formation__chevron" aria-hidden="true">
                      ›
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {estMobile ? (
              nombreMobile < filtrees.length && (
                <button
                  type="button"
                  className="bouton bouton--secondaire bouton--large"
                  onClick={() => setPlus({ cle: cleFiltres, nombre: nombreMobile + PAR_PAGE })}
                >
                  Afficher plus de formations
                </button>
              )
            ) : (
              <div className="pagination">
                <p>
                  Formations {debut + 1} à {debut + visibles.length} sur {filtrees.length}
                </p>
                {nbPages > 1 && (
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
                )}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
