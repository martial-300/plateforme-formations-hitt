import sys
from umlsvg import sequence

OUT = sys.argv[1]
NAV, SRV = 'Navigateur', 'Serveur (VPS)'

d3 = sequence('Séquence « Obtenir des recommandations » (RF-06 à RF-10)',
    [('A', 'Apprenant', 'actor'), ('UI', 'Frontend React', 'box', NAV), ('API', 'API FastAPI', 'box', SRV),
     ('M', 'MoteurRecommandation', 'box', SRV), ('DB', 'PostgreSQL', 'db', SRV)],
    [('msg', 'A', 'UI', 'Remplit le questionnaire et valide'),
     ('msg', 'UI', 'API', 'PUT /api/v1/profil (JWT, réponses)'),
     ('self', 'API', 'Vérifie le JWT, valide les données'),
     ('alt', 'données invalides'),
     ('ret', 'API', 'UI', '422 + messages d\'erreur'),
     ('ret', 'UI', 'A', 'Champs à corriger'),
     ('else', 'données valides'),
     ('msg', 'API', 'DB', 'INSERT ou UPDATE profils_apprenants'),
     ('msg', 'API', 'DB', 'SELECT formations'),
     ('ret', 'DB', 'API', '86 formations'),
     ('msg', 'API', 'M', 'recommander(profil, type, budget, k = 5)'),
     ('self', 'M', 'TF-IDF + cosinus, filtre type et budget,\ntop 5, mots-clés communs'),
     ('ret', 'M', 'API', '0 à 5 résultats'),
     ('msg', 'API', 'DB', 'Remplace les recommandations (transaction)'),
     ('alt', 'aucun résultat'),
     ('ret', 'API', 'UI', '200 { recommandations : [] }'),
     ('ret', 'UI', 'A', '« Aucune formation ne correspond »'),
     ('else', 'au moins un résultat'),
     ('ret', 'API', 'UI', '200 { profil, recommandations }'),
     ('ret', 'UI', 'A', 'Formations classées et expliquées'),
     ('end',),
     ('end',),
     ('msg', 'A', 'UI', '« Elle me correspond »'),
     ('msg', 'UI', 'API', 'POST /recommandations/{id}/retour'),
     ('msg', 'API', 'DB', 'UPDATE recommandations SET retour'),
     ('ret', 'API', 'UI', '200'),
     ('ret', 'UI', 'A', 'Avis enregistré (modifiable)')], gap=230)
open(OUT + '/03-sequence-recommandations.svg', 'w').write(d3)

d4 = sequence('Séquence « Connexion avec Google » (RF-13)',
    [('V', 'Visiteur', 'actor'), ('UI', 'Frontend React', 'box'), ('G', 'Google Identity\nServices', 'box'),
     ('API', 'API FastAPI', 'box'), ('DB', 'PostgreSQL', 'db')],
    [('msg', 'V', 'UI', '« Continuer avec Google »'),
     ('msg', 'UI', 'G', 'Ouvre la connexion Google'),
     ('msg', 'V', 'G', 'Choisit son compte\n(nom, prénom, email)'),
     ('ret', 'G', 'UI', 'Jeton d\'identité (id_token)'),
     ('msg', 'UI', 'API', 'POST /api/v1/auth/google { id_token }'),
     ('msg', 'API', 'G', 'Vérifie signature, audience,\nexpiration, email vérifié'),
     ('alt', 'jeton invalide ou email non vérifié'),
     ('ret', 'API', 'UI', '401'),
     ('else', 'compte administrateur'),
     ('ret', 'API', 'UI', '403 (email et mot de passe uniquement)'),
     ('else', 'jeton valide'),
     ('msg', 'API', 'DB', 'Cherche par google_id, sinon par email'),
     ('opt', 'utilisateur inconnu'),
     ('msg', 'API', 'DB', 'INSERT apprenant (sans mot de passe)'),
     ('end',),
     ('ret', 'API', 'UI', '200 { access_token, nouveau_compte }'),
     ('ret', 'UI', 'V', 'Questionnaire ou recommandations'),
     ('end',)], gap=230)
open(OUT + '/04-sequence-google.svg', 'w').write(d4)

d5 = sequence('Séquence « Essayer sans compte » (RF-12)',
    [('V', 'Visiteur', 'actor'), ('UI', 'Frontend React', 'box'), ('API', 'API FastAPI', 'box'),
     ('M', 'MoteurRecommandation', 'box'), ('DB', 'PostgreSQL', 'db')],
    [('msg', 'V', 'UI', '3 réponses (envie, format, budget)'),
     ('msg', 'UI', 'API', 'POST /api/v1/recommandations/apercu'),
     ('self', 'API', 'Limite d\'appels par adresse IP'),
     ('msg', 'API', 'DB', 'SELECT formations'),
     ('ret', 'DB', 'API', '86 formations'),
     ('msg', 'API', 'M', 'recommander(réponse, type, budget, k = 3)'),
     ('ret', 'M', 'API', '3 résultats'),
     ('ret', 'API', 'UI', '200 { 3 formations }'),
     ('note', 'API', 'Aucune écriture en base'),
     ('self', 'UI', 'Garde les réponses en session'),
     ('ret', 'UI', 'V', 'Aperçu + « Créer mon compte »'),
     ('msg', 'V', 'UI', 'Crée son compte'),
     ('ret', 'UI', 'V', 'Questionnaire pré-rempli')], gap=230)
open(OUT + '/05-sequence-apercu.svg', 'w').write(d5)
print('ok')
