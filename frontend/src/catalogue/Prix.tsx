import type { Formation } from "../api/types";
import { formaterMontant } from "./libelles";

/** Prix d'une formation : le prix promo, s'il existe, en orange avec l'ancien prix barré. */
export function Prix({ formation, grand = false }: { formation: Formation; grand?: boolean }) {
  const { cout_fcfa, cout_promo_fcfa } = formation;
  const classe = grand ? "prix prix--grand" : "prix";

  if (cout_promo_fcfa === null) {
    return (
      <span className={classe}>
        <span className="prix__montant">{formaterMontant(cout_fcfa)}</span>
      </span>
    );
  }
  return (
    <span className={classe}>
      <del className="prix__ancien">
        <span className="visuellement-masque">Prix normal : </span>
        {formaterMontant(cout_fcfa)}
      </del>
      <ins className="prix__montant prix__montant--promo">
        <span className="visuellement-masque">Prix promotionnel : </span>
        {formaterMontant(cout_promo_fcfa)}
      </ins>
    </span>
  );
}
