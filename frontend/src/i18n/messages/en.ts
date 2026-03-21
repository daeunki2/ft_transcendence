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
    footerText: "Don't have an account?",
    footerLink: 'Register',
	},

	//회원가입
	register: {
    title: 'Register',
    subtitle: 'Create your account to get started',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    submit: 'Register',
    footerText: 'Already have an account?',
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
    pong : 'Pong',
    summary : 'Classic arcade table tennis game',
    gameruel: 'Game Ruel',
    ruel: 'Score points by making the ball pass your opponent’s paddle. \n First to the target score wins.',
    },
};