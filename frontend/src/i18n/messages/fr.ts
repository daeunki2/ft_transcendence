
import type { Messages } from '../../types/i18n';

export const fr: Messages = {
  landing: {
    title: 'Bienvenue sur Pong',
    login: 'Connexion',
    register: 'Inscription',
  },
  login: {
    title: 'Connexion',
    subtitle: 'Saisissez vos identifiants pour continuer',
    email: 'E-mail',
    password: 'Mot de passe',
    submit: 'Connexion',
    submitting: 'Connexion en cours...',
    footerText: "Vous n'avez pas de compte? ",
    footerLink: "S'inscrire",
  },
  register: {
    title: 'Inscription',
    subtitle: 'Créez votre compte pour commencer',
    email: 'E-mail',
	nick: 'Nickname',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    submit: "S'inscrire",
    submitting: 'Inscription en cours...',
    footerText: 'Vous avez déjà un compte? ',
    footerLink: 'Connexion',
  },
  footer: {
    terms: "Conditions d'utilisation",
    privacy: 'Politique de confidentialité',
  },
  navbar: {
  pong: 'Pong',
  social: 'Amis',
  mySpace: 'Mon espace',
  logout: 'Déconnexion',
},
HomePage: {
  pong: 'Jouer à Pong',
  summary: 'Jouez en ligne contre d’autres joueurs ou affrontez l’IA.',
  match: 'Trouver un match',
  aiGame: 'Jouer contre l’IA',
  gameRule: 'Règles du jeu',
  rule: 'Marquez plus de points que votre adversaire en renvoyant la balle sans la manquer.',
},
  social: {
    title: 'Amis',
    addPlaceholder: 'Entrez le pseudo',
    add: 'Ajouter',
    sendMessage: 'Message',
    startGame: 'Jouer',
    noFriends: 'Pas encore d\'amis',
    remove: 'Supprimer',
    requestsTitle: 'Demandes d\'ami',
    noRequests: 'Aucune demande',
    accept: 'Accepter',
    reject: 'Refuser',
    alertTitle: 'Avis',
    requestSent: 'Demande d\'ami envoyée.',
  },
  chat: {
    inputPlaceholder: 'Tapez le message',
    send: 'Envoyer',
  },
  mySpace: {
    title: 'Mon Espace',
    editAvatar: 'Changer l\'avatar',
    selectAvatar: 'Sélectionner un avatar',
    nickname: 'Pseudo',
    nicknamePlaceholder: 'Entrez votre pseudo',
    save: 'Enregistrer',
    gameHistory: 'Historique des parties',
    noGames: 'Aucune partie jouée',
    cancel: 'retour',
  },
  privacy: {
    title: 'Politique de Confidentialité',
    updatedAt: 'Dernière mise à jour : 2026-04-15',
    backButton: 'Retour',
    section1Title: '1. Données personnelles collectées',
    section1Body:
      'Pour fournir le compte et les fonctionnalités essentielles, nous pouvons collecter l’e-mail, le pseudo, l’identifiant de compte, la valeur de l’avatar sélectionné, ainsi que les données de session de connexion (adresse IP, User-Agent, informations de session de jeton).',
    section2Title: '2. Finalité du traitement',
    section2Body:
      'Nous utilisons les données personnelles pour l’identification des utilisateurs, l’authentification, les fonctionnalités sociales (amis), la sécurité du compte, et l’exploitation du service, y compris la résolution d’incidents.',
    section3Title: '3. Conservation et suppression',
    section3Body:
      'En cas de suppression du compte, les données personnelles sont supprimées sans délai, sauf obligation légale ou politique interne de sécurité. Les données de session/liste noire sont supprimées automatiquement après leur durée de conservation de sécurité.',
    section4Title: '4. Partage à des tiers et sous-traitance',
    section4Body:
      'Nous ne communiquons pas les données personnelles à des tiers sans consentement, sauf obligation légale.',
    section5Title: '5. Droits des utilisateurs',
    section5Body:
      'Les utilisateurs peuvent demander l’accès, la rectification, la suppression ou la limitation du traitement de leurs données via les paramètres du compte ou en contactant l’équipe du projet.',
    section6Title: '6. Cookies et sessions',
    section6Body:
      'Nous utilisons des cookies (jetons Access/Refresh) pour maintenir la session de connexion. Ces cookies servent uniquement à l’authentification et à la sécurité et peuvent être supprimés dans les paramètres du navigateur.',
    section7Title: '7. Contact',
    section7Body:
      'Pour toute question liée à la confidentialité, veuillez contacter l’équipe d’exploitation du projet.',
  },
  termsPage: {
    title: 'Conditions d’Utilisation',
    effectiveDate: 'Date d’entrée en vigueur : 2026-04-15',
    backButton: 'Retour',
    section1Title: '1. Objet',
    section1Body:
      'Les présentes conditions définissent les modalités d’utilisation, les droits, les obligations et les responsabilités liés au service Pong.',
    section2Title: '2. Compte et responsabilité de l’utilisateur',
    section2Body:
      'L’utilisateur doit fournir des informations exactes et est responsable de la gestion de son compte et de ses données d’authentification. Toute utilisation non autorisée suspectée doit être signalée immédiatement.',
    section3Title: '3. Utilisation du service',
    section3Body:
      'L’utilisateur doit utiliser les fonctionnalités de jeu/social conformément aux présentes conditions et aux lois applicables. Le service peut être temporairement interrompu pour maintenance, mise à jour ou gestion d’incident.',
    section4Title: '4. Comportements interdits',
    section4Body:
      'Le vol de compte, les attaques du service, la génération de trafic anormal, les propos injurieux/haineux, la publication de contenus illégaux et l’abus du système sont interdits. En cas de violation, des restrictions ou une suspension du compte peuvent être appliquées.',
    section5Title: '5. Propriété intellectuelle',
    section5Body:
      'Les droits relatifs au logiciel, aux designs, aux marques et aux contenus du service appartiennent à l’opérateur ou aux ayants droit, et ne peuvent être reproduits ou distribués sans autorisation préalable.',
    section6Title: '6. Exclusion et limitation de responsabilité',
    section6Body:
      'L’opérateur n’est pas responsable des dommages causés par un cas de force majeure ou une faute de l’utilisateur, sauf dans les limites prévues par la loi applicable.',
    section7Title: '7. Modification des conditions',
    section7Body:
      'Ces conditions peuvent être modifiées dans le cadre de la loi applicable. Les modifications importantes seront annoncées dans le service. L’utilisation continue après modification vaut acceptation.',
  },
errors: {
    USER_NOT_FOUND: "Utilisateur non trouvé.",
    INVALID_PASSWORD: "Mot de passe incorrect.",
    INVALID_EMAIL_FORMAT: "L'identifiant doit contenir 1 à 20 caractères (lettres ou chiffres uniquement, sans espaces ni caractères spéciaux).",
    USER_ALREADY_EXISTS: "Cet e-mail est déjà utilisé.",
    SERVER_ERROR: "Erreur interne du serveur. Veuillez réessayer plus tard.",
    CANNOT_ADD_SELF: "Vous ne pouvez pas vous ajouter en ami.",
    ALREADY_FRIENDS_OR_REQUESTED: "Vous êtes déjà amis ou une demande est en attente.",
    REQUEST_NOT_FOUND: "Demande d'ami introuvable.",
    REQUEST_NOT_PENDING: "Cette demande n'est plus en attente.",
    FRIEND_NOT_FOUND: "Ami introuvable.",
    NOT_ACCEPTED_FRIENDSHIP: "Cette amitié n'a pas été acceptée.",
    FORBIDDEN: "Vous n'avez pas la permission.",
    NICKNAME_REQUIRED: "Veuillez entrer un pseudo.",
    NICKNAME_NOT_ALLOWED: "Ce pseudo n'est pas autorisé.",
    SESSION_EXPIRED: "Votre session a expiré. Veuillez vous reconnecter.",
  },
  result: {
    success: "Succès",
    false: "OK",
    goLogin: "Aller à la connexion",
  },
};
