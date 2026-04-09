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
      nickname: 'Nickname',
      nicknamePlaceholder: 'Enter your nickname',
      save: 'Save',
      gameHistory: 'Game History',
      noGames: 'No games played yet',
    },
errors: {
    USER_NOT_FOUND: "User not found.",
    INVALID_PASSWORD: "Invalid password.",
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
  },
  result: {
    success: "Success",
    false: "OK",
  },
};