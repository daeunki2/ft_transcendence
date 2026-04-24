
import type { Messages } from '../../types/i18n';

export const ko: Messages = {
  landing: {
    title: 'Inflexion 오신 것을 환영합니다',
    login: '로그인',
    register: '회원가입',
  },
  login: {
    title: '로그인',
    subtitle: '계속하려면 정보를 입력하세요',
    id: '아이디',
    password: '비밀번호',
    submit: '로그인',
    submitting: '로그인 중...',
    footerText: '계정이 없으신가요? ',
    footerLink: '회원가입',
  },
  register: {
    title: '회원가입',
    subtitle: '시작하려면 계정을 만들어주세요',
    id  : '아이디 1~20자 영어+숫자 조합',
	  nick: '닉네임 1~20자 영어+숫자 조합',
    password: '비밀번호 4~20자 영어+숫자 조합',
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
    requestsTitle: '친구 요청',
    noRequests: '받은 요청 없음',
    accept: '수락',
    reject: '거절',
    alertTitle: '알림',
    requestSent: '친구 요청을 보냈습니다.',
  },
  chat: {
    inputPlaceholder: '메세지를 입력하세요',
    send: '전송',
  },
  mySpace: {
    title: "{userId}님의 스페이스",
    editAvatar: '아바타 수정',
    selectAvatar: '아바타 선택',
    submitting: '변경중...',
    nickname: '닉네임',
    nicknamePlaceholder: '닉네임을 입력하세요',
    save: '저장',
    gameHistory: '게임 히스토리',
    noGames: '아직 게임 기록이 없습니다',
    cancel: '뒤로가기',
  },
  privacy: {
    title: '개인정보처리방침',
    updatedAt: '최종 업데이트: 2026-04-15',
    backButton: '뒤로가기',
    section1Title: '1. 수집하는 개인정보 항목',
    section1Body:
      '서비스는 회원가입 및 기능 제공을 위해 이메일, 닉네임, 계정 식별자, 프로필 이미지 선택값, 로그인 세션 정보(접속 IP, User-Agent, 토큰 세션 정보)를 수집할 수 있습니다.',
    section2Title: '2. 개인정보 이용 목적',
    section2Body:
      '회원 식별, 로그인/인증 처리, 친구 추가 및 소셜 기능 제공, 계정 보안 유지, 서비스 운영 및 장애 대응 목적으로 개인정보를 이용합니다.',
    section3Title: '3. 보관 및 파기',
    section3Body:
      '회원 탈퇴 시 관련 법령 또는 내부 보안 정책에 따라 보관이 필요한 정보를 제외하고 지체 없이 파기합니다. 인증 세션/블랙리스트 정보는 보안 목적의 유효기간 경과 후 자동 삭제됩니다.',
    section4Title: '4. 제3자 제공 및 처리 위탁',
    section4Body:
      '원칙적으로 이용자 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 따른 요청이 있는 경우 예외적으로 제공될 수 있습니다.',
    section5Title: '5. 이용자 권리',
    section5Body:
      '이용자는 본인 개인정보의 조회, 수정, 삭제, 처리 정지를 요청할 수 있으며, 계정 설정 및 운영팀 문의를 통해 권리를 행사할 수 있습니다.',
    section6Title: '6. 쿠키 및 세션 사용',
    section6Body:
      '로그인 유지를 위해 쿠키(Access/Refresh Token)를 사용합니다. 쿠키는 인증과 보안 목적에만 사용되며, 브라우저 설정에서 삭제할 수 있습니다.',
    section7Title: '7. 문의',
    section7Body: '개인정보 관련 문의가 있으면 프로젝트 운영팀에게 연락해 주세요.',
  },
  termsPage: {
    title: '이용약관',
    effectiveDate: '시행일: 2026-04-15',
    backButton: '뒤로가기',
    section1Title: '1. 목적',
    section1Body:
      '본 약관은 Pong 서비스의 이용 조건, 권리와 의무, 책임 사항을 정하는 것을 목적으로 합니다.',
    section2Title: '2. 계정 및 이용자 책임',
    section2Body:
      '이용자는 정확한 정보를 제공해야 하며, 계정과 인증 정보의 관리 책임은 이용자에게 있습니다. 무단 사용이 의심되는 경우 즉시 운영자에게 알려야 합니다.',
    section3Title: '3. 서비스 이용',
    section3Body:
      '이용자는 서비스 내 게임/소셜 기능을 약관과 관련 법령을 준수하여 이용해야 합니다. 서비스는 점검, 업데이트, 장애 대응을 위해 일시 중단될 수 있습니다.',
    section4Title: '4. 금지 행위',
    section4Body:
      '타인의 계정 도용, 서비스 공격, 비정상 트래픽 유발, 욕설/혐오 표현, 불법 정보 게시, 시스템 악용 행위를 금지합니다. 위반 시 이용 제한 또는 계정 정지 조치가 이루어질 수 있습니다.',
    section5Title: '5. 지적재산권',
    section5Body:
      '서비스와 관련된 소프트웨어, 디자인, 상표, 콘텐츠의 권리는 운영자 또는 정당한 권리자에게 있으며, 이용자는 사전 동의 없이 이를 무단 복제/배포할 수 없습니다.',
    section6Title: '6. 면책 및 책임 제한',
    section6Body:
      '운영자는 천재지변, 불가항력, 이용자 귀책 사유로 인한 손해에 대해 책임을 지지 않습니다. 다만 관련 법령상 면책이 허용되지 않는 범위는 제외합니다.',
    section7Title: '7. 약관 변경',
    section7Body:
      '약관은 관련 법령 범위 내에서 변경될 수 있으며, 중요한 변경 사항은 서비스 내 공지로 안내합니다. 변경 후 서비스를 계속 이용하면 변경 약관에 동의한 것으로 봅니다.',
  },

  errors: {
    USER_NOT_FOUND: "아이디 또는 비밀번호가 올바르지 않습니다.",
    INVALID_PASSWORD: "아이디 또는 비밀번호가 올바르지 않습니다.",
    ID_REQUIRED: "아이디를 입력해 주세요.",
    PASSWORD_REQUIRED: "비밀번호를 입력해 주세요.",
    CONFIRM_PASSWORD_REQUIRED: "비밀번호 확인을 입력해 주세요.",
    INVALID_PASSWORD_FORMAT: "비밀번호가 틀렸습니다.",
    INVALID_ID_FORMAT: "사용할 수 없는 아이디 입니다. 1~20자 영어+숫자조합만 사용가능합니다.",
    INVALID_NICKNAME_FORMAT: "사용할 수 없는 닉네임입니다. 1~20자 영어+숫자조합만 사용가능합니다.",
    USER_ALREADY_EXISTS: "이미 가입된 아이디입니다.",
    NICKNAME_ALREADY_EXISTS: "이미 사용 중인 닉네임입니다.",
    USER_PROFILE_INIT_FAILED: "회원가입은 되었지만 프로필 생성에 실패했습니다. 다시 시도해 주세요.",
    SERVER_ERROR: "서버 오류가 발생했습니다.",
    CANNOT_ADD_SELF: "자기 자신을 친구로 추가할 수 없습니다.",
    ALREADY_FRIENDS_OR_REQUESTED: "이미 친구이거나 요청이 진행 중입니다.",
    REQUEST_NOT_FOUND: "친구 요청을 찾을 수 없습니다.",
    REQUEST_NOT_PENDING: "이미 처리된 요청입니다.",
    FRIEND_NOT_FOUND: "친구를 찾을 수 없습니다.",
    NOT_ACCEPTED_FRIENDSHIP: "수락된 친구 관계가 아닙니다.",
    FORBIDDEN: "권한이 없습니다.",
    NICKNAME_REQUIRED: "닉네임을 입력해 주세요.",
    NICKNAME_NOT_ALLOWED: "사용할 수 없는 닉네임입니다.",
    SESSION_EXPIRED: "세션이 만료되었습니다. 다시 로그인해 주세요.",
  },
  result: {
    success: "성공",
    false: "확인",
    goLogin: "로그인하러 가기",
  }

};
