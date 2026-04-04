
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
  },
  chat: {
    inputPlaceholder: 'Tapez un message',
    send: 'Envoyer',
  },
  mySpace: {
    title: 'Mon Espace',
    editAvatar: 'Modifier l\'avatar',
    nickname: 'Pseudo',
    nicknamePlaceholder: 'Entrez votre pseudo',
    save: 'Enregistrer',
    gameHistory: 'Historique des parties',
    noGames: 'Aucune partie jouée',
  },
};