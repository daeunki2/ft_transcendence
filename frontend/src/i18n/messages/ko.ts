
import type { Messages } from '../../types/i18n';

export const ko: Messages = {
  landing: {
    title: 'Pong에 오신 것을 환영합니다',
    login: '로그인',
    register: '회원가입',
  },
  login: {
    title: '로그인',
    subtitle: '계속하려면 정보를 입력하세요',
    email: '이메일',
    password: '비밀번호',
    submit: '로그인',
    submitting: '로그인 중...',
    footerText: '계정이 없으신가요?',
    footerLink: '회원가입',
  },
  register: {
    title: '회원가입',
    subtitle: '시작하려면 계정을 만들어주세요',
    email: '이메일',
	  nick: '닉네임',
    password: '비밀번호',
    confirmPassword: '비밀번호 확인',
    submit: '회원가입',
    submitting: '가입 처리 중 ',
    footerText: '이미 계정이 있으신가요? ',
    footerLink: '로그인',
  },
  footer: {
    terms: '이용약관',
    privacy: '개인정보처리방침',
  },

  navbar: {
  pong: '퐁',
  social: '친구',
  mySpace: '마이스페이스',
  logout: '로그아웃',
},
    //홈
HomePage: {
  pong: '퐁 게임',
  summary: '다른 플레이어와 온라인으로 플레이하거나 AI와 대결하세요.',
  match: '매칭하기',
  aiGame: 'AI와 게임하기',
  gameRule: '게임 설명',
  rule: '공을 놓치지 않고 상대보다 더 많은 점수를 얻으면 승리합니다.',
},
  social: {
    title: '친구 목록',
    addPlaceholder: '친구 닉네임 입력',
    add: '추가',
    sendMessage: '메세지',
    startGame: '게임 시작',
    noFriends: '아직 친구가 없습니다',
    remove: '삭제',
  },
  chat: {
    inputPlaceholder: '메세지를 입력하세요',
    send: '전송',
  },
  mySpace: {
    title: '마이스페이스',
    editAvatar: '아바타 수정',
    selectAvatar: '아바타 선택',
    nickname: '닉네임',
    nicknamePlaceholder: '닉네임을 입력하세요',
    save: '저장',
    gameHistory: '게임 히스토리',
    noGames: '아직 게임 기록이 없습니다',
    cancel: '뒤로가기',
  },

  errors: {
    USER_NOT_FOUND: "사용자를 찾을 수 없습니다.",
    INVALID_PASSWORD: "비밀번호가 틀렸습니다.",
    USER_ALREADY_EXISTS: "이미 가입된 이메일입니다.",
    SERVER_ERROR: "서버 오류가 발생했습니다.",
    INVALID_EMAIL_FORMAT: "아이디는 영문과 숫자를 포함한 1~20자여야 합니다.",
    INVALID_PASSWORD_FORMAT: "비밀번호는 4~32자 사이여야 합니다.",
  },
  result: {
    success: "성공",
    false: "확인", 
  }

};