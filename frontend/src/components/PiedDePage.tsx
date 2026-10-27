import { Link } from "react-router-dom";

/** Pied de page commun à tous les écrans de la maquette v2. */
export function PiedDePage() {
  return (
    <footer className="pied">
      <div className="conteneur">
        <div className="pied__colonnes">
          <div>
            <p className="pied__nom">HIT-T Institute</p>
            <p>Plateforme d&apos;orientation des apprenants — version MVP.</p>
          </div>
          <div>
            <p className="pied__titre">Domaines</p>
            <ul>
              <li>
                <Link to="/formations?domaine=SISG">SISG — Secrétariat et Gestion</Link>
              </li>
              <li>
                <Link to="/formations?domaine=IA-Data">IA, Data science et Blockchain</Link>
              </li>
              <li>
                <Link to="/formations?domaine=TRIT">TRIT — Informatique et Télécoms</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="pied__titre">Contact</p>
            {/* Coordonnées à fournir par le cabinet. */}
            <p>Coordonnées du cabinet (à compléter)</p>
          </div>
        </div>
        <p className="pied__copyright">© 2026 HIT-T Institute</p>
      </div>
    </footer>
  );
}
