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
              <li>
                <Link to="/formations?domaine=TREB">TREB — Électricité et Bâtiment</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="pied__titre">Contact</p>
            {/* Coordonnées de la fiche de formation du cabinet (TREB). */}
            <p>Agoé, Carrefour deux Lions, immeuble GSA, Lomé (Togo)</p>
            <p>(+228) 93 32 77 18 · 97 31 77 52</p>
            <p>
              <a href="https://www.hittechnologie.com" rel="noopener noreferrer">
                Site de HIT-T Institute
              </a>
            </p>
          </div>
        </div>
        <p className="pied__copyright">© 2026 HIT-T Institute</p>
      </div>
    </footer>
  );
}
