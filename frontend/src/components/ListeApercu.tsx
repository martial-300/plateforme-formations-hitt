// Liste classée de l'aperçu (RF-12) : page /essai (écrans 20, M7) et exemple de l'accueil (09).
import { Link } from "react-router-dom";
import type { RecommandationApercu } from "../api/types";
import { DOMAINE_COURT, formaterDuree, formaterMontant, TYPE_COURT } from "../catalogue/libelles";
import { Correspondance } from "./Correspondance";

export function ListeApercu({ recommandations }: { recommandations: RecommandationApercu[] }) {
  return (
    <ol className="apercu-liste">
      {recommandations.map(({ rang, score, mots_cles_communs, formation }) => (
        <li key={formation.id} className="apercu-liste__element">
          <span className="apercu-liste__rang" aria-hidden="true">
            {rang}
          </span>
          <div className="apercu-liste__texte">
            <p className="surtitre">{DOMAINE_COURT[formation.domaine]}</p>
            <h3>
              <Link to={`/formations/${formation.id}`}>{formation.intitule}</Link>
            </h3>
            <p className="apercu-liste__infos">
              {TYPE_COURT[formation.type]} · {formaterDuree(formation)} ·{" "}
              {formaterMontant(formation.cout_promo_fcfa ?? formation.cout_fcfa)}
            </p>
            {mots_cles_communs.length > 0 && (
              <p className="apercu-liste__infos">Mots en commun : {mots_cles_communs.join(", ")}</p>
            )}
          </div>
          <Correspondance score={score} />
        </li>
      ))}
    </ol>
  );
}
