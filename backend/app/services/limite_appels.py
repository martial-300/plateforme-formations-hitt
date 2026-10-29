"""Limite d'appels par adresse IP, en mémoire, pour la route publique de l'aperçu (RF-12).

Fenêtre glissante : au plus `maximum` appels acceptés sur les `fenetre_s` dernières secondes.
Les compteurs vivent dans le processus : ils repartent de zéro au redémarrage, ce qui suffit
pour un seul worker uvicorn (MVP). L'IP est celle qu'uvicorn a lue derrière le proxy
(`--proxy-headers`, `FORWARDED_ALLOW_IPS`) : jamais `X-Forwarded-For` lu à la main.
"""

import time
from collections import deque
from threading import Lock


class LimiteAppels:
    def __init__(self, maximum: int, fenetre_s: float, adresses_max: int = 10_000) -> None:
        self.maximum = maximum
        self.fenetre_s = fenetre_s
        # Au-delà, les adresses sans appel récent sont oubliées : la mémoire reste bornée.
        self.adresses_max = adresses_max
        self._appels: dict[str, deque[float]] = {}
        # Les routes synchrones de FastAPI tournent dans plusieurs threads.
        self._verrou = Lock()

    @property
    def nb_adresses_suivies(self) -> int:
        return len(self._appels)

    def attente(self, adresse: str, maintenant: float | None = None) -> float | None:
        """Enregistre l'appel et renvoie None, ou les secondes à attendre s'il est refusé."""
        if maintenant is None:
            maintenant = time.monotonic()
        debut = maintenant - self.fenetre_s
        with self._verrou:
            appels = self._appels.get(adresse)
            if appels is None:
                if len(self._appels) >= self.adresses_max:
                    self._oublier_inactives(debut)
                appels = self._appels[adresse] = deque()
            while appels and appels[0] <= debut:
                appels.popleft()
            if len(appels) >= self.maximum:
                # Un appel refusé n'est pas enregistré : il ne prolonge pas l'attente.
                return appels[0] - debut
            appels.append(maintenant)
            return None

    def reinitialiser(self) -> None:
        with self._verrou:
            self._appels.clear()

    def _oublier_inactives(self, debut: float) -> None:
        for adresse in [
            a for a, appels in self._appels.items() if not appels or appels[-1] <= debut
        ]:
            del self._appels[adresse]
