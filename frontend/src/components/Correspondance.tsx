// Libellé de correspondance et jauge en 3 segments : le score brut n'est jamais affiché.
// Seuils de docs/uml.md (§ 3, `correspondance()`), à calibrer avec la mesure de précision@5.

const NIVEAUX = [
  { minimum: 0.4, segments: 3, libelle: "Très proche de votre profil" },
  { minimum: 0.3, segments: 2, libelle: "Proche de votre profil" },
  { minimum: 0, segments: 1, libelle: "Peut vous intéresser" },
] as const;

function niveauCorrespondance(score: number) {
  return NIVEAUX.find((niveau) => score >= niveau.minimum) ?? NIVEAUX[NIVEAUX.length - 1];
}

export function Correspondance({ score }: { score: number }) {
  const { segments, libelle } = niveauCorrespondance(score);
  return (
    <div className="correspondance">
      <span className="correspondance__jauge" aria-hidden="true">
        {[1, 2, 3].map((segment) => (
          <span
            key={segment}
            className={segment <= segments ? "correspondance__segment--plein" : undefined}
          />
        ))}
      </span>
      <span className="correspondance__libelle">{libelle}</span>
    </div>
  );
}
