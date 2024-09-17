import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import * as bcrypt from 'bcrypt';

import { AuthService } from '../auth.service';
import { KNEX_CONNECTION } from '~/knex/knex.provider';
import { AppError } from '~/common/app-error.common';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  //   let jwtService: JwtService;
  //   let configService: ConfigService;
  let httpService: HttpService;
  let knexMock: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: KNEX_CONNECTION,
          useValue: {
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            first: jest.fn(),
            insert: jest.fn(),
            raw: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    module.get<JwtService>(JwtService);
    module.get<ConfigService>(ConfigService);
    httpService = module.get<HttpService>(HttpService);
    knexMock = module.get(KNEX_CONNECTION);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return user and tokens on successful login', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
      };
      const mockTokens = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      knexMock.first.mockResolvedValue(mockUser);
      jest
        .spyOn(service as any, 'generateTokens')
        .mockResolvedValue(mockTokens);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toEqual({ user: expect.any(Object), tokens: mockTokens });
    });

    it('should throw AppError on invalid credentials', async () => {
      knexMock.first.mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow(AppError);
    });
  });

  describe('create', () => {
    it('should create a new user when not blacklisted', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(null));
      knexMock.insert.mockResolvedValue({});
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.create({
        email: 'test@example.com',
        password: 'password',
        first_name: 'Test',
        last_name: 'User',
        confirmPassword: 'password',
      });

      expect(result).toEqual({ message: 'Account created successfully' });
    });

    it('should throw AppError when user is blacklisted', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of());

      await expect(
        service.create({
          email: 'test@example.com',
          password: 'password',
          confirmPassword: 'password',
          first_name: 'Test',
          last_name: 'User',
        }),
      ).rejects.toThrow(AppError);
    });
  });
});
