import type { NomPhoto } from "./photos";

/** Photo décorative (alt vide) ; `tailles` aide le navigateur à choisir la bonne largeur. */
export function Photo({
  nom,
  className,
  tailles = "100vw",
}: {
  nom: NomPhoto;
  className?: string;
  tailles?: string;
}) {
  return (
    <img
      src={`/photos/${nom}-800.webp`}
      srcSet={`/photos/${nom}-800.webp 800w, /photos/${nom}-1600.webp 1600w`}
      sizes={tailles}
      width={1600}
      height={1067}
      alt=""
      loading="lazy"
      decoding="async"
      className={className ? `photo ${className}` : "photo"}
    />
  );
}

/** Bandeau pleine largeur sous l'en-tête (écrans 03, 09, 19 et M1) ; `grand` sur l'accueil. */
export function Bandeau({ nom, grand = false }: { nom: NomPhoto; grand?: boolean }) {
  return (
    <div className={grand ? "bandeau bandeau--grand" : "bandeau"}>
      <img
        src={`/photos/${nom}-800.webp`}
        srcSet={`/photos/${nom}-800.webp 800w, /photos/${nom}-1600.webp 1600w`}
        sizes="100vw"
        width={1600}
        height={1067}
        alt=""
        className="bandeau__photo"
      />
    </div>
  );
}
