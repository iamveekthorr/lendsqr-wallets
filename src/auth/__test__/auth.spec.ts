import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

import { KnexModule } from '~/knex/knex.module';

import { AuthService } from '../auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  dotenv.config();

  let service: AuthService;
  //   let jwtService: JwtService;
  //   let configService: ConfigService;
  let httpService: HttpService;

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
        ,
      ],
      imports: [
        KnexModule.forRootAsync({
          useFactory: async () => ({
            client: process.env.DB_CLIENT,
            connection: {
              host: process.env.DB_HOST,
              port: Number(process.env.DB_PORT),
              user: process.env.DB_USER,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_NAME,
            },
          }),
        }),
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    module.get<JwtService>(JwtService);
    module.get<ConfigService>(ConfigService);
    httpService = module.get<HttpService>(HttpService);
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
        id: '6df520b5-7424-11ef-8931-0242ac150003',
        first_name: 'victor',
        last_name: 'okonkwo',
        email: 'ole@email.com',
        created_at: '2024-09-16T11:08:48.000Z',
        updated_at: '2024-09-16T11:08:48.000Z',
        role: 'user',
        password: 'TJIAWM-2005-tjiawm',
      };

      const mockTokens = {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ZGY1MjBiNS03NDI0LTExZWYtODkzMS0wMjQyYWMxNTAwMDMiLCJyb2xlIjoidXNlciIsImlhdCI6MTcyNjU3NDI5NSwiZXhwIjoxNzI2NjYwNjk1fQ.cxn85ThwkWtZafTxPv5VChYy3-ZUaQYQS6Wncfmc8KI',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ZGY1MjBiNS03NDI0LTExZWYtODkzMS0wMjQyYWMxNTAwMDMiLCJyb2xlIjoidXNlciIsImlhdCI6MTcyNjU3NDI5NSwiZXhwIjoxNzI3MTc5MDk1fQ.cQoz4_DBKMzq9iS0ds8VwF-HoY9hvtiolm4Nu5Sxt5c',
      };

      jest
        .spyOn(service as any, 'generateTokens')
        .mockResolvedValue(mockTokens);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toHaveProperty('tokens', mockTokens);
      expect(result).toHaveProperty('user', mockUser);
    });

    it('should throw AppError on invalid credentials', async () => {
      await expect(
        await service.login({
          email: 'test@example.com',
          password: 'password',
        }),
      ).rejects.toContain('Invalid credentials');
    });
  });

  describe('create', () => {
    it('should create a new user when not blacklisted', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(null));

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
        await service.create({
          email: 'test@example.com',
          password: 'password',
          confirmPassword: 'password',
          first_name: 'Test',
          last_name: 'User',
        }),
      ).rejects.toHaveProperty('data');
    });
  });
});
