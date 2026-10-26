import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function EnTete() {
  const { utilisateur, deconnecter } = useAuth();

  return (
    <header className="en-tete">
      <div className="conteneur en-tete__barre">
        <Link to="/" className="en-tete__logo" aria-label="Accueil HIT-T Institute">
          <img src="/logo-hitt.svg" alt="HIT-T Institute" />
        </Link>
        <nav className="en-tete__nav">
          <NavLink to="/" end>
            Formations
          </NavLink>
          {utilisateur?.role === "apprenant" && (
            <>
              <NavLink to="/questionnaire">Questionnaire</NavLink>
              <NavLink to="/recommandations">Mes recommandations</NavLink>
            </>
          )}
          {utilisateur?.role === "administrateur" && <NavLink to="/admin">Administration</NavLink>}
          {utilisateur ? (
            <Link to="/" onClick={deconnecter}>
              Se déconnecter
            </Link>
          ) : (
            <NavLink to="/connexion">Se connecter</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
