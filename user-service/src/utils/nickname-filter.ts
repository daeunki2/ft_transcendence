/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   nickname-filter.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/15 16:10:00 by daeunki2          #+#    #+#             */
/*   Updated: 2026/04/20 21:01:11 by daeunki2         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const bannedWords = [
  '씨발',
  'fuck',
  'bonjour',
] as const;

export function normalizeNickname(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9가-힣]/g, '');
}

export function isNicknameAllowed(nickname: string) {
  const normalized = normalizeNickname(nickname);
  if (!normalized) return false;

  return !bannedWords.some((word) => normalized.includes(normalizeNickname(word)));
}

