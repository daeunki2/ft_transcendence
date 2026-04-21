import type { Messages } from '../../types/i18n';

export const en: Messages = {
	//랜딩페이지에서 사용할 내용
	landing: {
	title: 'Welcome to Pong',
	login: 'Login',
	register: 'Register',
	},

	//로그인
	login: {
    title: 'Login',
    subtitle: 'Enter your credentials to continue',
    email: 'Email',
    password: 'Password',
    submit: 'Login',
    submitting: 'Logging in...',
    footerText: "Don't have an account? ",
    footerLink: 'Register',
	},

	//회원가입
	register: {
    title: 'Register',
    subtitle: 'Create your account to get started',
    email: 'Email',
	  nick: 'Nickname',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    submit: 'Register',
    submitting: 'Registering...',
    footerText: 'Already have an account? ',
    footerLink: 'Login',
	},

	//하단
	footer: {
    terms: 'Terms',
    privacy: 'Privacy',
	},

    //네비바
    navbar: {
    pong: 'Pong',
    social: 'Social',
    mySpace: 'My Space',
    logout: 'Logout',
    },
    //홈
    HomePage: {
        pong: 'Play Pong',
        summary: 'Play Pong online with other players or against AI.',
        match: 'Find Match',
        aiGame: 'Play vs AI',
        gameRule: 'Game Rules',
        rule: 'Score more points than your opponent by hitting the ball without missing it.',
    },
    //소셜
    social: {
      title: 'Friends',
      addPlaceholder: 'Enter nickname',
      add: 'Add',
      sendMessage: 'Message',
      startGame: 'Start Game',
      noFriends: 'No friends yet',
      remove: 'Remove',
      requestsTitle: 'Friend Requests',
      noRequests: 'No requests',
      accept: 'Accept',
      reject: 'Reject',
      alertTitle: 'Notice',
      requestSent: 'Friend request sent.',
    },
    //채팅
    chat: {
      inputPlaceholder: 'Type a message',
      send: 'Send',
    },
    //프로필
    mySpace: {
      title: 'My Space',
      editAvatar: 'Edit Avatar',
      selectAvatar: 'Select Avatar',
      nickname: 'Nickname',
      nicknamePlaceholder: 'Enter your nickname',
      save: 'Save',
      gameHistory: 'Game History',
      noGames: 'No games played yet',
      cancel: 'cancel',
    },
  privacy: {
    title: 'Privacy Policy',
    updatedAt: 'Last updated: 2026-04-15',
    backButton: 'Back',
    section1Title: '1. Personal Data We Collect',
    section1Body:
      'To provide account and core features, we may collect email, nickname, account identifier, selected profile image value, and login session data (IP address, User-Agent, token session information).',
    section2Title: '2. Purpose of Processing',
    section2Body:
      'We use personal data for user identification, login/authentication, friend and social features, account security, and service operations including troubleshooting.',
    section3Title: '3. Retention and Deletion',
    section3Body:
      'When an account is deleted, personal data is deleted without delay except where retention is required by law or internal security policy. Auth session/blacklist data is automatically removed after its security retention period.',
    section4Title: '4. Third-Party Sharing and Entrustment',
    section4Body:
      'We do not provide personal data to third parties without user consent, except when required by applicable law.',
    section5Title: '5. User Rights',
    section5Body:
      'Users may request access, correction, deletion, or suspension of processing of their personal data through account settings or by contacting the project team.',
    section6Title: '6. Cookies and Sessions',
    section6Body:
      'We use cookies (Access/Refresh Token) to maintain login sessions. Cookies are used only for authentication and security purposes and can be deleted in browser settings.',
    section7Title: '7. Contact',
    section7Body: 'For privacy-related inquiries, please contact the project operation team.',
  },
  termsPage: {
    title: 'Terms of Service',
    effectiveDate: 'Effective date: 2026-04-15',
    backButton: 'Back',
    section1Title: '1. Purpose',
    section1Body:
      'These Terms define the conditions of use, rights, obligations, and liabilities related to the Pong service.',
    section2Title: '2. Account and User Responsibility',
    section2Body:
      'Users must provide accurate information and are responsible for managing their accounts and authentication data. Suspected unauthorized use must be reported immediately.',
    section3Title: '3. Service Usage',
    section3Body:
      'Users must use game/social features in compliance with these Terms and applicable laws. Service may be temporarily interrupted for maintenance, updates, or incident response.',
    section4Title: '4. Prohibited Conduct',
    section4Body:
      'Account theft, service attacks, abnormal traffic generation, abusive/hateful language, illegal content posting, and system abuse are prohibited. Violations may result in restrictions or account suspension.',
    section5Title: '5. Intellectual Property',
    section5Body:
      'Rights to software, designs, trademarks, and contents related to the service belong to the operator or rightful owners, and may not be reproduced or distributed without prior consent.',
    section6Title: '6. Disclaimer and Limitation of Liability',
    section6Body:
      'The operator is not liable for damages caused by force majeure or user fault, except where liability cannot be excluded under applicable law.',
    section7Title: '7. Changes to These Terms',
    section7Body:
      'These Terms may be changed within the scope of applicable law. Material changes will be announced in the service. Continued use after changes constitutes acceptance.',
  },
errors: {
    USER_NOT_FOUND: "User not found.",
    INVALID_PASSWORD: "Invalid password.",
    INVALID_EMAIL_FORMAT: "ID must be 1–20 characters, letters or numbers only (no spaces or special characters).",
    USER_ALREADY_EXISTS: "This email is already registered.",
    SERVER_ERROR: "Internal server error. Please try again later.",
    CANNOT_ADD_SELF: "You cannot add yourself as a friend.",
    ALREADY_FRIENDS_OR_REQUESTED: "You are already friends or a request is pending.",
    REQUEST_NOT_FOUND: "Friend request not found.",
    REQUEST_NOT_PENDING: "This request is no longer pending.",
    FRIEND_NOT_FOUND: "Friend not found.",
    NOT_ACCEPTED_FRIENDSHIP: "This is not an accepted friendship.",
    FORBIDDEN: "You don't have permission to do this.",
    NICKNAME_REQUIRED: "Please enter a nickname.",
    NICKNAME_NOT_ALLOWED: "This nickname is not allowed.",
    SESSION_EXPIRED: "Your session has expired. Please log in again.",
  },
  result: {
    success: "Success",
    false: "OK",
    goLogin: "Go to Login",
  },
};
