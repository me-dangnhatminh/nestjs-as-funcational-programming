import User, { EmailAddress, UserId } from './user.joi';
import { Either as E } from 'effect';
import * as Joi from 'joi';

describe('UserId', () => {
  it('should create a valid UserId', () => {
    const userId = UserId.parse('123');
    expect(E.isRight(userId)).toBe(false);

    const userId2 = UserId.parse('123e4567-e89b-12d3-a456-426614174000');
    expect(E.isRight(userId2)).toBe(true);

    try {
      const id = UserId.of('123e4567-e89b-12d3-a456-426614174000');
      expect(id).toBe('123e4567-e89b-12d3-a456-426614174000');
    } catch (e) {
      expect(false).toBe(true);
    }

    try {
      UserId.of('123');
      expect(false).toBe(true);
    } catch (e) {
      expect(e).toBeInstanceOf(Joi.ValidationError);
    }
  });
});

describe('EmailAddress', () => {
  it('should create a valid EmailAddress', () => {
    const email = EmailAddress.parse('test');
    expect(E.isRight(email)).toBe(false);
    expect(E.isLeft(email)).toBe(true);

    const email2 = EmailAddress.parse('exam@exam.com');
    expect(E.isRight(email2)).toBe(true);
    expect(E.isLeft(email2)).toBe(false);

    try {
      const email = EmailAddress.of('exam@exam.com');
      expect(email).toBe('exam@exam.com');
    } catch (e) {
      expect(false).toBe(true);
    }

    try {
      EmailAddress.of('invalid');
      expect(false).toBe(true);
    } catch (e) {
      expect(e).toBeInstanceOf(Joi.ValidationError);
    }
  });
});

describe('User', () => {
  it('should create a valid User', () => {
    const now = new Date();

    const userR = User.parse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      provider: 'local',
      email: 'test@exam.com',
      password: 'password',
      createdAt: now,
    } as any);
    expect(E.isRight(userR)).toBe(true);
    expect(E.isLeft(userR)).toBe(false);
    expect(E.merge(userR)).toEqual({
      id: '123e4567-e89b-12d3-a456-426614174000',
      provider: 'local',
      email: 'test@exam.com',
      password: 'password',
      createdAt: now,
    });
  });
});
