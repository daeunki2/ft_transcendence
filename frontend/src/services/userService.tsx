/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   userService.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/10 17:23:09 by chanypar          #+#    #+#             */
/*   Updated: 2026/04/15 14:43:34 by daeunki2         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import apiClient from './apiClient';

interface UpdateFields {
  userPhoto?: number;
  nickname?: string;
}

export const userService = {
  // 로그인한 유저 정보 가져오기
  getMe: async () => {
    // 세 번째 인자(data)는 GET이라서 비워두거나 생략
    return await apiClient('get', 'api/users/me', {});
  },

  updateProfile: async (fields: UpdateFields) => {
	return await apiClient('patch', 'api/users/me', fields);
  }
};