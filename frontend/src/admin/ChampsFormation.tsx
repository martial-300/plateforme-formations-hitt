// Champs de la fiche formation (écrans 08 et 16), communs à l'ajout et à la modification.
import type { ReactNode } from "react";
import { DOMAINE_COMPLET, DOMAINES, TYPE_COMPLET, TYPES } from "../catalogue/libelles";
import { formaterNombre, lireMontant } from "../questionnaire/reponses";
import {
  UNITES,
  type ChampFormation,
  type ErreursFormation,
  type SaisieFormation,
} from "./saisieFormation";

interface Proprietes {
  saisie: SaisieFormation;
  erreurs: ErreursFormation;
  modifier: (champ: ChampFormation, valeur: string) => void;
  /** Exemples affichés dans les champs vides (écran 16) */
  exemples?: boolean;
}

export function ChampsFormation({ saisie, erreurs, modifier, exemples = false }: Proprietes) {
  function attributs(champ: ChampFormation, aide?: string) {
    const ids = [erreurs[champ] && `${champ}-erreur`, aide].filter(Boolean).join(" ");
    return {
      id: champ,
      className: "champ__saisie",
      value: saisie[champ],
      "aria-invalid": erreurs[champ] ? true : undefined,
      "aria-describedby": ids || undefined,
    };
  }

  function erreur(champ: ChampFormation): ReactNode {
    return erreurs[champ] ? (
      <p id={`${champ}-erreur`} className="champ__erreur">
        {erreurs[champ]}
      </p>
    ) : null;
  }

  // Le montant saisi est remis en forme (« 125000 » → « 125 000 ») en quittant le champ.
  function formaterMontant(champ: "cout_fcfa" | "cout_promo_fcfa") {
    const montant = lireMontant(saisie[champ]);
    if (montant !== null) modifier(champ, formaterNombre(montant));
  }

  return (
    <div className="fiche-formation">
      <div className="champ">
        <label htmlFor="intitule">Intitulé</label>
        <input
          {...attributs("intitule")}
          maxLength={200}
          placeholder={exemples ? "Ex. : Office Excel niveau avancé 2010-2024" : undefined}
          onChange={(e) => modifier("intitule", e.target.value)}
        />
        {erreur("intitule")}
      </div>

      <div className="champ">
        <label htmlFor="description">Description</label>
        <textarea
          {...attributs("description")}
          rows={3}
          placeholder={
            exemples ? "Une à deux phrases : ce que l'apprenant saura faire." : undefined
          }
          onChange={(e) => modifier("description", e.target.value)}
        />
        {erreur("description")}
      </div>

      <div className="fiche-formation__ligne">
        <div className="champ">
          <label htmlFor="domaine">Domaine</label>
          <select {...attributs("domaine")} onChange={(e) => modifier("domaine", e.target.value)}>
            <option value="" disabled>
              Choisir…
            </option>
            {DOMAINES.map((domaine) => (
              <option key={domaine} value={domaine}>
                {DOMAINE_COMPLET[domaine]}
              </option>
            ))}
          </select>
          {erreur("domaine")}
        </div>
        <div className="champ">
          <label htmlFor="type">Type</label>
          <select {...attributs("type")} onChange={(e) => modifier("type", e.target.value)}>
            <option value="" disabled>
              Choisir…
            </option>
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {TYPE_COMPLET[type]}
              </option>
            ))}
          </select>
          {erreur("type")}
        </div>
      </div>

      <div className="fiche-formation__ligne fiche-formation__ligne--quatre">
        <div className="champ">
          <label htmlFor="duree_valeur">Durée</label>
          <input
            {...attributs("duree_valeur")}
            inputMode="decimal"
            autoComplete="off"
            placeholder={exemples ? "Ex. : 3" : undefined}
            onChange={(e) => modifier("duree_valeur", e.target.value)}
          />
          {erreur("duree_valeur")}
        </div>
        <div className="champ">
          <label htmlFor="duree_unite">Unité</label>
          <select
            {...attributs("duree_unite")}
            onChange={(e) => modifier("duree_unite", e.target.value)}
          >
            <option value="" disabled>
              Choisir…
            </option>
            {UNITES.map((unite) => (
              <option key={unite} value={unite}>
                {unite}
              </option>
            ))}
          </select>
          {erreur("duree_unite")}
        </div>
        <div className="champ">
          <label htmlFor="cout_fcfa">Coût (FCFA)</label>
          <input
            {...attributs("cout_fcfa")}
            inputMode="numeric"
            autoComplete="off"
            placeholder={exemples ? "Ex. : 125 000" : undefined}
            onChange={(e) => modifier("cout_fcfa", e.target.value)}
            onBlur={() => formaterMontant("cout_fcfa")}
          />
          {erreur("cout_fcfa")}
        </div>
        <div className="champ">
          <label htmlFor="cout_promo_fcfa">Prix promo (FCFA)</label>
          <input
            {...attributs("cout_promo_fcfa")}
            inputMode="numeric"
            autoComplete="off"
            placeholder={saisie.type === "modulaire" ? "Sans objet" : "Facultatif"}
            disabled={saisie.type === "modulaire" && !saisie.cout_promo_fcfa}
            onChange={(e) => modifier("cout_promo_fcfa", e.target.value)}
            onBlur={() => formaterMontant("cout_promo_fcfa")}
          />
          {erreur("cout_promo_fcfa")}
        </div>
      </div>

      <div className="champ">
        <label htmlFor="mots_cles">Mots-clés</label>
        <textarea
          {...attributs("mots_cles", "mots_cles-aide")}
          rows={3}
          placeholder={
            exemples ? "Ex. : excel, tableur, tableaux croisés dynamiques, reporting" : undefined
          }
          onChange={(e) => modifier("mots_cles", e.target.value)}
        />
        {erreur("mots_cles") ?? (
          <p id="mots_cles-aide" className="champ__aide">
            Séparés par des virgules. Ils servent directement au calcul des recommandations.
          </p>
        )}
      </div>
    </div>
  );
}
