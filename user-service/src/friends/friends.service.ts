// src/friends/friends.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend } from '../entities/friend.entity';
import { User } from '../entities/user.entity';

// 프론트가 받기 편한 응답 형태
export interface FriendListItem {
  friendId: number; // friends 테이블의 row id (삭제할 때 사용)
  userId: string; // 상대방 user id (uuid)
  nickname: string; // 상대방 닉네임
  userPhoto: string; // 상대방 아바타 URL
}

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepo: Repository<Friend>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * 친구 요청 보내기
   * - nickname으로 상대방을 찾고
   * - 본인/중복/이미 친구 케이스를 거른 뒤 pending row를 만든다
   */
  async sendRequest(requesterId: string, nickname: string): Promise<Friend> {
    const addressee = await this.userRepo.findOne({ where: { nickname } });
    if (!addressee) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    if (addressee.userId === requesterId) {
      throw new BadRequestException('CANNOT_ADD_SELF');
    }

    // 양방향 중복 체크: A→B 또는 B→A 어느 쪽이든 있으면 차단
    const existing = await this.friendRepo
      .createQueryBuilder('f')
      .where(
        '(f.requesterId = :a AND f.addresseeId = :b) OR (f.requesterId = :b AND f.addresseeId = :a)',
        { a: requesterId, b: addressee.userId },
      )
      .getOne();
    if (existing) {
      throw new ConflictException('ALREADY_FRIENDS_OR_REQUESTED');
    }

    const friend = this.friendRepo.create({
      requesterId,
      addresseeId: addressee.userId,
      status: 'pending',
    });
    return this.friendRepo.save(friend);
  }

  /**
   * 내 친구 목록 (수락된 친구만)
   * 양방향이므로 requester든 addressee든 본인이 포함된 row는 모두 가져옴
   */
  async getFriends(userId: string): Promise<FriendListItem[]> {
    const rows = await this.friendRepo
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.requester', 'requester')
      .leftJoinAndSelect('f.addressee', 'addressee')
      .where('f.status = :status', { status: 'accepted' })
      .andWhere('(f.requesterId = :uid OR f.addresseeId = :uid)', { uid: userId })
      .getMany();

    return rows.map((row) => {
      const other = row.requesterId === userId ? row.addressee : row.requester;
      return {
        friendId: row.id,
        userId: other.userId,
        nickname: other.nickname,
        userPhoto: other.userPhoto,
      };
    });
  }

  /**
   * 내가 받은 친구 요청 목록 (pending)
   */
  async getReceivedRequests(userId: string): Promise<FriendListItem[]> {
    const rows = await this.friendRepo
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.requester', 'requester')
      .where('f.status = :status', { status: 'pending' })
      .andWhere('f.addresseeId = :uid', { uid: userId })
      .getMany();

    return rows.map((row) => ({
      friendId: row.id,
      userId: row.requester.userId,
      nickname: row.requester.nickname,
      userPhoto: row.requester.userPhoto,
    }));
  }

  /**
   * 친구 요청 수락 — 받은 사람만 수락 가능
   */
  async acceptRequest(userId: string, friendId: number): Promise<Friend> {
    const row = await this.friendRepo.findOne({ where: { id: friendId } });
    if (!row) throw new NotFoundException('REQUEST_NOT_FOUND');
    if (row.addresseeId !== userId) {
      throw new ForbiddenException('FORBIDDEN');
    }
    if (row.status !== 'pending') {
      throw new BadRequestException('REQUEST_NOT_PENDING');
    }
    row.status = 'accepted';
    return this.friendRepo.save(row);
  }

  /**
   * 친구 요청 거절 — 받은 사람만 거절 가능, row 삭제
   */
  async rejectRequest(userId: string, friendId: number): Promise<void> {
    const row = await this.friendRepo.findOne({ where: { id: friendId } });
    if (!row) throw new NotFoundException('REQUEST_NOT_FOUND');
    if (row.addresseeId !== userId) {
      throw new ForbiddenException('FORBIDDEN');
    }
    if (row.status !== 'pending') {
      throw new BadRequestException('REQUEST_NOT_PENDING');
    }
    await this.friendRepo.delete(row.id);
  }

  /**
   * 친구 삭제 — 친구 관계의 양쪽 모두 삭제 가능
   */
  async removeFriend(userId: string, friendId: number): Promise<void> {
    const row = await this.friendRepo.findOne({ where: { id: friendId } });
    if (!row) throw new NotFoundException('FRIEND_NOT_FOUND');
    if (row.requesterId !== userId && row.addresseeId !== userId) {
      throw new ForbiddenException('FORBIDDEN');
    }
    if (row.status !== 'accepted') {
      throw new BadRequestException('NOT_ACCEPTED_FRIENDSHIP');
    }
    await this.friendRepo.delete(row.id);
  }
}
