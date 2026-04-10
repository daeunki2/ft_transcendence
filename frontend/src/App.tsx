/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   App.tsx                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 18:47:36 by daeunki2          #+#    #+#             */
/*   Updated: 2026/04/10 10:20:28 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import SocialPage from './pages/SocialPage';
import MySpacePage from './pages/MySpacePage';
import { useAuthInit } from './hooks/useAuthInit';
import React, { useEffect } from 'react';


function App() {
  const { fetchMe } = useAuthInit();
  
  useEffect(() => {
    fetchMe(); // 앱 진입 시 쿠키가 있다면 유저 정보를 가져옴
  }, []); // 딱 한 번 실행
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/Social" element={<SocialPage />} />
        <Route path="/MySpace" element={<MySpacePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;