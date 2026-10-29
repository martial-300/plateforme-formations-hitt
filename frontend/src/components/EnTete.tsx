import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import type { Utilisateur } from "../api/types";
import { useAuth } from "../auth/useAuth";

interface Lien {
  vers: string;
  libelle: string;
  /** Actif seulement sur ce chemin exact (sinon aussi sur ses sous-pages). */
  exact?: boolean;
}

/** Navigation selon le rôle (écrans 06, 07, 09) ; le contrôle réel des droits est fait par l'API. */
function liensSelonRole(utilisateur: Utilisateur | null): Lien[] {
  const catalogue = { vers: "/formations", libelle: "Catalogue des formations" };
  if (utilisateur?.role === "administrateur") {
    return [{ vers: "/admin", libelle: "Tableau de bord" }, catalogue];
  }
  if (utilisateur?.role === "apprenant") {
    return [
      catalogue,
      { vers: "/questionnaire", libelle: "Mon questionnaire" },
      { vers: "/recommandations", libelle: "Mes recommandations" },
    ];
  }
  return [catalogue, { vers: "/essai", libelle: "Obtenir mes recommandations" }];
}

/** Libellé de la bande verte sur mobile (M1, M5) : la rubrique de la page affichée. */
function rubrique(chemin: string, liens: Lien[]): string {
  if (chemin === "/connexion" || chemin === "/inscription") return "Espace apprenant";
  if (chemin === "/essai") return "Essai sans compte";
  const lien = liens.find((l) => chemin === l.vers || chemin.startsWith(`${l.vers}/`));
  return lien?.libelle ?? "Accueil";
}

function IconeDeconnexion() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Identite() {
  return (
    <Link to="/" className="en-tete__identite" aria-label="HIT-T Institute, accueil">
      <img src="/logo-hitt.svg" alt="" />
      <span>
        <strong>HIT-T Institute</strong>
        <small>Plateforme d&apos;orientation des apprenants</small>
      </span>
    </Link>
  );
}

export function EnTete() {
  const { utilisateur, deconnecter } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Le menu mobile retient la page où il a été ouvert : il se ferme dès qu'on en change.
  const [menuOuvertSur, setMenuOuvertSur] = useState<string | null>(null);
  const menuOuvert = menuOuvertSur === pathname;
  const fermerMenu = () => setMenuOuvertSur(null);
  const liens = liensSelonRole(utilisateur);

  // Échap ferme le menu ; la page derrière ne défile pas tant qu'il est ouvert.
  useEffect(() => {
    if (!menuOuvert) return;
    const surTouche = (e: KeyboardEvent) => e.key === "Escape" && setMenuOuvertSur(null);
    document.addEventListener("keydown", surTouche);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", surTouche);
      document.body.style.overflow = "";
    };
  }, [menuOuvert]);

  function seDeconnecter() {
    fermerMenu();
    deconnecter();
    navigate("/");
  }

  const compte = utilisateur ? (
    <>
      <span className="en-tete__compte">
        <strong>
          {utilisateur.prenom} {utilisateur.nom}
        </strong>
        <small>
          {utilisateur.role === "administrateur" ? "Accès administrateur" : "Espace apprenant"}
        </small>
      </span>
      <button type="button" className="lien-action" onClick={seDeconnecter}>
        <IconeDeconnexion />
        Se déconnecter
      </button>
    </>
  ) : (
    <>
      <Link to="/connexion" className="en-tete__connexion">
        Se connecter
      </Link>
      <Link to="/inscription" className="bouton">
        Créer un compte
      </Link>
    </>
  );

  return (
    <header className="en-tete">
      <div className="en-tete__haut">
        <div className="conteneur en-tete__barre">
          <Identite />
          <div className="en-tete__actions">{compte}</div>
          <button
            type="button"
            className="en-tete__menu"
            aria-expanded={menuOuvert}
            aria-controls="menu-mobile"
            onClick={() => setMenuOuvertSur(pathname)}
          >
            Menu
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      <nav className="en-tete__nav" aria-label="Navigation principale">
        <div className="conteneur">
          <ul className="en-tete__liens">
            {liens.map((lien) => (
              <li key={lien.vers}>
                <NavLink to={lien.vers} end={lien.exact}>
                  {lien.libelle}
                </NavLink>
              </li>
            ))}
          </ul>
          <p className="en-tete__rubrique">{rubrique(pathname, liens)}</p>
        </div>
      </nav>

      {menuOuvert && (
        <div
          id="menu-mobile"
          className="menu-mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="conteneur en-tete__barre">
            <Identite />
            <button
              type="button"
              className="en-tete__menu en-tete__menu--fermer"
              onClick={fermerMenu}
              autoFocus
            >
              Fermer
            </button>
          </div>
          <div className="conteneur">
            <ul className="menu-mobile__liens">
              {liens.map((lien) => (
                <li key={lien.vers}>
                  <NavLink to={lien.vers} end={lien.exact} onClick={fermerMenu}>
                    {lien.libelle}
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="menu-mobile__compte">{compte}</div>
          </div>
        </div>
      )}
    </header>
  );
}
