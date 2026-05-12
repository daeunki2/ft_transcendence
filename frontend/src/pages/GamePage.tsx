// /* ************************************************************************** */
// /*                                                                            */
// /*                                                        :::      ::::::::   */
// /*   GamePage.tsx                                       :+:      :+:    :+:   */
// /*                                                    +:+ +:+         +:+     */
// /*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
// /*                                                +#+#+#+#+#+   +#+           */
// /*   Created: 2026/05/11 21:25:37 by chanypar          #+#    #+#             */
// /*   Updated: 2026/05/12 09:45:14 by chanypar         ###   ########.fr       */
// /*                                                                            */
// /* ************************************************************************** */

// import GameBoard from '../components/game/gameBoard';
// import { useGame } from '../hooks/useGame';
// import { useAuth } from '../contexts/AuthContext';

// export default function GamePage() {
// //   const { user } = useAuth();
// //   // 게임 페이지에 들어오자마자 소켓 연결 및 데이터 수신 시작
// //   const { isConnected, gameState, socketRef } = useGame(user?.userId ?? null);

//   return (
//     <div style={{ 
//       display: 'flex', 
//       flexDirection: 'column', 
//       alignItems: 'center', 
//       backgroundColor: '#1a1a1a', 
//       minHeight: '100vh',
//       color: '#fff' 
//     }}>
//       <h1>PONG MATCH</h1>
      

// 	  {/* 테스트를 위해 조건문을 풀고 무조건 GameBoard를 렌더링합니다. */}
//       {/* <GameBoard socket={socketRef.current} /> */}
// 	  <GameBoard socket={null} />
	  
//       {/* 캔버스 컴포넌트에 소켓 객체만 전달 */}
//       {/* {isConnected ? (
//         <GameBoard socket={socketRef.current} />
//       ) : (
//         <p>서버와 연결을 시도 중입니다...</p>
//       )} */}
      
//       <div style={{ marginTop: '20px' }}>
//         <p>W / S 키로 패들을 조작하세요.</p>
//       </div>
//     </div>
//   );
// }

import GameBoard from '../components/game/GameBoard';

export default function GamePage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      backgroundColor: '#1a1a1a', 
      minHeight: '100vh',
      color: '#fff',
      paddingTop: '40px'
    }}>
      <h1 style={{ marginBottom: '20px' }}>PONG MATCH TEST</h1>
      
      {/* 아무 조건 없이 무조건 렌더링 */}
      <GameBoard />
      
      <p style={{ marginTop: '20px', color: '#888' }}>
        현재는 프론트엔드 렌더링 확인용 테스트 화면입니다.
      </p>
    </div>
  );
}